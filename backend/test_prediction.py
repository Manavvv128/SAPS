from prediction.service import generate_prediction
from database import student_profiles

print('=' * 60)
print('TESTING PREDICTION ENGINE')
print('=' * 60)
print()

# Get students
students = list(student_profiles.find({}, {'user_id': 1, 'name': 1}))

for student in students:
    print(f"Testing prediction for: {student['name']}")
    print(f"Student ID: {student['user_id']}")
    
    try:
        result = generate_prediction(student['user_id'])
        print(f"✓ Prediction successful!")
        print(f"  Label: {result.prediction_label}")
        print(f"  Confidence: {result.confidence_score:.2%}")
        print(f"  Model Version: {result.model_version}")
        print()
    except Exception as e:
        print(f"✗ Prediction failed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        print()

print('=' * 60)
print('PREDICTION TEST COMPLETE')
print('=' * 60)
