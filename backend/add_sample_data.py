from database import academic_records, student_profiles
from datetime import datetime, timezone

print('=' * 60)
print('ADDING SAMPLE ACADEMIC DATA')
print('=' * 60)
print()

# Get students
students = list(student_profiles.find({}, {'user_id': 1, 'name': 1}))

sample_data = [
    {
        "student_id": students[0]['user_id'],
        "student_name": students[0]['name'],
        "term": "Term 1",
        "marks": {
            "Mathematics": 85,
            "Physics": 78,
            "Chemistry": 82,
            "English": 88,
            "Computer Science": 92
        },
        "attendance_pct": 87.5,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": "teacher_demo"
    },
    {
        "student_id": students[0]['user_id'],
        "student_name": students[0]['name'],
        "term": "Term 2",
        "marks": {
            "Mathematics": 88,
            "Physics": 80,
            "Chemistry": 85,
            "English": 90,
            "Computer Science": 94
        },
        "attendance_pct": 89.0,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": "teacher_demo"
    },
    {
        "student_id": students[1]['user_id'],
        "student_name": students[1]['name'],
        "term": "Term 1",
        "marks": {
            "Mathematics": 65,
            "Physics": 58,
            "Chemistry": 62,
            "English": 70,
            "Computer Science": 68
        },
        "attendance_pct": 72.5,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": "teacher_demo"
    },
    {
        "student_id": students[1]['user_id'],
        "student_name": students[1]['name'],
        "term": "Term 2",
        "marks": {
            "Mathematics": 68,
            "Physics": 60,
            "Chemistry": 65,
            "English": 72,
            "Computer Science": 70
        },
        "attendance_pct": 75.0,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": "teacher_demo"
    }
]

# Insert data
result = academic_records.insert_many(sample_data)
print(f'✓ Added {len(result.inserted_ids)} academic records')
print()

# Show summary
for student in students:
    print(f"Student: {student['name']}")
    records = list(academic_records.find({'student_id': student['user_id']}))
    for record in records:
        avg_marks = sum(record['marks'].values()) / len(record['marks'])
        print(f"  {record['term']}: Avg Marks = {avg_marks:.1f}, Attendance = {record['attendance_pct']}%")
    print()

print('=' * 60)
print('DATA READY FOR PREDICTION!')
print('=' * 60)
print('\nNow you can:')
print('1. Login as a teacher at http://127.0.0.1:4201')
print('2. Go to the teacher dashboard')
print('3. Click "Predict" button for any student')
