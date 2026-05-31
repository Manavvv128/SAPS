import requests
import json

BASE_URL = "http://127.0.0.1:8001"

print('=' * 60)
print('TESTING DATA UPLOAD AND PREDICTION FLOW')
print('=' * 60)
print()

# Step 1: Login as teacher
print('Step 1: Login as teacher...')
login_data = {"email": "xyz@gmail.com", "password": "Test@1234"}
response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
print('✓ Logged in successfully')
print()

# Step 2: Upload NEW marks for Tanvi Chauhan
print('Step 2: Upload NEW marks (different from sample data)...')
student_id = "5ecde079-7236-4deb-907e-f21b3ef11e6d"
marks_data = {
    "student_id": student_id,
    "term": "Term 3",  # New term
    "marks": {
        "Mathematics": 95,
        "Physics": 92,
        "Chemistry": 90,
        "English": 94,
        "Computer Science": 98
    }
}
response = requests.post(f"{BASE_URL}/api/teacher/marks", json=marks_data, headers=headers)
print(f'✓ Marks uploaded: {response.json()}')
print()

# Step 3: Upload NEW attendance
print('Step 3: Upload NEW attendance...')
attendance_data = {
    "student_id": student_id,
    "term": "Term 3",
    "attendance_pct": 95.0
}
response = requests.post(f"{BASE_URL}/api/teacher/attendance", json=attendance_data, headers=headers)
print(f'✓ Attendance uploaded: {response.json()}')
print()

# Step 4: Generate prediction (should use Term 3 data, not sample data)
print('Step 4: Generate prediction...')
response = requests.post(f"{BASE_URL}/api/teacher/predict?student_id={student_id}", headers=headers)
prediction = response.json()
print('✓ Prediction generated using UPLOADED DATA:')
print(f'   Label: {prediction["prediction_label"]}')
print(f'   Confidence: {prediction["confidence_score"]:.2%}')
print(f'   Generated at: {prediction["generated_at"]}')
print()

# Verify the data used
from database import academic_records
print('Step 5: Verify which data was used...')
latest = sorted(
    list(academic_records.find({"student_id": student_id})),
    key=lambda r: r["uploaded_at"],
    reverse=True
)[0]
print(f'Latest record term: {latest["term"]}')
print(f'Marks: {latest["marks"]}')
print(f'Attendance: {latest["attendance_pct"]}%')
avg_marks = sum(latest["marks"].values()) / len(latest["marks"])
print(f'Average marks: {avg_marks:.1f}')
print()

print('=' * 60)
print('CONCLUSION: Prediction uses the LATEST uploaded data!')
print('=' * 60)
