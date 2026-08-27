"""HTTP security header auditor (httpx).

Fetches a URL and evaluates six security headers: HSTS, CSP,
X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and
Permissions-Policy. Produces per-header checks, a 0-100 score, and an
overall safe/warning/danger status.
"""
import re
from typing import Any, Dict
from urllib.parse import urlparse

import httpx

CHECKED_HEADERS = (
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
)

SAFE_REFERRER_POLICIES = {
    "no-referrer",
    "no-referrer-when-downgrade",
    "same-origin",
    "strict-origin",
    "strict-origin-when-cross-origin",
}

MIN_HSTS_MAX_AGE = 15552000  # 180 days, per OWASP guidance

RECOMMENDATIONS = {
    "strict-transport-security": "Add Strict-Transport-Security with max-age of at least 15552000.",
    "content-security-policy": "Define a Content-Security-Policy to mitigate XSS and injection risks.",
    "x-frame-options": "Set X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking.",
    "x-content-type-options": "Set X-Content-Type-Options: nosniff to block MIME sniffing.",
    "referrer-policy": "Set Referrer-Policy to strict-origin-when-cross-origin or stricter.",
    "permissions-policy": "Declare a Permissions-Policy restricting powerful browser features.",
}


def normalize_url(url: str) -> str:
    candidate = url.strip()
    if not candidate.startswith(("http://", "https://")):
        candidate = f"https://{candidate}"
    parsed = urlparse(candidate)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(f"'{url}' is not a valid URL")
    return candidate


def _evaluate(header: str, value: str) -> Dict[str, Any]:
    lowered = value.lower()
    check: Dict[str, Any] = {
        "header": header,
        "present": True,
        "value": value[:300],
        "status": "safe",
        "detail": "",
    }

    if header == "strict-transport-security":
        match = re.search(r"max-age=(\d+)", lowered)
        max_age = int(match.group(1)) if match else 0
        directives = []
        if max_age >= MIN_HSTS_MAX_AGE:
            check["status"] = "safe"
        else:
            check["status"] = "warning"
            directives.append("max-age below recommended 15552000")
        if "includesubdomains" in lowered:
            directives.append("includesSubDomains")
        if "preload" in lowered:
            directives.append("preload")
        check["detail"] = "; ".join(directives) or f"max-age={max_age}"

    elif header == "content-security-policy":
        if "unsafe-inline" in lowered:
            check["status"] = "warning"
            check["detail"] = "Policy allows 'unsafe-inline', weakening XSS protection"
        else:
            check["detail"] = "Policy present"

    elif header == "x-frame-options":
        frame_value = value.strip().upper()
        if frame_value in ("DENY", "SAMEORIGIN"):
            check["detail"] = f"Frame embedding denied ({frame_value})"
        else:
            check["status"] = "warning"
            check["detail"] = f"Unrecognized directive '{frame_value}'"

    elif header == "x-content-type-options":
        if lowered.strip() == "nosniff":
            check["detail"] = "MIME sniffing blocked"
        else:
            check["status"] = "warning"
            check["detail"] = f"Expected 'nosniff', got '{value.strip()}'"

    elif header == "referrer-policy":
        if lowered.strip() in SAFE_REFERRER_POLICIES:
            check["detail"] = f"Policy '{lowered.strip()}' restricts referrer leakage"
        else:
            check["status"] = "warning"
            check["detail"] = f"Weak policy '{value.strip()}'"

    elif header == "permissions-policy":
        check["detail"] = "Permissions-Policy declared"

    return check


def _missing(header: str) -> Dict[str, Any]:
    return {
        "header": header,
        "present": False,
        "value": None,
        "status": "danger",
        "detail": RECOMMENDATIONS[header],
    }


async def audit_headers(url: str, timeout: float = 10.0) -> Dict[str, Any]:
    target = normalize_url(url)
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=timeout,
        headers={"User-Agent": "CyberNexus-Scanner/0.1"},
    ) as client:
        try:
            response = await client.get(target)
        except httpx.TimeoutException as exc:
            raise ValueError(f"Request to '{target}' timed out") from exc
        except httpx.HTTPError as exc:
            raise ValueError(f"Failed to fetch '{target}': {exc}") from exc

    headers = {key.lower(): value for key, value in response.headers.items()}
    checks = [
        _evaluate(h, headers[h]) if h in headers else _missing(h)
        for h in CHECKED_HEADERS
    ]

    weights = {"safe": 1.0, "warning": 0.5, "danger": 0.0}
    score = round(sum(weights[c["status"]] for c in checks) / len(checks) * 100)
    missing_count = sum(1 for c in checks if not c["present"])
    present_count = len(checks) - missing_count
    overall = "safe" if score >= 85 else "warning" if score >= 50 else "danger"

    return {
        "url": str(response.url),
        "status_code": response.status_code,
        "checks": checks,
        "score": score,
        "present_count": present_count,
        "missing_count": missing_count,
        "status": overall,
    }
