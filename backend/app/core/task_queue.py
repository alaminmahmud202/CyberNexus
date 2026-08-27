"""Async task queue with MongoDB-backed persistence and notification support."""
import asyncio
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Coroutine, Dict, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.collections import TASKS, notifications, tasks


class TaskStatus(str, Enum):
    PENDING = "pending"
    SCANNING = "scanning"
    PROCESSING = "processing"
    FINISHED = "finished"
    FAILED = "failed"


class TaskQueue:
    """Simple in-process async task queue backed by MongoDB for persistence."""

    def __init__(self, max_concurrent: int = 3):
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._tasks: Dict[str, asyncio.Task] = {}

    async def enqueue(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        task_type: str,
        handler: Callable[..., Coroutine[Any, Any, Any]],
        *args: Any,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> str:
        now = datetime.now(timezone.utc)
        doc = {
            "userId": user_id,
            "type": task_type,
            "status": TaskStatus.PENDING,
            "result": None,
            "error": None,
            "metadata": metadata or {},
            "createdAt": now,
            "updatedAt": now,
        }
        result = await tasks(db).insert_one(doc)
        task_id = str(result.inserted_id)

        await _notify(db, user_id, f"Task queued: {task_type}", task_id)

        loop_task = asyncio.create_task(self._run(db, task_id, user_id, handler, *args, **kwargs))
        self._tasks[task_id] = loop_task
        return task_id

    async def _run(
        self,
        db: AsyncIOMotorDatabase,
        task_id: str,
        user_id: str,
        handler: Callable[..., Coroutine[Any, Any, Any]],
        *args: Any,
        **kwargs: Any,
    ) -> None:
        async with self._semaphore:
            try:
                await _update_status(db, task_id, TaskStatus.SCANNING)
                await _notify(db, user_id, f"Task started: processing", task_id)

                result = await handler(*args, **kwargs)

                await _update_status(
                    db, task_id, TaskStatus.FINISHED, result=result
                )
                await _notify(db, user_id, f"Task completed successfully", task_id)
            except Exception as exc:
                await _update_status(
                    db, task_id, TaskStatus.FAILED, error=str(exc)
                )
                await _notify(db, user_id, f"Task failed: {exc}", task_id)
            finally:
                self._tasks.pop(task_id, None)

    async def get_status(self, db: AsyncIOMotorDatabase, task_id: str) -> Optional[Dict[str, Any]]:
        oid = ObjectId(task_id)
        doc = await tasks(db).find_one({"_id": oid})
        if doc is None:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc

    async def list_user_tasks(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        limit: int = 20,
        skip: int = 0,
    ):
        cursor = (
            tasks(db)
            .find({"userId": user_id})
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        results = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            results.append(doc)
        return results


async def _update_status(
    db: AsyncIOMotorDatabase,
    task_id: str,
    status: TaskStatus,
    result: Any = None,
    error: Optional[str] = None,
) -> None:
    update: Dict[str, Any] = {
        "$set": {"status": status, "updatedAt": datetime.now(timezone.utc)}
    }
    if result is not None:
        update["$set"]["result"] = result
    if error is not None:
        update["$set"]["error"] = error
    await tasks(db).update_one({"_id": ObjectId(task_id)}, update)


async def _notify(
    db: AsyncIOMotorDatabase,
    user_id: str,
    message: str,
    task_id: str,
) -> None:
    await notifications(db).insert_one(
        {
            "userId": user_id,
            "message": message,
            "status": "unread",
            "taskId": task_id,
            "createdAt": datetime.now(timezone.utc),
        }
    )


task_queue = TaskQueue()
