# auth/repository.py
from typing import Optional, Dict, Any
import database

def create_user(user: Dict[str, Any]) -> None:
    database.users.insert_one(user)

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    user = database.users.find_one({"email": email})
    if user:
        user.pop("_id", None)
    return user