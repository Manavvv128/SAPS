# database.py
# In-memory store. Each "collection" is a plain Python dict or list.
# To swap to MongoDB: replace only the repository.py files in each module.
# This file stays untouched.

from typing import Dict, List, Any

# keyed by email
users: Dict[str, Dict[str, Any]] = {}

# keyed by user_id
student_profiles: Dict[str, Dict[str, Any]] = {}

# list of records; each has student_id, uploaded_by, term, marks, attendance_pct, uploaded_at
academic_records: List[Dict[str, Any]] = []

# list of prediction results; each has student_id, academic_record_id, prediction_label,
# confidence_score, model_version, generated_at
predictions: List[Dict[str, Any]] = []
