# config.py
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

_JWT_SECRET = os.environ.get("JWT_SECRET", "")

_INSECURE_DEFAULTS = {
    "",
    "saps-demo-secret-key-change-in-production",
}

if _JWT_SECRET in _INSECURE_DEFAULTS:
    raise RuntimeError(
        "JWT_SECRET environment variable is not set or is using an insecure default. "
        "Set a strong random secret before starting the server."
    )

if len(_JWT_SECRET) < 32:
    raise RuntimeError(
        "JWT_SECRET must be at least 32 characters long."
    )

JWT_SECRET = _JWT_SECRET
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24
ACCESS_TOKEN_EXPIRE = timedelta(hours=JWT_EXPIRY_HOURS)
MODEL_PATH = str(Path(__file__).parent / "model.pkl")