"""End-to-end smoke test against a running server. Usage: python smoke_test.py [base_url]"""
import sys
import time
import uuid

import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
RESULTS = []


def check(name, resp, expect_status=None):
    ok = resp.status_code == expect_status if expect_status else resp.status_code < 400
    body = resp.text[:300]
    RESULTS.append((ok, name, resp.status_code, body))
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] {name} -> {resp.status_code}")
    if not ok:
        print(f"       {body}\n")


def main():
    c = httpx.Client(base_url=BASE, timeout=60.0)
    email = f"smoke_{uuid.uuid4().hex[:8]}@example.com"
    password = "SmokePass123!"
    name = "Smoke Tester"

    check("health", c.get("/health"), 200)

    r = c.post("/api/auth/register", json={"name": name, "email": email, "password": password})
    check("register", r, 201)
    if r.status_code >= 400:
        return finish()

    r = c.post("/api/auth/login", json={"email": email, "password": password})
    check("login", r, 200)
    if r.status_code >= 400:
        return finish()
    tok = r.json().get("accessToken") or r.json().get("access_token")
    if not tok:
        print(f"       no accessToken in {r.json()}")
        RESULTS.append((False, "login token extract", 0, str(r.json())))
        return finish()
    H = {"Authorization": f"Bearer {tok}"}
    refresh = r.json().get("refreshToken") or r.json().get("refresh_token")

    check("me", c.get("/api/auth/me", headers=H), 200)
    if refresh:
        check("refresh", c.post("/api/auth/refresh", json={"refresh_token": refresh}), 200)

    # auth failure path
    check("me w/o token", c.get("/api/auth/me"), 401)

    # scans (local logic, no external keys needed)
    check("scan/password", c.post("/api/scan/password", headers=H, json={"password": "Password123"}), 200)
    check("scan/headers", c.post("/api/scan/headers", headers=H, json={"url": "https://example.com"}), 200)
    check("scan/email-header", c.post("/api/scan/email-header", headers=H, json={
        "raw_headers": "From: a@b.com\nTo: c@d.com\nSubject: hi\nMessage-ID: <1@x>"
    }), 200)
    check("scan/ssl", c.post("/api/scan/ssl", headers=H, json={"host": "example.com", "port": 443}), 200)

    # history
    r = c.get("/api/history/scans", headers=H)
    check("history/scans", r, 200)
    scan_id = None
    if r.status_code == 200 and r.json():
        scan_id = r.json()[0].get("id") or r.json()[0].get("_id")

    check("history/search", c.get("/api/history/search", headers=H), 200)

    if scan_id:
        check("scan/explain", c.post(f"/api/scan/explain/{scan_id}", headers=H, json={"question": "what?"}), 200)

    # tasks, notifications, reports, chat
    check("tasks", c.get("/api/tasks", headers=H), 200)
    check("notifications", c.get("/api/notifications", headers=H), 200)
    check("notif unread-count", c.get("/api/notifications/unread-count", headers=H), 200)
    check("notif read-all", c.patch("/api/notifications/read-all", headers=H), 200)
    check("reports", c.get("/api/reports", headers=H), 200)
    check("reports create", c.post("/api/reports", headers=H, json={"scanId": scan_id or ""}), 202)
    check("chat", c.post("/api/chat", headers=H, json={"message": "hello"}), 200)

    # admin (user is not admin -> expect 403)
    check("admin/stats (non-admin)", c.get("/api/admin/stats", headers=H), 403)

    # external-API scans (may 5xx if keys missing/blocked)
    check("scan/url", c.post("/api/scan/url", headers=H, json={"url": "https://example.com"}), 200)
    check("scan/ip", c.post("/api/scan/ip", headers=H, json={"ip": "8.8.8.8"}), 200)
    check("scan/domain", c.post("/api/scan/domain", headers=H, json={"domain": "example.com"}), 200)

    return finish()


def finish():
    fails = [x for x in RESULTS if not x[0]]
    print("\n" + "=" * 60)
    print(f"TOTAL: {len(RESULTS)}  PASS: {len(RESULTS) - len(fails)}  FAIL: {len(fails)}")
    for ok, name, code, body in fails:
        print(f"  - {name} ({code}): {body[:200]}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
