"""MongoDB connection management using synchronous PyMongo driver."""
import asyncio
import functools
import inspect
from contextlib import asynccontextmanager
from typing import Any, Optional

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings


class MongoDB:
    client: Optional[MongoClient] = None
    database: Optional[Database] = None


mongodb = MongoDB()


def get_mongo_client() -> MongoClient:
    """Create a new synchronous MongoDB client."""
    client = MongoClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
    )
    # Force connection to verify it works
    client.admin.command("ping")
    return client


async def connect_to_mongodb() -> None:
    """Initialize the MongoDB connection asynchronously."""
    loop = asyncio.get_running_loop()
    client = await loop.run_in_executor(None, get_mongo_client)
    mongodb.client = client
    mongodb.database = client[settings.MONGODB_DB_NAME]
    # Ensure indexes are created
    await ensure_indexes()


async def close_mongodb() -> None:
    """Close the MongoDB connection."""
    if mongodb.client is not None:
        await asyncio.get_running_loop().run_in_executor(None, mongodb.client.close)
        mongodb.client = None
        mongodb.database = None


class AsyncCursor:
    """Async wrapper for PyMongo cursor."""
    
    def __init__(self, cursor):
        self._cursor = cursor
        self._results: list = []
        self._loaded = False
    
    async def _load(self):
        if not self._loaded:
            self._results = await asyncio.get_running_loop().run_in_executor(
                None, list, self._cursor
            )
            self._loaded = True
    
    def sort(self, key: str, direction: int):
        self._cursor.sort(key, direction)
        return self
    
    def skip(self, n: int):
        self._cursor.skip(n)
        return self
    
    def limit(self, n: int):
        self._cursor.limit(n)
        return self
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        await self._load()
        if self._results:
            return self._results.pop(0)
        raise StopAsyncIteration


class AsyncMockCursor:
    """Async wrapper for mongomock_motor cursor."""
    
    def __init__(self, cursor):
        self._cursor = cursor
        self._results: list = []
        self._loaded = False
    
    async def _load(self):
        if not self._loaded:
            self._results = await self._cursor.to_list(length=None)
            self._loaded = True
    
    def sort(self, key: str, direction: int):
        self._cursor.sort(key, direction)
        return self
    
    def skip(self, n: int):
        self._cursor.skip(n)
        return self
    
    def limit(self, n: int):
        self._cursor.limit(n)
        return self
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        await self._load()
        if self._results:
            return self._results.pop(0)
        raise StopAsyncIteration


# Collection accessors that return async-compatible wrappers
class SyncCollection:
    """Wrapper to provide async-compatible interface for both synchronous PyMongo and async mock (mongomock_motor)."""
    
    def __init__(self, collection):
        self._collection = collection
        # Detect if the collection is async (mongomock_motor) or sync (PyMongo)
        self._is_async = hasattr(collection.find_one, '__call__') and inspect.iscoroutinefunction(collection.find_one)
    
    def _run_sync(self, func, *args, **kwargs):
        """Run a synchronous function in executor.

        ``loop.run_in_executor`` only forwards positional arguments, so any
        keyword arguments are bound with ``functools.partial`` first.
        """
        if kwargs:
            func = functools.partial(func, *args, **kwargs)
            args = ()
        return asyncio.get_running_loop().run_in_executor(None, func, *args)
    
    async def _call(self, method_name, *args, **kwargs):
        """Call a method on the underlying collection, handling both sync and async."""
        method = getattr(self._collection, method_name)
        if self._is_async:
            return await method(*args, **kwargs)
        else:
            return await self._run_sync(method, *args, **kwargs)
    
    async def find_one(self, query: dict, projection: dict = None) -> Optional[dict]:
        return await self._call('find_one', query, projection)
    
    async def find_one_and_update(self, query: dict, update: dict, return_document: bool = False) -> Optional[dict]:
        from pymongo import ReturnDocument
        # ReturnDocument.BEFORE/AFTER are plain bools; they MUST be passed as the
        # ``return_document`` keyword. PyMongo's third positional parameter is
        # ``projection``, so passing them positionally raises a TypeError.
        documents_after = ReturnDocument.AFTER if return_document else ReturnDocument.BEFORE
        if self._is_async:
            # mongomock_motor takes a plain boolean
            return await self._collection.find_one_and_update(
                query, update, return_document=return_document
            )
        return await self._run_sync(
            self._collection.find_one_and_update,
            query,
            update,
            return_document=documents_after,
        )
    
    async def insert_one(self, doc: dict) -> Any:
        return await self._call('insert_one', doc)
    
    async def update_one(self, query: dict, update: dict) -> Any:
        return await self._call('update_one', query, update)
    
    async def update_many(self, query: dict, update: dict) -> Any:
        return await self._call('update_many', query, update)
    
    async def delete_one(self, query: dict) -> Any:
        return await self._call('delete_one', query)
    
    async def delete_many(self, query: dict) -> Any:
        return await self._call('delete_many', query)
    
    async def count_documents(self, query: dict) -> int:
        return await self._call('count_documents', query)
    
    async def create_index(self, keys: Any, unique: bool = False) -> str:
        return await self._call('create_index', keys, unique)
    
    async def aggregate(self, pipeline: list) -> Any:
        if self._is_async:
            cursor = self._collection.aggregate(pipeline)
            return await cursor.to_list(length=None)
        else:
            return await self._run_sync(lambda: list(self._collection.aggregate(pipeline)))
    
    def find(self, query: dict, projection: dict = None, **kwargs):
        if self._is_async:
            return AsyncMockCursor(self._collection.find(query, projection, **kwargs))
        else:
            return AsyncCursor(self._collection.find(query, projection, **kwargs))
    
    async def find_with_projection(self, query: dict, projection: dict = None, **kwargs):
        return self.find(query, projection, **kwargs)


class SyncDatabase:
    """Wrapper around PyMongo Database to provide async-compatible collections."""
    
    def __init__(self, database: Database):
        self._database = database
    
    def __getitem__(self, name: str) -> SyncCollection:
        return SyncCollection(self._database[name])


def get_database() -> SyncDatabase:
    """Get the database instance with async-compatible collections."""
    if mongodb.database is None:
        raise RuntimeError("Database is not connected. Call connect_to_mongodb() first.")
    return SyncDatabase(mongodb.database)


def get_raw_database() -> Database:
    """Get the raw PyMongo database instance for direct operations (e.g., index creation)."""
    if mongodb.database is None:
        raise RuntimeError("Database is not connected. Call connect_to_mongodb() first.")
    return mongodb.database


async def ensure_indexes() -> None:
    """Create necessary indexes for collections."""
    db = get_raw_database()
    
    # Users collection indexes
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["users"].create_index("email", unique=True)
    )
    
    # Scan history indexes
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["scan_history"].create_index("userId")
    )
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["scan_history"].create_index("createdAt")
    )
    
    # Search history indexes
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["search_history"].create_index("userId")
    )
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["search_history"].create_index("createdAt")
    )
    
    # Reports indexes
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["reports"].create_index("userId")
    )
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["reports"].create_index("scanId")
    )
    
    # Notifications indexes
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["notifications"].create_index("userId")
    )
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["notifications"].create_index("createdAt")
    )
    
    # Tasks indexes
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["tasks"].create_index("userId")
    )
    await asyncio.get_running_loop().run_in_executor(
        None, lambda: db["tasks"].create_index("status")
    )