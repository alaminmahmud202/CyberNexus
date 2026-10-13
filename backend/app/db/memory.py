"""In-memory database replacement for MongoDB."""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
import asyncio


class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self._documents: List[Dict[str, Any]] = []
        self._lock = asyncio.Lock()
        self._indexes: List[tuple] = []

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            for doc in self._documents:
                if self._match(doc, query):
                    return doc.copy()
        return None

    async def find(self, query: Dict[str, Any]):
        return InMemoryCursor(self, query)

    async def insert_one(self, doc: Dict[str, Any]) -> Any:
        async with self._lock:
            if "_id" not in doc:
                doc["_id"] = ObjectId()
            self._documents.append(doc.copy())
            return InsertOneResult(doc["_id"])

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        async with self._lock:
            for i, doc in enumerate(self._documents):
                if self._match(doc, query):
                    self._apply_update(doc, update)
                    return UpdateResult(1)
        return UpdateResult(0)

    async def update_many(self, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        async with self._lock:
            count = 0
            for doc in self._documents:
                if self._match(doc, query):
                    self._apply_update(doc, update)
                    count += 1
        return UpdateResult(count)

    async def count_documents(self, query: Dict[str, Any]) -> int:
        async with self._lock:
            return sum(1 for doc in self._documents if self._match(doc, query))

    async def create_index(self, keys: Any, unique: bool = False) -> str:
        self._indexes.append((keys, unique))
        return "index_created"

    async def delete_many(self, query: Dict[str, Any]) -> Any:
        async with self._lock:
            original_len = len(self._documents)
            self._documents = [d for d in self._documents if not self._match(d, query)]
            return DeleteResult(original_len - len(self._documents))

    def _match(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for key, value in query.items():
            if key == "_id":
                if isinstance(value, ObjectId):
                    if doc.get("_id") != value:
                        return False
                elif str(doc.get("_id")) != str(value):
                    return False
            elif isinstance(value, dict):
                if not self._match_nested(doc.get(key), value):
                    return False
            else:
                if doc.get(key) != value:
                    return False
        return True

    def _match_nested(self, doc_value: Any, query_value: Dict[str, Any]) -> bool:
        for op, val in query_value.items():
            if op == "$in":
                if doc_value not in val:
                    return False
            elif op == "$ne":
                if doc_value == val:
                    return False
            elif op == "$gte":
                if doc_value < val:
                    return False
            elif op == "$lte":
                if doc_value > val:
                    return False
            elif op == "$gt":
                if doc_value <= val:
                    return False
            elif op == "$lt":
                if doc_value >= val:
                    return False
        return True

    def _apply_update(self, doc: Dict[str, Any], update: Dict[str, Any]) -> None:
        for op, fields in update.items():
            if op == "$set":
                for k, v in fields.items():
                    doc[k] = v
            elif op == "$inc":
                for k, v in fields.items():
                    doc[k] = doc.get(k, 0) + v


class InMemoryCursor:
    def __init__(self, collection: InMemoryCollection, query: Dict[str, Any]):
        self.collection = collection
        self.query = query
        self._sort: List[tuple] = []
        self._skip = 0
        self._limit = 0
        self._results: List[Dict[str, Any]] = []
        self._loaded = False

    async def _load(self):
        if not self._loaded:
            docs = []
            for doc in self.collection._documents:
                if self.collection._match(doc, self.query):
                    docs.append(doc.copy())
            if self._sort:
                reverse = False
                for key, direction in self._sort:
                    if direction == -1:
                        reverse = True
                docs.sort(key=lambda d: d.get(self._sort[0][0], ""), reverse=reverse)
            if self._skip:
                docs = docs[self._skip:]
            if self._limit:
                docs = docs[:self._limit]
            self._results = docs
            self._loaded = True

    def sort(self, key: str, direction: int):
        self._sort = [(key, direction)]
        return self

    def skip(self, n: int):
        self._skip = n
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        await self._load()
        if self._results:
            return self._results.pop(0)
        raise StopAsyncIteration


class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class UpdateResult:
    def __init__(self, modified_count: int):
        self.modified_count = modified_count


class DeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


class InMemoryDatabase:
    def __init__(self):
        self._collections: Dict[str, InMemoryCollection] = {}
        self._lock = asyncio.Lock()

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]

    async def drop_collection(self, name: str) -> None:
        async with self._lock:
            self._collections.pop(name, None)


class InMemoryClient:
    def __init__(self):
        self._databases: Dict[str, InMemoryDatabase] = {}
        self._lock = asyncio.Lock()

    def __getitem__(self, name: str) -> InMemoryDatabase:
        if name not in self._databases:
            self._databases[name] = InMemoryDatabase()
        return self._databases[name]

    def close(self) -> None:
        pass


memory_client = InMemoryClient()
memory_database: Optional[InMemoryDatabase] = None


async def connect_to_memory() -> None:
    global memory_database
    memory_database = memory_client["cybernexus"]


async def close_memory() -> None:
    global memory_database
    memory_database = None


def get_memory_database() -> InMemoryDatabase:
    if memory_database is None:
        raise RuntimeError("Memory database is not connected. Call connect_to_memory() first.")
    return memory_database