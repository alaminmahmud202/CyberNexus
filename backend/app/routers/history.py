"""History routes: scan history and threat-intel search history.

Both listings are scoped to the authenticated user and sorted newest first.
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.db.collections import scan_history, search_history, serialize_doc
from app.db.mongodb import get_database
from app.models.schemas import ScanHistoryRecord, SearchHistoryRecord

router = APIRouter(
    prefix="/api/history",
    tags=["history"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/scans", response_model=List[ScanHistoryRecord])
async def list_scans(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    service_type: Optional[str] = Query(default=None),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[ScanHistoryRecord]:
    db = get_database()
    query: Dict[str, Any] = {"userId": current_user["id"]}
    if service_type:
        query["serviceType"] = service_type

    cursor = (
        scan_history(db)
        .find(query)
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
    )
    return [ScanHistoryRecord(**serialize_doc(doc)) async for doc in cursor]


@router.get("/search", response_model=List[SearchHistoryRecord])
async def list_searches(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[SearchHistoryRecord]:
    db = get_database()
    cursor = (
        search_history(db)
        .find({"userId": current_user["id"]})
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
    )
    return [SearchHistoryRecord(**serialize_doc(doc)) async for doc in cursor]
