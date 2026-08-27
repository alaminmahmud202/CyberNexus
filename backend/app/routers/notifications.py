"""Notification routes: list, mark-as-read, and mark-all-read, scoped to the authenticated user."""
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, parse_object_id
from app.db.collections import notifications, serialize_doc
from app.db.mongodb import get_database
from app.models.schemas import NotificationRecord

router = APIRouter(
    prefix="/api/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=List[NotificationRecord])
async def list_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    unread_only: bool = Query(default=False),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[NotificationRecord]:
    db = get_database()
    query: Dict[str, Any] = {"userId": current_user["id"]}
    if unread_only:
        query["status"] = "unread"

    cursor = (
        notifications(db)
        .find(query)
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
    )
    return [NotificationRecord(**serialize_doc(doc)) async for doc in cursor]


@router.get("/unread-count")
async def unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, int]:
    db = get_database()
    count = await notifications(db).count_documents(
        {"userId": current_user["id"], "status": "unread"}
    )
    return {"count": count}


@router.patch("/{notification_id}/read", response_model=NotificationRecord)
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> NotificationRecord:
    db = get_database()
    oid = parse_object_id(notification_id, "Notification not found")

    updated = await notifications(db).find_one_and_update(
        {"_id": oid, "userId": current_user["id"]},
        {"$set": {"status": "read"}},
        return_document=True,
    )
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    return NotificationRecord(**serialize_doc(updated))


@router.patch("/read-all")
async def mark_all_read(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, int]:
    db = get_database()
    result = await notifications(db).update_many(
        {"userId": current_user["id"], "status": "unread"},
        {"$set": {"status": "read"}},
    )
    return {"modified": result.modified_count}
