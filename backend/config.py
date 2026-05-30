# config.py
import os
from datetime import timedelta

JWT_SECRET = os.environ.get("JWT_SECRET", "saps-demo-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24
ACCESS_TOKEN_EXPIRE = timedelta(hours=JWT_EXPIRY_HOURS)
MODEL_PATH = "model.pkl"