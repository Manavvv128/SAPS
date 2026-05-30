# database.py
from pymongo import MongoClient
import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "saps")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections — these replace the old in-memory dicts/lists
users = db["users"]
student_profiles = db["student_profiles"]
academic_records = db["academic_records"]
predictions = db["predictions"]