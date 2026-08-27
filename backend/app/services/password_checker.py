"""Password strength auditing service (pure Python, offline).

Scores a password on length and character-class variety, then applies
penalties for common passwords, keyboard/alphabet/digit sequences, and
repeated-character runs. Returns a verdict of weak / medium / strong.
"""
import re
from typing import Any, Dict

MAX_SCORE = 10

COMMON_PASSWORDS = frozenset(
    {
        "password", "password1", "password123", "passw0rd", "p@ssw0rd",
        "123456", "1234567", "12345678", "123456789", "1234567890",
        "qwerty", "qwerty123", "1q2w3e4r", "zaq12wsx", "abc123",
        "letmein", "welcome", "admin", "login", "master", "monkey",
        "dragon", "iloveyou", "princess", "sunshine", "shadow",
        "superman", "trustno1", "football", "baseball", "starwars",
    }
)

KEYBOARD_ROWS = ("qwertyuiop", "asdfghjkl", "zxcvbnm", "!@#$%^&*()", "1234567890")
ALPHABET = "abcdefghijklmnopqrstuvwxyz"
DIGITS = "0123456789"

VERDICT_STATUS = {"weak": "danger", "medium": "warning", "strong": "safe"}


def _has_class(password: str, predicate) -> bool:
    return any(predicate(char) for char in password)


def _character_classes(password: str) -> list:
    classes = []
    if _has_class(password, str.islower):
        classes.append("lowercase")
    if _has_class(password, str.isupper):
        classes.append("uppercase")
    if _has_class(password, str.isdigit):
        classes.append("digits")
    if _has_class(password, lambda c: not c.isalnum()):
        classes.append("symbols")
    return classes


def _common_password_match(password: str):
    lowered = password.lower()
    for entry in COMMON_PASSWORDS:
        if entry in lowered:
            return entry
    return None


def _sequence_match(password: str, alphabet: str, run: int = 3):
    lowered = password.lower()
    for start in range(len(alphabet) - run + 1):
        fragment = alphabet[start:start + run]
        if fragment in lowered or fragment[::-1] in lowered:
            return fragment
    return None


def _keyboard_sequence(password: str):
    return _sequence_match(password, "".join(KEYBOARD_ROWS))


def _alphabet_sequence(password: str):
    return _sequence_match(password, ALPHABET) or _sequence_match(password, DIGITS)


def _repeated_run(password: str):
    match = re.search(r"(.)\1{2,}", password)
    return match.group(0) if match else None


def _length_points(length: int) -> int:
    if length < 6:
        return 0
    if length < 8:
        return 1
    if length < 12:
        return 2
    if length <= 15:
        return 3
    return 4


def analyze_password(password: str) -> Dict[str, Any]:
    length = len(password)
    classes = _character_classes(password)
    issues = []
    suggestions = []

    score = _length_points(length) + min(len(classes), 4)

    common = _common_password_match(password)
    if common is not None:
        score -= 4
        issues.append(f"Contains the common password pattern '{common}'")
        suggestions.append("Avoid dictionary words and well-known passwords")

    keyboard = _keyboard_sequence(password)
    if keyboard is not None:
        score -= 2
        issues.append(f"Contains keyboard sequence '{keyboard}'")

    sequential = _alphabet_sequence(password)
    if sequential is not None:
        score -= 2
        issues.append(f"Contains sequential characters '{sequential}'")

    repeated = _repeated_run(password)
    if repeated is not None:
        score -= 2
        issues.append(f"Contains repeated character run '{repeated}'")

    if len(classes) <= 1 and length < 12:
        score -= 1
        issues.append("Limited character variety for its length")

    if length < 8:
        suggestions.append("Use at least 12 characters")
    elif length < 12:
        suggestions.append("Increase length to 12+ characters")

    if "uppercase" not in classes:
        suggestions.append("Add uppercase letters")
    if "digits" not in classes:
        suggestions.append("Add digits")
    if "symbols" not in classes:
        suggestions.append("Add symbols (e.g. ! @ # $)")

    score = max(0, min(MAX_SCORE, score))
    verdict = "weak" if score < 4 else "medium" if score < 7 else "strong"

    return {
        "score": score,
        "max_score": MAX_SCORE,
        "verdict": verdict,
        "status": VERDICT_STATUS[verdict],
        "length": length,
        "character_classes": classes,
        "issues": issues,
        "suggestions": suggestions,
    }
