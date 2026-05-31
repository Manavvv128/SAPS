# database.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "saps")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users = db["users"]
student_profiles = db["student_profiles"]
teacher_profiles = db["teacher_profiles"]
academic_records = db["academic_records"]
predictions = db["predictions"]