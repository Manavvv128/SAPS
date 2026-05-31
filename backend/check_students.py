from database import academic_records, student_profiles
import json

print('=' * 60)
print('STUDENTS')
print('=' * 60)
for s in student_profiles.find({}, {'user_id': 1, 'name': 1, 'email': 1, '_id': 0}):
    print(f"  - {s['name']:20s} | ID: {s['user_id']}")

print()
print('=' * 60)
print('ACADEMIC RECORDS')
print('=' * 60)
count = academic_records.count_documents({})
print(f'Total records: {count}')

if count > 0:
    print('\nSample records:')
    for r in academic_records.find({}).limit(5):
        print(f"  Student ID: {r.get('student_id')}")
        print(f"  Term: {r.get('term')}")
        print(f"  Marks: {r.get('marks')}")
        print(f"  Attendance: {r.get('attendance_pct')}%")
        print('-' * 40)
else:
    print('\n⚠️  No academic records found!')
    print('Students need marks and attendance data before predictions can be made.')
    print('\nTo add data:')
    print('1. Login as a teacher')
    print('2. Upload marks for each student')
    print('3. Upload attendance for each student')
    print('4. Then trigger prediction')
