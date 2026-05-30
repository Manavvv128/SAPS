# auth/service.py
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from jose import jwt
from fastapi import HTTPException
from passlib.context import CryptContext

import database
from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE
from auth.repository import create_user, get_user_by_email
from logger import get_logger
logger = get_logger("auth")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _hash_password(password: str) -> str:
    return pwd_context.hash(password)

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

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
    if role == "student":
        database.student_profiles.insert_one({
            "user_id": user["user_id"],
            "name": name,
            "email": email,
        })
    elif role == "teacher":
        database.teacher_profiles.insert_one({
            "user_id": user["user_id"],
            "name": name,
            "email": email,
        })
    logger.info(f"New user registered: {email} role={role} user_id={user['user_id']}")
    return {"message": "User registered successfully", "user_id": user["user_id"]}


def login_user(email: str, password: str) -> Dict[str, Any]:
    user = get_user_by_email(email)
    if not user or not _verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "exp": now + ACCESS_TOKEN_EXPIRE,
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    logger.info(f"User logged in: {email} role={user['role']}")
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}