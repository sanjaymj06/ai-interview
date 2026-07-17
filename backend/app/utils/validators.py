import os
import re
from typing import Optional, Tuple

from app.utils.constants import REGEX_PATTERNS


def validate_email(email: str) -> bool:
    pattern = REGEX_PATTERNS["email"]
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    pattern = REGEX_PATTERNS["phone"]
    return bool(re.match(pattern, phone))


def validate_url(url: str) -> bool:
    pattern = REGEX_PATTERNS["url"]
    return bool(re.match(pattern, url))


def validate_linkedin_url(url: str) -> bool:
    pattern = REGEX_PATTERNS["linkedin"]
    return bool(re.match(pattern, url))


def validate_github_url(url: str) -> bool:
    pattern = REGEX_PATTERNS["github"]
    return bool(re.match(pattern, url))


def validate_file(
    filename: str,
    file_size: int,
    max_size_bytes: int,
    allowed_extensions: list,
) -> Tuple[bool, Optional[str]]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in allowed_extensions:
        return False, f"File type '.{ext}' not allowed. Allowed: {', '.join(allowed_extensions)}"
    if file_size > max_size_bytes:
        max_mb = max_size_bytes / (1024 * 1024)
        size_mb = file_size / (1024 * 1024)
        return False, f"File size ({size_mb:.1f}MB) exceeds maximum ({max_mb}MB)"
    return True, None


def sanitize_input(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def sanitize_html(text: str) -> str:
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()


def validate_password_strength(password: str) -> Tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain an uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain a lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain a digit"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain a special character"
    return True, "Password is strong"
