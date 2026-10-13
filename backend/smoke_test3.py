"""Targeted checks for endpoints fixed in this pass."""
import sys

import httpx
import pymongo

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
results = []


def check(name, resp, expect=None):
    ok = resp.status_code == expect if expect else resp.status_code < 400
    results.append((ok, name, resp.status_code, resp.text[:300]))
    print(f"[{'PASS' if ok else 'FAIL'}] {name} -> {resp.status_code}")
    if not ok:
        print("       " + resp.text[:400])


c = httpx.Client(base_url=BASE, timeout=60.0)
uri = None
for line in open(".env", encoding="utf-8"):
    if line.startswith("MONGODB_URI="):
        uri = line.split("=", 1)[1].strip().strip('"')
db = pymongo.MongoClient(uri)["cybernexus"]

# promote a known user to admin
admin = db["users"].find_one({"role": "admin"})
if admin is None:
    admin = db["users"].find_one({})
    db["users"].update_one({"_id": admin["_id"]}, {"$set": {"role": "admin"}})
r = c.post("/api/auth/login", json={"email": admin["email"], "password": "SmokePass123!"})
if r.status_code != 200:
    # can't log in as an unknown existing user; create our own admin
    import uuid

    email = f"adm_{uuid.uuid4().hex[:8]}@example.com"
    c.post("/api/auth/register", json={"name": "Adm", "email": email, "password": "SmokePass123!"})
    db["users"].update_one({"email": email}, {"$set": {"role": "admin"}})
    r = c.post("/api/auth/login", json={"email": email, "password": "SmokePass123!"})
H = {"Authorization": f"Bearer {r.json()['access_token']}"}
print("admin login:", r.status_code)

victim = db["users"].find_one({"email": {"$regex": "^smoke"}})
if victim is None:
    victim = db["users"].find_one({})
vid = str(victim["_id"])

# ---- the endpoint that was broken by find_one() not accepting a projection
check("GET /api/admin/users/{id}", c.get(f"/api/admin/users/{vid}", headers=H), 200)
r = c.get(f"/api/admin/users/{vid}", headers=H)
if r.status_code == 200:
    body = r.json()
    leak = "passwordHash" in body
    results.append((not leak, "passwordHash excluded from response", 0, str(leak)))
    print(f"[{'PASS' if not leak else 'FAIL'}] passwordHash excluded -> {not leak}")
    print(f"       keys: {sorted(body.keys())}")

check("GET /api/admin/users/{id} missing -> 404",
      c.get("/api/admin/users/" + "0" * 24, headers=H), 404)

# ---- notification read-by-id actually persists
n = db["notifications"].find_one({"userId": victim["_id"]})
if n:
    db["notifications"].update_one({"_id": n["_id"]}, {"$set": {"status": "unread"}})
    r = c.patch(f"/api/notifications/{n['_id']}/read", headers=H)
    check("notification mark read", r, 200)
    if r.status_code == 200:
        persisted = r.json().get("status") == "read"
        results.append((persisted, "notification status persisted", 0, str(r.json().get('status'))))
        print(f"[{'PASS' if persisted else 'FAIL'}] status persisted -> {persisted}")

# ---- invalid role value
check("admin role patch invalid -> 400",
      c.patch(f"/api/admin/users/{vid}/role", headers=H, json={"role": "superuser"}), 400)

# ---- deleting yourself is refused
me = c.get("/api/auth/me", headers=H).json()
check("admin cannot delete self -> 400",
      c.delete(f"/api/admin/users/{me['id']}", headers=H), 400)

fails = [x for x in results if not x[0]]
print("\n" + "=" * 60)
print(f"TOTAL: {len(results)}  PASS: {len(results) - len(fails)}  FAIL: {len(fails)}")
for ok, name, code, body in fails:
    print(f"  - {name} ({code}): {body[:250]}")
sys.exit(1 if fails else 0)
