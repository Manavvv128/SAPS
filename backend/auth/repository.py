# auth/repository.py
from typing import Optional, Dict, Any
import database

def create_user(user: Dict[str, Any]) -> None:
    database.users[user["email"]] = user

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return database.users.get(email, None)
