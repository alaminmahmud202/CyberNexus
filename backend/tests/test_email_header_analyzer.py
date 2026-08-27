"""Unit tests for the regex-based email header analyzer."""
from app.services.email_header_analyzer import analyze_headers

SPOOF_SAMPLE = """Received: from mail.bad.xyz (mail.bad.xyz [198.51.100.9]) by mx.bank.test with ESMTP id 1
Received: from internal (localhost [127.0.0.1]) by mx.bank.test
Authentication-Results: mx.bank.test; spf=fail smtp.mailfrom=bad.xyz; dkim=none; dmarc=fail
From: "Bank Security" <secure@bank.test>
Return-Path: <bounce@evil.xyz>
Subject: Verify your account"""

CLEAN_SAMPLE = """Received: from mail.bank.test by mx.dest.test
Authentication-Results: mx.dest.test; spf=pass; dkim=pass; dmarc=pass
From: <news@bank.test>
Return-Path: <news@bank.test>"""


def test_spoofed_sample_is_danger():
    result = analyze_headers(SPOOF_SAMPLE)

    assert result["spf"]["verdict"] == "fail"
    assert result["dkim"]["verdict"] == "none"
    assert result["dmarc"]["verdict"] == "fail"
    assert result["hop_count"] == 2
    assert result["alignment"]["aligned"] is False
    assert result["alignment"]["from_domain"] == "bank.test"
    assert result["alignment"]["return_path_domain"] == "evil.xyz"
    assert result["status"] == "danger"
    assert any("spoofing" in indicator.lower() for indicator in result["indicators"])
    assert result["from_address"] == "secure@bank.test"


def test_aligned_passing_sample_is_safe():
    result = analyze_headers(CLEAN_SAMPLE)

    assert result["status"] == "safe"
    assert result["alignment"]["aligned"] is True
    assert result["indicators"] == []
    assert result["hop_count"] == 1


def test_folded_received_header_counts_once():
    folded = (
        "Received: from relay.example.org\n\t(ehlo relay) by mx.k.test\n"
        "Authentication-Results: m; spf=temperror\n"
        "From: a@b.c\nReturn-Path: <a@b.c>"
    )
    result = analyze_headers(folded)

    assert result["hop_count"] == 1
    assert result["spf"]["verdict"] == "temperror"
    assert result["spf"]["status"] == "warning"
    assert result["status"] == "warning"


def test_latest_authentication_results_line_wins():
    sample = (
        "Authentication-Results: first; spf=fail\n"
        "Authentication-Results: second; spf=pass\n"
        "From: x@y.z\nReturn-Path: <x@y.z>"
    )
    result = analyze_headers(sample)
    assert result["spf"]["verdict"] == "pass"


def test_missing_verdicts_report_unknown():
    sample = "From: a@b.c\r\nReturn-Path: <a@b.c>\r\nSubject: hi"
    result = analyze_headers(sample)

    for field in ("spf", "dkim", "dmarc"):
        assert result[field]["verdict"] is None
        assert result[field]["status"] == "unknown"
    assert any("SPF" in indicator for indicator in result["indicators"])
    assert any("DKIM" in indicator for indicator in result["indicators"])
    assert any("DMARC" in indicator for indicator in result["indicators"])
    assert result["alignment"]["aligned"] is True
    assert result["status"] == "unknown"


def test_no_received_chain_flagged():
    sample = "From: a@b.c\nAuthentication-Results: m; spf=pass; dkim=pass; dmarc=pass"
    result = analyze_headers(sample)

    assert result["hop_count"] == 0
    assert any("received" in indicator.lower() for indicator in result["indicators"])
