from database import client, db, users, student_profiles, teacher_profiles, academic_records, predictions

print('=' * 60)
print('MONGODB CONNECTION INFO')
print('=' * 60)
print(f'MongoDB URI: {client.address}')
print(f'Database: {db.name}')
print()

print('=' * 60)
print('COLLECTION COUNTS')
print('=' * 60)
print(f'Users: {users.count_documents({})}')
print(f'Student profiles: {student_profiles.count_documents({})}')
print(f'Teacher profiles: {teacher_profiles.count_documents({})}')
print(f'Academic records: {academic_records.count_documents({})}')
print(f'Predictions: {predictions.count_documents({})}')
print()

print('=' * 60)
print('USERS')
print('=' * 60)
for u in users.find({}, {'name': 1, 'email': 1, 'role': 1, '_id': 0}):
    print(f"  {u['role']:8s} | {u['name']:20s} | {u['email']}")
print()

print('=' * 60)
print('STUDENT PROFILES')
print('=' * 60)
for s in student_profiles.find({}, {'name': 1, 'email': 1, '_id': 0}):
    print(f"  {s.get('name', 'N/A'):20s} | {s.get('email', 'N/A')}")
print()

print('=' * 60)
print('ACADEMIC RECORDS')
print('=' * 60)
for r in academic_records.find({}, {'student_id': 1, 'term': 1, 'marks': 1, 'attendance_pct': 1, '_id': 0}).limit(10):
    print(f"  {r}")
