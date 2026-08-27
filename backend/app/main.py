"""CyberNexus FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.collections import ensure_indexes
from app.db.mongodb import close_mongodb, connect_to_mongodb, get_database
from app.models.schemas import HealthCheck
from app.routers import auth, chat, history, notifications, reports, scan, tasks


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongodb()
    await ensure_indexes(get_database())
    yield
    await close_mongodb()


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        description="Full-stack cybersecurity platform API.",
        version="0.1.0",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(auth.router)
    application.include_router(scan.router)
    application.include_router(history.router)
    application.include_router(reports.router)
    application.include_router(notifications.router)
    application.include_router(tasks.router)
    application.include_router(chat.router)

    return application


app = create_application()


@app.get("/health", response_model=HealthCheck, tags=["health"])
async def health_check() -> HealthCheck:
    return HealthCheck(status="ok", service=settings.APP_NAME)
