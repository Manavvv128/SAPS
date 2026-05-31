from prediction.engine import prediction_engine

print('=' * 60)
print('TRAINING PREDICTION MODEL')
print('=' * 60)
print()

try:
    print('Starting model training...')
    prediction_engine.train()
    print('✓ Model trained successfully!')
    print(f'Model version: {prediction_engine.version}')
    print()
    
    # Test prediction
    print('Testing prediction with sample data...')
    test_marks = {
        "Mathematics": 85,
        "Physics": 78,
        "Chemistry": 82,
        "English": 88,
        "Computer Science": 92
    }
    test_attendance = 87.5
    
    result = prediction_engine.predict(test_marks, test_attendance)
    print(f'✓ Prediction works!')
    print(f'  Label: {result["label"]}')
    print(f'  Confidence: {result["confidence"]:.2%}')
    print()
    
except Exception as e:
    print(f'✗ Training failed: {type(e).__name__}: {e}')
    import traceback
    traceback.print_exc()

print('=' * 60)
