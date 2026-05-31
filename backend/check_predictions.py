import os
from dotenv import load_dotenv
load_dotenv()

from database import predictions

print("\n" + "="*60)
print("CHECKING PREDICTIONS IN MONGODB")
print("="*60)

# Get all predictions
all_predictions = list(predictions.find())

print(f"\nTotal predictions stored: {len(all_predictions)}")

if all_predictions:
    print("\nStored Predictions:")
    print("-" * 60)
    for i, pred in enumerate(all_predictions, 1):
        print(f"\n{i}. Prediction ID: {pred['prediction_id']}")
        print(f"   Student ID: {pred['student_id']}")
        print(f"   Label: {pred['prediction_label']}")
        print(f"   Confidence: {pred['confidence_score']:.2f}%")
        print(f"   Model Version: {pred['model_version']}")
        print(f"   Generated At: {pred['generated_at']}")
        if 'academic_record_id' in pred:
            print(f"   Record ID: {pred['academic_record_id']}")
else:
    print("\n⚠️  No predictions found in database yet.")
    print("Generate a prediction through the UI or API to see them here!")

print("\n" + "="*60)
