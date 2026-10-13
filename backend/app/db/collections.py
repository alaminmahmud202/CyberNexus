"""Collection names, accessors, indexes, and serialization helpers for in-memory storage."""
from typing import Any, Dict

USERS = "users"
SCAN_HISTORY = "scan_history"
SEARCH_HISTORY = "search_history"
REPORTS = "reports"
NOTIFICATIONS = "notifications"
TASKS = "tasks"


def users(db) -> Any:
    return db[USERS]


def scan_history(db) -> Any:
    return db[SCAN_HISTORY]


def search_history(db) -> Any:
    return db[SEARCH_HISTORY]


def reports(db) -> Any:
    return db[REPORTS]


def notifications(db) -> Any:
    return db[NOTIFICATIONS]


def tasks(db) -> Any:
    return db[TASKS]


async def ensure_indexes(db) -> None:
    pass


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Return a copy of a document with _id renamed to id (str)."""
    data = dict(doc)
    if "_id" in data:
        data["id"] = str(data.pop("_id"))
    return data