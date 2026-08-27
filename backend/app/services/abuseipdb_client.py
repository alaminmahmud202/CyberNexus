"""AbuseIPDB API v2 client.

The API key is read exclusively from app.core.config.settings, which is
populated from backend/.env. A missing key returns a structured error
object instead of raising; provider/network failures raise
AbuseIPDBError for the router to map.
"""
import ipaddress
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings

BASE_URL = "https://api.abuseipdb.com/api/v2"
TIMEOUT_SECONDS = 20.0


class AbuseIPDBError(Exception):
    pass


def _missing_key_result() -> Dict[str, Any]:
    return {
        "provider": "abuseipdb",
        "status": "error",
        "error": {
            "code": "missing_api_key",
            "message": "ABUSEIPDB_API_KEY is not configured on the server. "
            "Add it to backend/.env and restart the API.",
        },
    }


def _headers() -> Dict[str, str]:
    return {"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"}


async def _get(path: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(
            base_url=BASE_URL, timeout=TIMEOUT_SECONDS, headers=_headers()
        ) as client:
            response = await client.get(path, params=params)
    except httpx.HTTPError as exc:
        raise AbuseIPDBError(f"AbuseIPDB request failed: {exc}") from exc

    if response.status_code in (401, 403):
        raise AbuseIPDBError("AbuseIPDB rejected the configured API key")
    if response.status_code == 429:
        raise AbuseIPDBError("AbuseIPDB rate limit exceeded")
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise AbuseIPDBError(f"AbuseIPDB returned HTTP {response.status_code}") from exc
    return response.json()


def _derive_status(confidence_score: int) -> str:
    if confidence_score >= 75:
        return "danger"
    if confidence_score >= 25:
        return "warning"
    return "safe"


async def get_ip_report(ip: str, max_age_in_days: int = 90) -> Dict[str, Any]:
    """Fetch the abuse-confidence report for an IPv4/IPv6 address."""
    if not settings.ABUSEIPDB_API_KEY:
        return _missing_key_result()

    try:
        address = ipaddress.ip_address(ip.strip())
    except ValueError as exc:
        raise ValueError(f"'{ip}' is not a valid IP address") from exc

    payload = await _get(
        "check",
        params={"ipAddress": str(address), "maxAgeInDays": str(max_age_in_days)},
    )
    data = payload.get("data", {})
    score = int(data.get("abuseConfidenceScore", 0))

    return {
        "provider": "abuseipdb",
        "status": "completed",
        "ip_address": data.get("ipAddress", str(address)),
        "abuse_confidence_score": score,
        "total_reports": data.get("totalReports", 0),
        "distinct_reporters": data.get("numDistinctUsers", 0),
        "country_code": data.get("countryCode"),
        "isp": data.get("isp"),
        "usage_type": data.get("usageType"),
        "is_tor": bool(data.get("isTor", False)),
        "is_whitelisted": data.get("isWhitelisted"),
        "last_reported_at": data.get("lastReportedAt"),
        "derived_status": _derive_status(score),
    }
