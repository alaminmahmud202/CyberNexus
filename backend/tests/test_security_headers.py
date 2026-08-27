"""Unit tests for the security headers auditor with mocked httpx transport."""
import asyncio

import pytest

from app.services import security_headers as sh

GOOD_HEADERS = {
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "content-security-policy": "default-src 'self'",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "geolocation=()",
}


class FakeResponse:
    def __init__(self, url, status_code, headers):
        self.url = url
        self.status_code = status_code
        self.headers = headers


def install_transport(monkeypatch, response, capture):
    class FakeAsyncClient:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def get(self, url):
            capture.append(url)
            return response

    monkeypatch.setattr(sh.httpx, "AsyncClient", FakeAsyncClient)


def test_all_hardening_headers_scores_full(monkeypatch):
    capture = []
    install_transport(monkeypatch, FakeResponse("https://example.com/", 200, GOOD_HEADERS), capture)

    result = asyncio.run(sh.audit_headers("https://example.com"))

    assert result["score"] == 100
    assert result["status"] == "safe"
    assert result["missing_count"] == 0
    assert all(check["status"] == "safe" for check in result["checks"])
    assert capture == ["https://example.com"]


def test_scheme_is_added_and_invalid_urls_rejected(monkeypatch):
    capture = []
    install_transport(monkeypatch, FakeResponse("https://example.com/path", 200, GOOD_HEADERS), capture)

    result = asyncio.run(sh.audit_headers("example.com/path"))
    assert capture[0] == "https://example.com/path"
    assert result["url"] == "https://example.com/path"

    with pytest.raises(ValueError):
        asyncio.run(sh.audit_headers(""))


def test_missing_headers_score_zero_with_recommendations(monkeypatch):
    install_transport(monkeypatch, FakeResponse("https://bare.example/", 200, {}), [])

    result = asyncio.run(sh.audit_headers("https://bare.example/"))

    assert result["score"] == 0
    assert result["status"] == "danger"
    assert result["missing_count"] == 6
    for check in result["checks"]:
        assert check["present"] is False
        assert check["detail"] == sh.RECOMMENDATIONS[check["header"]]


def test_weak_values_are_flagged(monkeypatch):
    weak = dict(GOOD_HEADERS)
    weak["strict-transport-security"] = "max-age=3600"
    weak["content-security-policy"] = "default-src 'unsafe-inline'"
    weak["x-frame-options"] = "ALLOWALL"
    install_transport(monkeypatch, FakeResponse("https://soft.example/", 200, weak), [])

    result = asyncio.run(sh.audit_headers("https://soft.example/"))

    by_header = {check["header"]: check for check in result["checks"]}
    assert by_header["strict-transport-security"]["status"] == "warning"
    assert by_header["content-security-policy"]["status"] == "warning"
    assert by_header["x-frame-options"]["status"] == "warning"
    assert by_header["x-content-type-options"]["status"] == "safe"
    assert result["status"] == "warning"


def test_http_error_maps_to_value_error(monkeypatch):
    class FailingClient(FakeResponse):
        pass

    class Client:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def get(self, _url):
            raise sh.httpx.ConnectError("connection refused")

    monkeypatch.setattr(sh.httpx, "AsyncClient", Client)

    with pytest.raises(ValueError):
        asyncio.run(sh.audit_headers("https://down.example/"))
