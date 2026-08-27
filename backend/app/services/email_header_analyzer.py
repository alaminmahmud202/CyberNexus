"""Raw email header forensic analyzer (regex based, offline).

Unfolds header lines and extracts SPF/DKIM/DMARC verdicts, the From and
Return-Path addresses, and the Received-chain hop count. Flags domain
misalignment between From and Return-Path as a spoofing indicator.
"""
import re
from typing import Any, Dict, List, Optional

VERDICT = r"(pass|fail|softfail|neutral|none|temperror|permerror)"

VERDICT_STATUS = {
    "pass": "safe",
    "fail": "danger",
    "softfail": "warning",
    "neutral": "warning",
    "none": "warning",
    "temperror": "warning",
    "permerror": "warning",
}

STATUS_SEVERITY = {"safe": 0, "unknown": 1, "warning": 2, "danger": 3}


def _unfold(text: str) -> str:
    return re.sub(r"\r?\n[ \t]+", " ", text)


def _header_values(unfolded: str, name: str) -> List[str]:
    return re.findall(rf"(?im)^{name}:[ \t]*(.*)$", unfolded)


def _auth_field(unfolded: str, field: str) -> Optional[str]:
    matches = re.findall(rf"\b{field}\s*=\s*{VERDICT}", unfolded, flags=re.IGNORECASE)
    return matches[-1].lower() if matches else None


def _auth_block(unfolded: str, field: str) -> Dict[str, Any]:
    verdict = _auth_field(unfolded, field)
    if verdict is None:
        return {
            "verdict": None,
            "status": "unknown",
            "detail": f"No {field.upper()} verdict found in Authentication-Results",
        }
    return {
        "verdict": verdict,
        "status": VERDICT_STATUS[verdict],
        "detail": f"{field.upper()} verdict: {verdict}",
    }


def _email_address(value: str) -> Optional[str]:
    angle = re.search(r"<([^>]+)>", value)
    candidate = angle.group(1) if angle else value
    match = re.search(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+", candidate)
    return match.group(0) if match else None


def _domain(address: Optional[str]) -> Optional[str]:
    if not address or "@" not in address:
        return None
    return address.rsplit("@", 1)[1].strip().strip(">").lower()


def analyze_headers(raw_headers: str) -> Dict[str, Any]:
    unfolded = _unfold(raw_headers)

    from_values = _header_values(unfolded, "From")
    return_path_values = _header_values(unfolded, "Return-Path")
    received_values = _header_values(unfolded, "Received")

    from_raw = from_values[-1].strip() if from_values else None
    from_address = _email_address(from_raw) if from_raw else None
    from_domain = _domain(from_address)

    return_path_raw = return_path_values[-1].strip() if return_path_values else None
    return_path_address = _email_address(return_path_raw) if return_path_raw else None
    return_path_domain = _domain(return_path_address)

    hops = []
    for index, line in enumerate(reversed(received_values), start=1):
        hop_from = re.search(r"(?i)\bfrom\s+([^\s;()]+)", line)
        hop_by = re.search(r"(?i)\bby\s+([^\s;()]+)", line)
        hops.append(
            {
                "hop": index,
                "from": hop_from.group(1) if hop_from else None,
                "by": hop_by.group(1) if hop_by else None,
            }
        )

    aligned = bool(from_domain and return_path_domain and from_domain == return_path_domain)

    indicators: List[str] = []
    auth_results = {field: _auth_block(unfolded, field) for field in ("spf", "dkim", "dmarc")}
    for field in ("spf", "dkim", "dmarc"):
        block = auth_results[field]
        if block["verdict"] == "fail":
            indicators.append(f"{field.upper()} validation failed")
        elif block["verdict"] is None:
            indicators.append(f"No {field.upper()} verdict present")

    if from_domain and return_path_domain and not aligned:
        indicators.append(
            f"From domain '{from_domain}' differs from Return-Path domain "
            f"'{return_path_domain}' (possible spoofing)"
        )
    if not received_values:
        indicators.append("No Received headers found - chain cannot be verified")

    severity = max(
        (
            STATUS_SEVERITY[block["status"]]
            for block in list(auth_results.values()) + [{"status": "safe" if aligned else "warning"}]
        ),
        default=STATUS_SEVERITY["warning"],
    )
    overall_status = next(s for s, v in STATUS_SEVERITY.items() if v == severity)

    return {
        "spf": auth_results["spf"],
        "dkim": auth_results["dkim"],
        "dmarc": auth_results["dmarc"],
        "from": from_raw,
        "from_address": from_address,
        "return_path": return_path_raw,
        "hop_count": len(received_values),
        "hops": hops[:15],
        "alignment": {
            "aligned": aligned,
            "from_domain": from_domain,
            "return_path_domain": return_path_domain,
        },
        "indicators": indicators,
        "status": overall_status,
    }
