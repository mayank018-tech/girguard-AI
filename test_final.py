import time
import requests

url = 'https://girguard-ai-4.onrender.com/api/v1/auth/signup'
body = {'name': 'Test', 'email': 'test10@test.com', 'password': 'password', 'role_code': 'ADMIN999'}

print("Waiting for deployment to finish...")
for _ in range(30):
    try:
        res = requests.post(url, json=body)
        print(f"Status: {res.status_code}")
        if res.status_code == 201 or "Email already exists" in res.text:
            print("Successfully recovered!")
            break
    except Exception as e:
        print("Error:", e)
    time.sleep(10)
