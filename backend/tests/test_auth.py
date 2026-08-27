"""Auth flow tests: registration, login, session identity, and JWT guards."""
from app.core.security import create_access_token


def test_health_check_is_open(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "CyberNexus"}


def test_register_login_me_roundtrip(client, register_and_login):
    session = register_and_login()
    me = client.get("/api/auth/me", headers=session["headers"])
    assert me.status_code == 200

    body = me.json()
    assert body["email"] == session["email"]
    assert body["name"] == "Analyst"
    assert "passwordHash" not in body


def test_register_response_never_exposes_hash(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "X", "email": "hashcheck@cybernexus.io", "password": "SuperSecret123"},
    )
    assert response.status_code == 201
    assert "passwordHash" not in response.json()


def test_duplicate_email_rejected_case_insensitively(client, register_and_login):
    session = register_and_login()
    duplicate = client.post(
        "/api/auth/register",
        json={
            "name": "Copycat",
            "email": session["email"].upper(),
            "password": "SuperSecret123",
        },
    )
    assert duplicate.status_code == 409


def test_login_with_wrong_password_fails(client, register_and_login):
    session = register_and_login()
    bad = client.post(
        "/api/auth/login",
        json={"email": session["email"], "password": "WrongPassword1"},
    )
    assert bad.status_code == 401


def test_protected_route_requires_token(client):
    assert client.get("/api/history/scans").status_code == 401
    assert client.get("/api/notifications").status_code == 401
    assert client.post("/api/scan/password", json={"password": "x1y2z3"}).status_code == 401


def test_tampered_token_rejected(client, auth):
    token = auth["tokens"]["access_token"]
    tampered = token[:-4] + "0000"
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tampered}"})
    assert response.status_code == 401


def test_refresh_token_not_accepted_for_api_access(client, auth):
    refresh = auth["tokens"]["refresh_token"]
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {refresh}"})
    assert response.status_code == 401


def test_token_for_deleted_user_rejected(client, auth):
    ghost = create_access_token("000000000000000000000001")
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {ghost}"})
    assert response.status_code == 401
