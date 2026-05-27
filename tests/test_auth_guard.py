# tests/test_auth_guard.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from middleware.auth_guard import decode_token, require_role
from fastapi import HTTPException
from jose import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from datetime import datetime, timezone, timedelta
import pytest

def make_token(role: str, expired: bool = False) -> str:
    exp = datetime.now(timezone.utc) + (timedelta(seconds=-1) if expired else timedelta(hours=1))
    return jwt.encode({"user_id": "u1", "email": "a@b.com", "role": role, "exp": exp},
                      JWT_SECRET, algorithm=JWT_ALGORITHM)

def test_decode_valid_token():
    token = make_token("student")
    user = decode_token(token)
    assert user["role"] == "student"
    assert user["user_id"] == "u1"

def test_decode_expired_token_raises_401():
    token = make_token("student", expired=True)
    with pytest.raises(HTTPException) as exc:
        decode_token(token)
    assert exc.value.status_code == 401

def test_require_role_passes_for_correct_role():
    token = make_token("teacher")
    user = decode_token(token)
    # should not raise
    require_role("teacher")(user)

def test_require_role_raises_403_for_wrong_role():
    token = make_token("student")
    user = decode_token(token)
    with pytest.raises(HTTPException) as exc:
        require_role("teacher")(user)
    assert exc.value.status_code == 403
