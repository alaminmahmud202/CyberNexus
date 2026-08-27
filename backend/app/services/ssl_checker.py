"""SSL/TLS certificate inspection using the standard library ssl + socket.

Connects to host:port, retrieves the leaf certificate and negotiated
parameters, and reports issuer, subject, expiry date, days remaining,
and chain-validation outcome. Expired/untrusted certificates are still
reported (via an unverified retry) with valid=False.
"""
import asyncio
import functools
import socket
import ssl
from datetime import datetime, timezone
from typing import Any, Dict

WARNING_DAYS = 30


def _principal(section, preferred: str) -> str:
    for rdn in section or ():
        for key, value in rdn:
            if key == preferred:
                return value
    for rdn in section or ():
        for _, value in rdn:
            return value
    return ""


def _parse_time(value: str) -> datetime:
    return datetime.fromtimestamp(ssl.cert_time_to_seconds(value), tz=timezone.utc)


def _handshake(ctx: ssl.SSLContext, hostname: str, port: int, timeout: float):
    with socket.create_connection((hostname, port), timeout=timeout) as sock:
        with ctx.wrap_socket(sock, server_hostname=hostname) as tls:
            cert = tls.getpeercert() or {}
            cipher_name, _, cipher_bits = tls.cipher()
            return cert, {"name": cipher_name, "bits": cipher_bits}, tls.version()


def _fetch_certificate(hostname: str, port: int, timeout: float) -> Dict[str, Any]:
    verification_error = None
    try:
        cert, cipher, tls_version = _handshake(
            ssl.create_default_context(), hostname, port, timeout
        )
        valid = True
    except ssl.SSLCertVerificationError as exc:
        verification_error = getattr(exc, "verify_message", None) or str(exc)
        insecure = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        insecure.check_hostname = False
        insecure.verify_mode = ssl.CERT_NONE
        cert, cipher, tls_version = _handshake(insecure, hostname, port, timeout)
        valid = False

    expires_at = _parse_time(cert["notAfter"]) if cert.get("notAfter") else None
    not_before = _parse_time(cert["notBefore"]) if cert.get("notBefore") else None
    now = datetime.now(timezone.utc)

    expired = bool(expires_at and expires_at < now)
    days_remaining = (expires_at - now).days if expires_at else None

    if not valid or expired:
        status = "danger"
    elif days_remaining is not None and days_remaining <= WARNING_DAYS:
        status = "warning"
    else:
        status = "safe"

    subject_alt_names = [name for _, name in cert.get("subjectAltName", ())]

    return {
        "host": hostname,
        "port": port,
        "subject": _principal(cert.get("subject"), "commonName"),
        "issuer": _principal(cert.get("issuer"), "organizationName")
        or _principal(cert.get("issuer"), "commonName"),
        "not_before": not_before.isoformat() if not_before else None,
        "expires_at": expires_at.isoformat() if expires_at else None,
        "days_remaining": days_remaining,
        "expired": expired,
        "valid": valid,
        "verification_error": verification_error,
        "tls_version": tls_version,
        "cipher": cipher,
        "subject_alt_names": subject_alt_names[:20],
        "status": status,
    }


async def inspect_host(hostname: str, port: int = 443, timeout: float = 10.0) -> Dict[str, Any]:
    hostname = hostname.strip()
    try:
        return await asyncio.get_running_loop().run_in_executor(
            None, functools.partial(_fetch_certificate, hostname, port, timeout)
        )
    except socket.gaierror as exc:
        raise ValueError(f"Could not resolve host '{hostname}'") from exc
    except (ConnectionRefusedError, TimeoutError, socket.timeout) as exc:
        raise ValueError(f"Connection to {hostname}:{port} failed or timed out") from exc
    except OSError as exc:
        raise ValueError(f"TLS handshake with {hostname}:{port} failed: {exc}") from exc
