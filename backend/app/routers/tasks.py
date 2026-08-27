"""Task queue routes for monitoring background jobs."""
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, parse_object_id
from app.core.task_queue import task_queue
from app.db.collections import serialize_doc, tasks
from app.db.mongodb import get_database
from app.models.schemas import TaskRecord

router = APIRouter(
    prefix="/api/tasks",
    tags=["tasks"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=List[TaskRecord])
async def list_tasks(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[TaskRecord]:
    db = get_database()
    items = await task_queue.list_user_tasks(db, current_user["id"], limit=limit, skip=skip)
    return [TaskRecord(**item) for item in items]


@router.get("/{task_id}", response_model=TaskRecord)
async def get_task(
    task_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> TaskRecord:
    db = get_database()
    task = await task_queue.get_status(db, task_id)
    if task is None or task["userId"] != current_user["id"]:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return TaskRecord(**task)
