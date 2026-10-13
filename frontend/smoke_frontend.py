"""Frontend end-to-end check: pages render + Next.js /api rewrite proxies to the backend."""
import re
import sys
import uuid

import httpx

FRONT = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
BACK = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8000"
results = []


def report():
    fails = [x for x in results if not x[0]]
    print("\n" + "=" * 60)
    print(f"TOTAL: {len(results)}  PASS: {len(results) - len(fails)}  FAIL: {len(fails)}")
    for ok, name, detail in fails:
        print(f"  - {name}: {detail[:250]}")
    return 1 if fails else 0


def check(name, ok, detail=""):
    results.append((ok, name, detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" -> {detail}" if detail else ""))


c = httpx.Client(base_url=FRONT, timeout=90.0, follow_redirects=True)

# --- static/SSR pages ---
for path in ["/", "/login", "/register", "/dashboard", "/history", "/reports"]:
    try:
        r = c.get(path)
        has_body = len(r.text) > 500
        check(f"GET {path}", r.status_code == 200 and has_body,
              f"status={r.status_code} bytes={len(r.text)}")
        if r.status_code >= 500:
            print("       " + r.text[:400])
    except Exception as exc:
        check(f"GET {path}", False, str(exc))

# --- Next.js error/404 boundaries ---
r = c.get("/definitely-not-a-page")
check("404 page", r.status_code == 404, f"status={r.status_code}")

# --- the rewrite proxy: /api/* on port 3000 must reach the backend ---
# Note: next.config.mjs only rewrites `source: "/api/:path*"`, so backend
# routes outside /api (e.g. /health) are intentionally NOT proxied and fall
# through to the Next 404 page. Prove both halves of that.
try:
    r = c.get("/api/this-route-does-not-exist")
    proxied = r.status_code == 404 and "detail" in r.json()
    check("proxy reaches backend for unknown /api/*", proxied,
          f"status={r.status_code} body={r.text[:80]}")
except Exception as exc:
    check("proxy reaches backend for unknown /api/*", False, str(exc))

r = c.get("/health")
check("/health not proxied (outside /api/*)", r.status_code == 404,
      f"status={r.status_code}")

# --- full auth flow THROUGH the frontend proxy (no direct backend calls) ---
email = f"fe_{uuid.uuid4().hex[:8]}@example.com"
password = "FrontendPass123!"

r = c.post("/api/auth/register", json={"name": "FE Tester", "email": email, "password": password})
check("proxy POST /api/auth/register", r.status_code == 201, f"status={r.status_code} {r.text[:160]}")

r = c.post("/api/auth/login", json={"email": email, "password": password})
login_ok = r.status_code == 200 and "access_token" in r.json()
check("proxy POST /api/auth/login", login_ok, f"status={r.status_code}")
if not login_ok:
    sys.exit(report())

token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

r = c.get("/api/auth/me", headers=H)
check("proxy GET /api/auth/me", r.status_code == 200, r.text[:160])

# scans the dashboard UI calls
for name, path, payload in [
    ("scan/password", "/api/scan/password", {"password": "Password123"}),
    ("scan/headers", "/api/scan/headers", {"url": "https://example.com"}),
    ("scan/email-header", "/api/scan/email-header",
     {"raw_headers": "From: a@b.com\nTo: c@d.com\nSubject: hi"}),
]:
    r = c.post(path, headers=H, json=payload)
    check(f"proxy POST {path}", r.status_code == 200, f"status={r.status_code} {r.text[:200]}")

r = c.get("/api/history/scans", headers=H)
check("proxy GET /api/history/scans", r.status_code == 200, f"count={len(r.json()) if r.status_code==200 else r.status_code}")

scan_id = r.json()[0]["id"] if r.status_code == 200 and r.json() else None
if scan_id:
    r = c.post("/api/reports", headers=H, json={"scanId": scan_id})
    check("proxy POST /api/reports", r.status_code == 202, r.text[:160])
    import time

    task_id = r.json().get("taskId") if r.status_code == 202 else None
    report_id = None
    if task_id:
        for _ in range(30):
            time.sleep(0.4)
            t = c.get(f"/api/tasks/{task_id}", headers=H)
            if t.status_code == 200 and t.json().get("status") in ("finished", "failed"):
                break
        check("report task finished", t.json().get("status") == "finished",
              f"status={t.json().get('status')} error={t.json().get('error')}")
    r = c.get("/api/reports", headers=H)
    if r.status_code == 200 and r.json():
        report_id = r.json()[0]["id"]
    if report_id:
        d = c.get(f"/api/reports/{report_id}/download", headers=H)
        is_pdf = d.status_code == 200 and d.content[:5] == b"%PDF-"
        check("proxy GET report PDF", is_pdf, f"status={d.status_code} bytes={len(d.content)}")

r = c.get("/api/notifications", headers=H)
check("proxy GET /api/notifications", r.status_code == 200, f"count={len(r.json()) if r.status_code==200 else r.status_code}")
r = c.get("/api/notifications/unread-count", headers=H)
check("proxy GET unread-count", r.status_code == 200, r.text[:80])

# notification-poller.tsx calls this on every poll
r = c.get("/api/notifications", headers=H)
if r.status_code == 200 and r.json():
    nid = r.json()[0]["id"]
    r = c.patch(f"/api/notifications/{nid}/read", headers=H)
    check("proxy PATCH notification read (poller)", r.status_code == 200,
          f"status={r.status_code} {r.text[:120]}")

r = c.post("/api/chat", headers=H, json={"message": "hello"})
check("proxy POST /api/chat", r.status_code == 200, f"status={r.status_code}")

# backend must be reachable independently too
bc = httpx.Client(base_url=BACK, timeout=30.0)
r = bc.get("/health")
check("backend :8000 direct", r.status_code == 200, r.text[:80])

sys.exit(report())
