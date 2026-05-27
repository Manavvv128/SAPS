# auth/service.py
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from jose import jwt
from fastapi import HTTPException

import database
from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE
from auth.repository import create_user, get_user_by_email

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(name: str, email: str, password: str, role: str) -> Dict[str, Any]:
    if get_user_by_email(email):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = {
        "user_id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "password_hash": _hash_password(password),
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    create_user(user)
    # If student, create profile stub
    if role == "student":
        database.student_profiles[user["user_id"]] = {
            "user_id": user["user_id"],
            "name": name,
            "email": email,
        }
    return {"message": "User registered successfully", "user_id": user["user_id"]}

def login_user(email: str, password: str) -> Dict[str, Any]:
    user = get_user_by_email(email)
    if not user or user["password_hash"] != _hash_password(password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "exp": now + ACCESS_TOKEN_EXPIRE,
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}
