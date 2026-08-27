"""Report routes: build, retrieve, and download per-user scan reports."""
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.core.deps import get_current_user, parse_object_id
from app.core.task_queue import task_queue
from app.db.collections import reports, scan_history, serialize_doc
from app.db.mongodb import get_database
from app.models.schemas import ReportCreateRequest, ReportRecord
from app.routers.scan import SERVICE_LABELS

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"],
    dependencies=[Depends(get_current_user)],
)


async def _load_report(db, report_id: str, user_id: str) -> Dict[str, Any]:
    oid = parse_object_id(report_id, "Report not found")
    doc = await reports(db).find_one({"_id": oid, "userId": user_id})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")
    return doc


async def _generate_report_task(
    scan_oid,
    user_id: str,
    title: str,
) -> Dict[str, Any]:
    db = get_database()
    scan = await scan_history(db).find_one({"_id": scan_oid, "userId": user_id})
    if scan is None:
        raise Exception("Source scan not found")

    now = datetime.now(timezone.utc)
    label = SERVICE_LABELS.get(scan["serviceType"], scan["serviceType"])
    final_title = title or f"{label} - {now:%Y-%m-%d %H:%M UTC}"

    result: Dict[str, Any] = scan.get("result", {})
    created_at = scan["createdAt"]
    content = {
        "report_version": 1,
        "generated_at": now.isoformat(),
        "scan": {
            "id": str(scan["_id"]),
            "service_type": scan["serviceType"],
            "input": scan["input"],
            "status": scan["status"],
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
        },
        "result": result,
        "summary": {
            "target": scan["input"],
            "outcome": result.get("verdict") or result.get("status", "n/a"),
            "risk_status": result.get("verdict") or result.get("derived_status") or result.get("status", "n/a"),
        },
    }

    doc = {
        "userId": user_id,
        "scanId": str(scan["_id"]),
        "serviceType": scan["serviceType"],
        "title": final_title,
        "content": content,
        "createdAt": now,
    }
    await reports(db).insert_one(doc)
    return serialize_doc(doc)


@router.get("", response_model=List[ReportRecord])
async def list_reports(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[ReportRecord]:
    db = get_database()
    cursor = (
        reports(db)
        .find({"userId": current_user["id"]})
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
    )
    return [ReportRecord(**serialize_doc(doc)) async for doc in cursor]


@router.post("", response_model=Dict[str, str], status_code=status.HTTP_202_ACCEPTED)
async def create_report(
    payload: ReportCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, str]:
    db = get_database()
    user_id = current_user["id"]

    scan_oid = parse_object_id(payload.scanId, "Source scan not found")
    scan = await scan_history(db).find_one({"_id": scan_oid, "userId": user_id})
    if scan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Source scan not found")

    title = payload.title or f"Report for scan {payload.scanId}"

    task_id = await task_queue.enqueue(
        db,
        user_id,
        "report_generation",
        _generate_report_task,
        scan_oid,
        user_id,
        title,
        metadata={"scanId": payload.scanId},
    )
    return {"taskId": task_id, "status": "pending"}


@router.get("/{report_id}", response_model=ReportRecord)
async def get_report(
    report_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ReportRecord:
    doc = await _load_report(get_database(), report_id, current_user["id"])
    return ReportRecord(**serialize_doc(doc))


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Response:
    from app.services.pdf_generator import generate_report_pdf

    doc = await _load_report(get_database(), report_id, current_user["id"])
    record = serialize_doc(doc)

    try:
        pdf_bytes = generate_report_pdf(record)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {exc}",
        )

    filename = f"cybernexus-report-{record['id']}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
