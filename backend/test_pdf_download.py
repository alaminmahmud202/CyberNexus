"""Simulate the browser's apiDownload() exactly, through the Next proxy.

Mirrors frontend/src/lib/api.ts apiDownload():
  fetch(path, {headers:{Authorization}})
  -> read Content-Disposition
  -> response.blob()
  -> trigger <a download>
Prints every header so we can see what the browser actually receives.
"""
import re
import sys
import uuid

import httpx

FRONT = "http://localhost:3000"
results = []


def check(name, ok, detail=""):
    results.append((ok, name, detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" -> {detail}" if detail else ""))


c = httpx.Client(base_url=FRONT, timeout=90.0)

# log in
email = f"pdf_{uuid.uuid4().hex[:8]}@example.com"
c.post("/api/auth/register", json={"name": "PDF", "email": email, "password": "PdfTest123!"})
r = c.post("/api/auth/login", json={"email": email, "password": "PdfTest123!"})
token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

# create a scan, then a report
r = c.post("/api/scan/password", headers=H, json={"password": "Tr0ub4dor&3-x"})
scan_id = r.json()["id"]
r = c.post("/api/reports", headers=H, json={"scanId": scan_id})
task_id = r.json()["taskId"]

import time

for _ in range(40):
    time.sleep(0.4)
    t = c.get(f"/api/tasks/{task_id}", headers=H)
    if t.status_code == 200 and t.json().get("status") in ("finished", "failed"):
        break
check("report task finished", t.json().get("status") == "finished", str(t.json().get("error")))

reports = c.get("/api/reports", headers=H).json()
report_id = reports[0]["id"]
check("report exists", bool(report_id), report_id)

# ---- the exact request apiDownload() issues ----
url = f"{FRONT}/api/reports/{report_id}/download"
resp = httpx.get(url, headers=H, timeout=90.0)

print("\n--- response headers the browser sees ---")
for k, v in resp.headers.items():
    print(f"   {k}: {v}")

check("status 200", resp.status_code == 200, str(resp.status_code))
check("content-type is application/pdf",
      resp.headers.get("content-type", "").startswith("application/pdf"),
      resp.headers.get("content-type", ""))
check("content-length > 1000", len(resp.content) > 1000, f"{len(resp.content)} bytes")
check("is a real PDF (%PDF- magic)", resp.content[:5] == b"%PDF-", repr(resp.content[:8]))

# replicate apiDownload's regex verbatim (JS .match() == Python re.search)
disposition = resp.headers.get("content-disposition", "")
match = re.search(r'filename="([^"]+)"', disposition)
check("Content-Disposition present", bool(disposition), repr(disposition))
check("filename regex matches (api.ts)", bool(match), repr(match.group(1) if match else None))
check("filename ends with .pdf", bool(match and match.group(1).endswith(".pdf")),
      match.group(1) if match else "NO MATCH")

# ---- PDF must actually be intact, not just magic bytes ----
tail = resp.content[-40:].decode("latin-1", "replace")
check("PDF has %%EOF trailer", "%%EOF" in tail, repr(tail.strip()[-12:]))
check("PDF has startxref", b"startxref" in resp.content, "")
try:
    import pypdf

    reader = pypdf.PdfReader(resp.content)
    check("PDF parses (pypdf)", len(reader.pages) >= 1, f"{len(reader.pages)} page(s)")
except ImportError:
    print("   (pypdf not installed - skipped deep parse)")

fails = [x for x in results if not x[0]]
print("\n" + "=" * 60)
print(f"TOTAL: {len(results)}  PASS: {len(results) - len(fails)}  FAIL: {len(fails)}")
for ok, name, detail in fails:
    print(f"  - {name}: {detail}")
sys.exit(1 if fails else 0)
