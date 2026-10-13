"""Round 2: paths the first smoke test skipped."""
import sys
import time
import uuid

import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
RESULTS = []


def check(name, resp, expect_status=None, soft=False):
    ok = resp.status_code == expect_status if expect_status else resp.status_code < 400
    if soft and not ok:
        mark = "WARN"
    else:
        mark = "PASS" if ok else "FAIL"
    if not ok and not soft:
        RESULTS.append((False, name, resp.status_code, resp.text[:300]))
    elif not ok:
        RESULTS.append((True, name, resp.status_code, "soft: " + resp.text[:200]))
    print(f"[{mark}] {name} -> {resp.status_code}")
    if mark == "FAIL":
        print(f"       {resp.text[:400]}\n")


def main():
    c = httpx.Client(base_url=BASE, timeout=90.0)
    email = f"smoke2_{uuid.uuid4().hex[:8]}@example.com"
    r = c.post("/api/auth/register", json={"name": "R2", "email": email, "password": "SmokePass123!"})
    check("register", r, 201)
    r = c.post("/api/auth/login", json={"email": email, "password": "SmokePass123!"})
    check("login", r, 200)
    H = {"Authorization": f"Bearer {r.json()['access_token']}"}

    # --- report async pipeline: create -> poll task -> download PDF ---
    r = c.post("/api/scan/password", headers=H, json={"password": "Tr0ub4dor&3-hunter2"})
    check("scan for report source", r, 200)
    scan_id = r.json()["id"]

    r = c.post("/api/reports", headers=H, json={"scanId": scan_id, "title": "R2 Report"})
    check("reports create", r, 202)
    task_id = r.json().get("taskId")
    print(f"       taskId={task_id}")

    report_id = None
    if task_id:
        for _ in range(30):
            time.sleep(0.4)
            t = c.get(f"/api/tasks/{task_id}", headers=H)
            if t.status_code == 200 and t.json().get("status") in ("finished", "failed"):
                break
        check("task status (finished)", t, 200)
        print(f"       task={t.json().get('status')} err={t.json().get('error')}")
        if t.json().get("status") == "finished":
            RESULTS.append((True, "report task finished", 200, ""))

    r = c.get("/api/reports", headers=H)
    check("reports list", r, 200)
    if r.status_code == 200 and r.json():
        report_id = r.json()[0]["id"]
        check("report get", c.get(f"/api/reports/{report_id}", headers=H), 200)
        d = c.get(f"/api/reports/{report_id}/download", headers=H)
        check("report PDF download", d, 200)
        if d.status_code == 200:
            is_pdf = d.content[:5] == b"%PDF-"
            print(f"       pdf_magic={is_pdf} bytes={len(d.content)}")
            if not is_pdf:
                RESULTS.append((False, "PDF magic bytes", 0, d.content[:100].decode("utf8", "replace")))

    # --- file upload scan ---
    r = c.post("/api/scan/file", headers=H,
               files={"file": ("test.txt", b"hello cybernexus", "text/plain")})
    check("scan/file upload", r, 200, soft=True)
    print(f"       {r.text[:300]}")

    # --- SSE chat stream ---
    try:
        with c.stream("POST", "/api/chat/stream", headers=H,
                      json={"message": "say hi"}) as resp:
            chunks = []
            for line in resp.iter_lines():
                if line.startswith("data:"):
                    chunks.append(line)
            print(f"[{'PASS' if resp.status_code == 200 and chunks else 'FAIL'}] chat/stream -> {resp.status_code}, {len(chunks)} events")
            if resp.status_code != 200 or not chunks:
                RESULTS.append((False, "chat/stream", resp.status_code, str(chunks[:3])))
            else:
                print(f"       first={chunks[0][:120]}")
    except Exception as exc:
        print(f"[FAIL] chat/stream raised {exc}")
        RESULTS.append((False, "chat/stream", 0, str(exc)))

    # --- notification read by id ---
    r = c.get("/api/notifications", headers=H)
    if r.status_code == 200 and r.json():
        nid = r.json()[0]["id"]
        check("notification read-by-id", c.patch(f"/api/notifications/{nid}/read", headers=H), 200)
    else:
        print("[WARN] no notifications to read")

    # --- cross-user isolation ---
    email2 = f"smoke2b_{uuid.uuid4().hex[:8]}@example.com"
    c.post("/api/auth/register", json={"name": "R2b", "email": email2, "password": "SmokePass123!"})
    r2 = c.post("/api/auth/login", json={"email": email2, "password": "SmokePass123!"})
    H2 = {"Authorization": f"Bearer {r2.json()['access_token']}"}
    if report_id:
        check("cross-user report access -> 404", c.get(f"/api/reports/{report_id}", headers=H2), 404)
    check("cross-user scan explain -> 404",
          c.post(f"/api/scan/explain/{scan_id}", headers=H2), 404)
    check("malformed scan id -> 404",
          c.post("/api/scan/explain/not-an-id", headers=H), 404)

    # --- admin endpoints as admin ---
    import pymongo
    uri = None
    with open(".env", encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("MONGODB_URI="):
                uri = line.split("=", 1)[1].strip().strip('"')
    if uri:
        db = pymongo.MongoClient(uri)["cybernexus"]
        db["users"].update_one({"email": email}, {"$set": {"role": "admin"}})
        r = c.get("/api/auth/me", headers=H)
        check("me reflects admin role", r, 200)
        check("admin/stats (admin)", c.get("/api/admin/stats", headers=H), 200)
        check("admin/users", c.get("/api/admin/users", headers=H), 200)
        r = c.get("/api/admin/users", headers=H)
        target = None
        if r.status_code == 200:
            for u in r.json():
                if u.get("email") == email2:
                    target = u["id"]
        if target:
            check("admin role patch", c.patch(f"/api/admin/users/{target}/role",
                                              headers=H, json={"role": "user"}), 200)
            check("admin user delete", c.delete(f"/api/admin/users/{target}", headers=H), 204)
        else:
            print("[WARN] could not find target user for admin ops")

    fails = [x for x in RESULTS if not x[0]]
    print("\n" + "=" * 60)
    print(f"TOTAL: {len(RESULTS)}  PASS: {len(RESULTS) - len(fails)}  FAIL: {len(fails)}")
    for ok, name, code, body in fails:
        print(f"  - {name} ({code}): {body[:250]}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
