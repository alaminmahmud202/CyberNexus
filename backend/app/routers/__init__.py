"""API routers package."""
from app.routers import (
    admin,
    auth,
    chat,
    history,
    notifications,
    reports,
    scan,
    tasks,
)

__all__ = [
    "admin",
    "auth",
    "chat",
    "history",
    "notifications",
    "reports",
    "scan",
    "tasks",
]