import httpx
import json

url = "http://127.0.0.1:8000/api/auth/register"
payload = {
    "name": "Test Teacher 3",
    "email": "test3@test.com",
    "password": "Test@1234",
    "role": "teacher"
}

print(f"POST {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print()

try:
    response = httpx.post(url, json=payload, timeout=10.0)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
