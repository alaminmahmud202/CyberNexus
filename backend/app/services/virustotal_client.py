"""VirusTotal API v3 client.

The API key is read exclusively from app.core.config.settings, which is
populated from backend/.env. A missing key returns a structured error
object instead of raising; provider/network failures raise
VirusTotalError for the router to map.
"""
import base64
import re
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import httpx

from app.core.config import settings
from app.services.security_headers import normalize_url

BASE_URL = "https://www.virustotal.com/api/v3"
TIMEOUT_SECONDS = 20.0

HASH_PATTERN = re.compile(r"^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$")
DOMAIN_PATTERN = re.compile(
    r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$"
)


class VirusTotalError(Exception):
    pass


def _missing_key_result() -> Dict[str, Any]:
    return {
        "provider": "virustotal",
        "status": "error",
        "error": {
            "code": "missing_api_key",
            "message": "VIRUSTOTAL_API_KEY is not configured on the server. "
            "Add it to backend/.env and restart the API.",
        },
    }


def _headers() -> Dict[str, str]:
    return {"x-apikey": settings.VIRUSTOTAL_API_KEY, "accept": "application/json"}


async def _request(
    method: str,
    path: str,
    *,
    data: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, str]] = None,
) -> Optional[Dict[str, Any]]:
    try:
        async with httpx.AsyncClient(
            base_url=BASE_URL, timeout=TIMEOUT_SECONDS, headers=_headers()
        ) as client:
            response = await client.request(method, path, data=data, params=params)
    except httpx.HTTPError as exc:
        raise VirusTotalError(f"VirusTotal request failed: {exc}") from exc

    if response.status_code == 404:
        return None
    if response.status_code in (401, 403):
        raise VirusTotalError("VirusTotal rejected the configured API key")
    if response.status_code == 429:
        raise VirusTotalError("VirusTotal quota exceeded - slow down or upgrade tier")
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise VirusTotalError(
            f"VirusTotal returned HTTP {response.status_code}"
        ) from exc
    return response.json()


def _attributes(payload: Dict[str, Any]) -> Dict[str, Any]:
    return payload.get("data", {}).get("attributes", {})


def _derive_status(stats: Dict[str, int]) -> str:
    malicious = stats.get("malicious", 0)
    suspicious = stats.get("suspicious", 0)
    if malicious >= 3:
        return "danger"
    if malicious >= 1 or suspicious >= 1:
        return "warning"
    return "safe"


def normalize_domain(domain: str) -> str:
    candidate = domain.strip().lower()
    parsed = urlparse(candidate)
    host = parsed.netloc or parsed.path.split("/")[0]
    host = host.split("@")[-1].split(":")[0].rstrip(".")
    if not DOMAIN_PATTERN.match(host):
        raise ValueError(f"'{domain}' is not a valid domain name")
    return host


def _url_identifier(url: str) -> str:
    return base64.urlsafe_b64encode(url.encode()).decode().rstrip("=")


async def scan_url(url: str) -> Dict[str, Any]:
    """Look up an existing URL report; submit the URL when never scanned."""
    if not settings.VIRUSTOTAL_API_KEY:
        return _missing_key_result()

    normalized = normalize_url(url)
    identifier = _url_identifier(normalized)

    existing = await _request("GET", f"urls/{identifier}")
    if existing is not None:
        attributes = _attributes(existing)
        stats = attributes.get("last_analysis_stats", {})
        return {
            "provider": "virustotal",
            "status": "completed",
            "resource": normalized,
            "stats": stats,
            "reputation": attributes.get("reputation"),
            "categories": attributes.get("categories"),
            "last_analysis_date": attributes.get("last_analysis_date"),
            "derived_status": _derive_status(stats),
            "permalink": f"https://www.virustotal.com/gui/url/{identifier}",
        }

    submitted = await _request("POST", "urls", data={"url": normalized})
    analysis_id = (
        submitted.get("data", {}).get("id", identifier) if submitted else identifier
    )
    return {
        "provider": "virustotal",
        "status": "submitted",
        "resource": normalized,
        "analysis_id": analysis_id,
        "detail": "URL submitted for scanning; re-run shortly to retrieve verdicts.",
    }


async def scan_file_hash(file_hash: str) -> Dict[str, Any]:
    """Fetch the report for a previously uploaded file by its digest."""
    if not settings.VIRUSTOTAL_API_KEY:
        return _missing_key_result()

    digest = file_hash.strip().lower()
    if not HASH_PATTERN.match(digest):
        raise ValueError("Provide an MD5, SHA-1, or SHA-256 hexadecimal hash")

    payload = await _request("GET", f"files/{digest}")
    if payload is not None:
        attributes = _attributes(payload)
        stats = attributes.get("last_analysis_stats", {})
        return {
            "provider": "virustotal",
            "status": "completed",
            "resource": digest,
            "file_name": attributes.get("meaningful_name"),
            "type_description": attributes.get("type_description"),
            "size_bytes": attributes.get("size"),
            "threat_label": attributes.get("popular_threat_classification", {}).get(
                "suggested_threat_label"
            ),
            "stats": stats,
            "derived_status": _derive_status(stats),
            "permalink": f"https://www.virustotal.com/gui/file/{digest}",
        }

    return {
        "provider": "virustotal",
        "status": "not_found",
        "resource": digest,
        "detail": "Hash unknown to VirusTotal. File has been submitted for analysis.",
        "submitted_for_analysis": True,
    }


async def upload_file_for_analysis(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Upload a file to VirusTotal for analysis and return the analysis ID."""
    if not settings.VIRUSTOTAL_API_KEY:
        return _missing_key_result()

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS, headers=_headers()) as client:
            response = await client.post(
                f"{BASE_URL}/files",
                files={"file": (filename, file_bytes, "application/octet-stream")},
            )
    except httpx.HTTPError as exc:
        raise VirusTotalError(f"VirusTotal upload failed: {exc}") from exc

    if response.status_code in (401, 403):
        raise VirusTotalError("VirusTotal rejected the configured API key")
    if response.status_code == 429:
        raise VirusTotalError("VirusTotal quota exceeded - slow down or upgrade tier")
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise VirusTotalError(f"VirusTotal returned HTTP {response.status_code}") from exc

    data = response.json()
    analysis_id = data.get("data", {}).get("id", "")
    return {
        "provider": "virustotal",
        "status": "submitted",
        "analysis_id": analysis_id,
        "detail": "File uploaded for analysis. Results will be available shortly.",
        "permalink": f"https://www.virustotal.com/gui/file/{analysis_id}",
    }


async def domain_report(domain: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return _missing_key_result()

    host = normalize_domain(domain)
    payload = await _request("GET", f"domains/{host}")
    if payload is None:
        return {
            "provider": "virustotal",
            "status": "not_found",
            "resource": host,
            "detail": "Domain unknown to VirusTotal.",
        }

    attributes = _attributes(payload)
    stats = attributes.get("last_analysis_stats", {})
    votes = attributes.get("total_votes", {})
    return {
        "provider": "virustotal",
        "status": "completed",
        "resource": host,
        "stats": stats,
        "reputation": attributes.get("reputation"),
        "categories": attributes.get("categories"),
        "community_votes": {
            "harmless": votes.get("harmless", 0),
            "malicious": votes.get("malicious", 0),
        },
        "derived_status": _derive_status(stats),
        "permalink": f"https://www.virustotal.com/gui/domain/{host}",
    }
