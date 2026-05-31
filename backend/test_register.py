import sys
import traceback
from auth.service import register_user

try:
    result = register_user(
        name="Test Teacher",
        email="testteacher@test.com", 
        password="Test@1234",
        role="teacher"
    )
    print(f"✓ Success: {result}")
except Exception as e:
    print(f"✗ Error: {type(e).__name__}: {e}")
    traceback.print_exc()
