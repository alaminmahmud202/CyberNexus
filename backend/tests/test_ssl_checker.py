"""Unit tests for the SSL checker with a mocked TLS handshake layer."""
import asyncio
import socket
import ssl
from datetime import datetime, timedelta, timezone

import pytest

from app.services import ssl_checker

FUTURE_NOT_AFTER = "Jan 01 00:00:00 2030 GMT"
PAST_NOT_AFTER = "Jan 01 00:00:00 2020 GMT"


def make_cert(not_after=FUTURE_NOT_AFTER):
    return {
        "subject": ((("commonName", "example.com"),),),
        "issuer": (
            (("organizationName", "Test Authority"), ("commonName", "Test Authority")),
        ),
        "notBefore": "Jan 01 00:00:00 2024 GMT",
        "notAfter": not_after,
        "subjectAltName": (("DNS", "example.com"), ("DNS", "www.example.com")),
    }


def fake_handshake(cert, version="TLSv1.3"):
    def _handshake(_ctx, _hostname, _port, _timeout):
        return cert, {"name": "TLS_AES_128_GCM_SHA256", "bits": 128}, version

    return _handshake


def test_valid_certificate_mapping(monkeypatch):
    monkeypatch.setattr(ssl_checker, "_handshake", fake_handshake(make_cert()))

    result = asyncio.run(ssl_checker.inspect_host("example.com", 443))

    assert result["host"] == "example.com"
    assert result["subject"] == "example.com"
    assert result["issuer"] == "Test Authority"
    assert result["valid"] is True
    assert result["expired"] is False
    assert result["days_remaining"] > 300
    assert result["tls_version"] == "TLSv1.3"
    assert result["cipher"]["name"] == "TLS_AES_128_GCM_SHA256"
    assert set(result["subject_alt_names"]) == {"example.com", "www.example.com"}
    assert result["status"] == "safe"


def test_expired_certificate_is_flagged(monkeypatch):
    monkeypatch.setattr(ssl_checker, "_handshake", fake_handshake(make_cert(PAST_NOT_AFTER)))

    result = asyncio.run(ssl_checker.inspect_host("example.com"))

    assert result["expired"] is True
    assert result["days_remaining"] < 0
    assert result["status"] == "danger"


def test_untrusted_certificate_retries_unverified(monkeypatch):
    def flaky_handshake(ctx, _hostname, _port, _timeout):
        if ctx.verify_mode == ssl.CERT_REQUIRED:
            raise ssl.SSLCertVerificationError(
                "unable to get local issuer certificate"
            )
        return make_cert(), {"name": "TLS_AES_256_GCM_SHA384", "bits": 256}, "TLSv1.2"

    monkeypatch.setattr(ssl_checker, "_handshake", flaky_handshake)

    result = asyncio.run(ssl_checker.inspect_host("self-signed.example"))

    assert result["valid"] is False
    assert result["verification_error"]
    assert "issuer certificate" in result["verification_error"]
    assert result["status"] == "danger"
    assert result["subject"] == "example.com"


def test_expiring_soon_is_warning(monkeypatch):
    soon = (
        datetime.now(timezone.utc) + timedelta(days=20)
    ).strftime("%b %d %H:%M:%S %Y GMT")
    monkeypatch.setattr(ssl_checker, "_handshake", fake_handshake(make_cert(soon)))

    result = asyncio.run(ssl_checker.inspect_host("example.com"))

    assert 0 <= result["days_remaining"] <= 30
    assert result["status"] == "warning"


def test_dns_failure_maps_to_value_error(monkeypatch):
    def boom(*_args, **_kwargs):
        raise socket.gaierror(-2, "Name or service not known")

    monkeypatch.setattr(ssl_checker, "_fetch_certificate", boom)

    with pytest.raises(ValueError):
        asyncio.run(ssl_checker.inspect_host("missing.host.invalid"))
