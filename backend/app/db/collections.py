"""MongoDB collection names, accessors, indexes, and serialization helpers."""
from typing import Any, Dict

from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase

USERS = "users"
SCAN_HISTORY = "scan_history"
SEARCH_HISTORY = "search_history"
REPORTS = "reports"
NOTIFICATIONS = "notifications"
TASKS = "tasks"


def users(db: AsyncIOMotorDatabase) -> AsyncIOMotorCollection:
    return db[USERS]


def scan_history(db: AsyncIOMotorDatabase) -> AsyncIOMotorCollection:
    return db[SCAN_HISTORY]


def search_history(db: AsyncIOMotorDatabase) -> AsyncIOMotorCollection:
    return db[SEARCH_HISTORY]


def reports(db: AsyncIOMotorDatabase) -> AsyncIOMotorCollection:
    return db[REPORTS]


def notifications(db: AsyncIOMotorDatabase) -> AsyncIOMotorCollection:
    return db[NOTIFICATIONS]


def tasks(db: AsyncIOMotorDatabase) -> AsyncIOMotorCollection:
    return db[TASKS]


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await db[USERS].create_index("email", unique=True)
    await db[SCAN_HISTORY].create_index([("userId", 1), ("createdAt", -1)])
    await db[SEARCH_HISTORY].create_index([("userId", 1), ("createdAt", -1)])
    await db[REPORTS].create_index([("userId", 1), ("createdAt", -1)])
    await db[REPORTS].create_index("scanId")
    await db[NOTIFICATIONS].create_index([("userId", 1), ("createdAt", -1)])
    await db[TASKS].create_index([("userId", 1), ("createdAt", -1)])
    await db[TASKS].create_index("status")


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Return a copy of a Mongo document with _id renamed to id (str)."""
    data = dict(doc)
    if "_id" in data:
        data["id"] = str(data.pop("_id"))
    return data
