"""Unit tests for the offline password strength service."""
from app.services.password_checker import analyze_password


def test_common_password_is_weak():
    result = analyze_password("password")
    assert result["verdict"] == "weak"
    assert result["score"] <= 3
    assert any("common" in issue.lower() for issue in result["issues"])
    assert result["suggestions"]


def test_strong_password_scores_full_verdict():
    result = analyze_password("Xk9#mQv2$LpZ8!wR")
    assert result["verdict"] == "strong"
    assert result["status"] == "safe"
    assert result["score"] >= 7
    assert sorted(result["character_classes"]) == ["digits", "lowercase", "symbols", "uppercase"]
    assert result["issues"] == []
    assert result["suggestions"] == []


def test_moderate_mixed_password_is_medium():
    result = analyze_password("Tr0ub4dor&3")
    assert result["verdict"] == "medium"
    assert 4 <= result["score"] <= 6
    assert result["status"] == "warning"


def test_keyboard_sequence_is_penalized():
    result = analyze_password("MyQwertySecret99!")
    assert any("keyboard" in issue.lower() for issue in result["issues"])
    assert result["verdict"] != "strong"


def test_alphabet_and_digit_sequences_are_penalized():
    result = analyze_password("Abcdefgh123")
    assert any("sequential" in issue.lower() for issue in result["issues"])
    assert result["verdict"] == "weak"


def test_repeated_character_runs_are_penalized():
    result = analyze_password("AaaBbb1111!!!")
    assert any("repeated" in issue.lower() for issue in result["issues"])
    assert result["verdict"] == "medium"


def test_score_never_leaves_bounds():
    floor = analyze_password("123456")
    ceiling = analyze_password("Xk9#mQv2$LpZ8!wR")
    assert 0 <= floor["score"] <= floor["max_score"]
    assert 0 <= ceiling["score"] <= ceiling["max_score"]
