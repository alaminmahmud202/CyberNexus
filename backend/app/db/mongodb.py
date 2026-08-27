"""Async MongoDB connection management using Motor."""
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


mongodb = MongoDB()


async def connect_to_mongodb() -> None:
    """Create the Motor client and bind the application database (lazy connection)."""
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI)
    mongodb.database = mongodb.client[settings.MONGODB_DB_NAME]


async def close_mongodb() -> None:
    if mongodb.client is not None:
        mongodb.client.close()
        mongodb.client = None
        mongodb.database = None


def get_database() -> AsyncIOMotorDatabase:
    if mongodb.database is None:
        raise RuntimeError("MongoDB is not connected. Call connect_to_mongodb() first.")
    return mongodb.database
