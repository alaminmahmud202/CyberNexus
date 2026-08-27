"""Shared fixtures: in-memory MongoDB swap + authenticated API client helpers."""
import asyncio
import uuid

import pytest
from mongomock_motor import AsyncMongoMockClient


@pytest.fixture()
def mock_db():
    import app.db.mongodb as mdb
    from app.db.collections import ensure_indexes

    database = AsyncMongoMockClient()["cybernexus_test"]
    mdb.mongodb.client = AsyncMongoMockClient()
    mdb.mongodb.database = database

    yield database

    mdb.mongodb.client = None
    mdb.mongodb.database = None


@pytest.fixture()
def client(mock_db):
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app)


@pytest.fixture()
def register_and_login(client):
    """Factory returning {headers, tokens, email, password} for a fresh user."""

    def _factory(email=None, password="SuperSecret123"):
        email = email or f"user-{uuid.uuid4().hex[:10]}@cybernexus.io"
        response = client.post(
            "/api/auth/register",
            json={"name": "Analyst", "email": email, "password": password},
        )
        assert response.status_code == 201, response.text
        login = client.post(
            "/api/auth/login", json={"email": email, "password": password}
        )
        assert login.status_code == 200, login.text
        tokens = login.json()
        return {
            "headers": {"Authorization": f"Bearer {tokens['access_token']}"},
            "tokens": tokens,
            "email": email,
            "password": password,
        }

    return _factory


@pytest.fixture()
def auth(register_and_login):
    return register_and_login()
