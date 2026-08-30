"""Scan orchestration routes backed by the security services.

Every endpoint requires a JWT, executes the corresponding service,
persists a ScanHistory document, and creates a Notification. Threat-intel
endpoints read provider keys only from server settings; when a key is
missing the scan is stored with status="failed" and a structured error
object in result.
"""
import hashlib
import time
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.deps import get_current_user, parse_object_id
from app.db.collections import (
    notifications,
    scan_history,
    search_history,
    serialize_doc,
)
from app.db.mongodb import get_database
from app.models.schemas import (
    DomainScanRequest,
    EmailHeaderScanRequest,
    ExplanationResponse,
    IpScanRequest,
    PasswordScanRequest,
    ScanHistoryRecord,
    SecurityHeadersScanRequest,
    SslScanRequest,
    UrlScanRequest,
)
from app.services import abuseipdb_client, virustotal_client
from app.services.ai_assistant import AiAssistantError, explain_scan_result
from app.services.email_header_analyzer import analyze_headers
from app.services.password_checker import analyze_password
from app.services.security_headers import audit_headers
from app.services.ssl_checker import inspect_host

router = APIRouter(
    prefix="/api/scan",
    tags=["scan"],
    dependencies=[Depends(get_current_user)],
)

SERVICE_LABELS = {
    "password": "Password strength scan",
    "ssl": "SSL/TLS certificate scan",
    "security_headers": "Security headers scan",
    "email_header": "Email header analysis",
    "threat_intel_url": "Threat intel URL lookup",
    "threat_intel_file": "Threat intel file lookup",
    "threat_intel_domain": "Threat intel domain lookup",
    "threat_intel_ip": "Threat intel IP lookup",
}

REDACTED_INPUT = "[redacted]"
EMAIL_PREVIEW_CHARS = 500
MAX_UPLOAD_BYTES = 32 * 1024 * 1024

SEARCH_TYPES = {
    "threat_intel_url": "url",
    "threat_intel_file": "hash",
    "threat_intel_domain": "domain",
    "threat_intel_ip": "ip",
}


async def _notify_scan_started(user_id: str, service_type: str, target: str) -> None:
    db = get_database()
    label = SERVICE_LABELS.get(service_type, service_type)
    await notifications(db).insert_one(
        {
            "userId": user_id,
            "message": f"{label} started - target: {target}",
            "status": "unread",
            "createdAt": datetime.now(timezone.utc),
        }
    )


async def _persist_scan(
    current_user: Dict[str, Any],
    service_type: str,
    input_value: str,
    result: Dict[str, Any],
    history_status: str = "completed",
    duration_ms: int | None = None,
) -> ScanHistoryRecord:
    db = get_database()
    now = datetime.now(timezone.utc)

    doc = {
        "userId": current_user["id"],
        "serviceType": service_type,
        "input": input_value,
        "result": result,
        "status": history_status,
        "createdAt": now,
    }
    if duration_ms is not None:
        doc["durationMs"] = duration_ms
    await scan_history(db).insert_one(doc)

    label = SERVICE_LABELS.get(service_type, service_type)
    outcome = result.get("verdict") or result.get("status", history_status)
    await notifications(db).insert_one(
        {
            "userId": current_user["id"],
            "message": f"{label} finished - outcome: {outcome}",
            "status": "unread",
            "createdAt": now,
        }
    )

    return ScanHistoryRecord(**serialize_doc(doc))


async def _finish_intel_scan(
    current_user: Dict[str, Any],
    service_type: str,
    input_value: str,
    result: Dict[str, Any],
    duration_ms: int | None = None,
) -> ScanHistoryRecord:
    failed = result.get("status") == "error"
    record = await _persist_scan(
        current_user,
        service_type,
        input_value,
        result,
        history_status="failed" if failed else "completed",
        duration_ms=duration_ms,
    )

    if not failed:
        search_type = SEARCH_TYPES.get(service_type)
        if search_type:
            await search_history(get_database()).insert_one(
                {
                    "userId": current_user["id"],
                    "query": input_value,
                    "searchType": search_type,
                    "createdAt": datetime.now(timezone.utc),
                }
            )
    return record


def _provider_error(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=message)


def _input_error(exc: ValueError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


def _target_error(exc: ValueError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/password", response_model=ScanHistoryRecord)
async def run_password_scan(
    payload: PasswordScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    await _notify_scan_started(current_user["id"], "password", REDACTED_INPUT)
    t0 = time.monotonic()
    result = analyze_password(payload.password)
    duration = int((time.monotonic() - t0) * 1000)
    return await _persist_scan(current_user, "password", REDACTED_INPUT, result, duration_ms=duration)


@router.post("/ssl", response_model=ScanHistoryRecord)
async def run_ssl_scan(
    payload: SslScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    target = f"{payload.host.strip()}:{payload.port}"
    await _notify_scan_started(current_user["id"], "ssl", target)
    t0 = time.monotonic()
    try:
        result = await inspect_host(payload.host.strip(), payload.port)
    except ValueError as exc:
        raise _target_error(exc)
    duration = int((time.monotonic() - t0) * 1000)
    return await _persist_scan(
        current_user, "ssl", target, result, duration_ms=duration
    )


@router.post("/headers", response_model=ScanHistoryRecord)
async def run_security_headers_scan(
    payload: SecurityHeadersScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    target = payload.url.strip()
    await _notify_scan_started(current_user["id"], "security_headers", target)
    t0 = time.monotonic()
    try:
        result = await audit_headers(target)
    except ValueError as exc:
        raise _target_error(exc)
    duration = int((time.monotonic() - t0) * 1000)
    return await _persist_scan(current_user, "security_headers", target, result, duration_ms=duration)


@router.post("/email-header", response_model=ScanHistoryRecord)
async def run_email_header_scan(
    payload: EmailHeaderScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    preview = payload.raw_headers[:EMAIL_PREVIEW_CHARS]
    await _notify_scan_started(current_user["id"], "email_header", preview)
    t0 = time.monotonic()
    result = analyze_headers(payload.raw_headers)
    duration = int((time.monotonic() - t0) * 1000)
    return await _persist_scan(current_user, "email_header", preview, result, duration_ms=duration)


@router.post("/explain/{scan_id}", response_model=ExplanationResponse)
async def explain_scan(
    scan_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ExplanationResponse:
    db = get_database()
    scan_oid = parse_object_id(scan_id, "Scan not found")
    document = await scan_history(db).find_one({"_id": scan_oid, "userId": current_user["id"]})
    if document is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scan not found")

    try:
        outcome = await explain_scan_result(document)
    except AiAssistantError as exc:
        outcome = {
            "status": "error",
            "model": None,
            "explanation": "",
            "error": {"code": "ai_provider_error", "message": str(exc)},
        }
    return ExplanationResponse(**outcome)


@router.post("/url", response_model=ScanHistoryRecord)
async def run_url_scan(
    payload: UrlScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    target = payload.url.strip()
    await _notify_scan_started(current_user["id"], "threat_intel_url", target)
    t0 = time.monotonic()
    try:
        result = await virustotal_client.scan_url(target)
    except virustotal_client.VirusTotalError as exc:
        raise _provider_error(str(exc))
    except ValueError as exc:
        raise _input_error(exc)
    duration = int((time.monotonic() - t0) * 1000)
    return await _finish_intel_scan(
        current_user, "threat_intel_url", target, result, duration
    )


@router.post("/file", response_model=ScanHistoryRecord)
async def run_file_scan(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    content = await file.read()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit",
        )

    digest = hashlib.sha256(content).hexdigest()
    await _notify_scan_started(current_user["id"], "threat_intel_file", f"sha256:{digest}")
    t0 = time.monotonic()
    try:
        result = await virustotal_client.scan_file_hash(digest)
        if result.get("status") == "not_found":
            result = await virustotal_client.upload_file_for_analysis(
                content, file.filename or "uploaded_file"
            )
    except virustotal_client.VirusTotalError as exc:
        raise _provider_error(str(exc))
    except ValueError as exc:
        raise _input_error(exc)
    duration = int((time.monotonic() - t0) * 1000)
    return await _finish_intel_scan(current_user, "threat_intel_file", f"sha256:{digest}", result, duration)


@router.post("/domain", response_model=ScanHistoryRecord)
async def run_domain_scan(
    payload: DomainScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    domain = payload.domain.strip()
    await _notify_scan_started(current_user["id"], "threat_intel_domain", domain)
    t0 = time.monotonic()
    try:
        result = await virustotal_client.domain_report(domain)
    except virustotal_client.VirusTotalError as exc:
        raise _provider_error(str(exc))
    except ValueError as exc:
        raise _input_error(exc)
    duration = int((time.monotonic() - t0) * 1000)
    return await _finish_intel_scan(
        current_user, "threat_intel_domain", result.get("resource", domain), result, duration
    )


@router.post("/ip", response_model=ScanHistoryRecord)
async def run_ip_scan(
    payload: IpScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ScanHistoryRecord:
    ip = payload.ip.strip()
    await _notify_scan_started(current_user["id"], "threat_intel_ip", ip)
    t0 = time.monotonic()
    try:
        result = await abuseipdb_client.get_ip_report(ip)
    except abuseipdb_client.AbuseIPDBError as exc:
        raise _provider_error(str(exc))
    except ValueError as exc:
        raise _input_error(exc)
    duration = int((time.monotonic() - t0) * 1000)
    return await _finish_intel_scan(
        current_user,
        "threat_intel_ip",
        result.get("ip_address", ip),
        result,
        duration,
    )
