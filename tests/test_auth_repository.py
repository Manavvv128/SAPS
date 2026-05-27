# tests/test_auth_repository.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import database
from auth.repository import create_user, get_user_by_email

def setup_function():
    database.users.clear()

def test_create_user_stores_user():
    user = {"user_id": "u1", "name": "Alice", "email": "alice@test.com",
            "password_hash": "abc", "role": "student"}
    create_user(user)
    assert "alice@test.com" in database.users

def test_get_user_by_email_returns_user():
    user = {"user_id": "u1", "name": "Alice", "email": "alice@test.com",
            "password_hash": "abc", "role": "student"}
    database.users["alice@test.com"] = user
    result = get_user_by_email("alice@test.com")
    assert result["user_id"] == "u1"

def test_get_user_by_email_returns_none_if_not_found():
    result = get_user_by_email("nobody@test.com")
    assert result is None
