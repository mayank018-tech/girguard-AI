import time
import requests

url = 'https://girguard-ai-4.onrender.com/api/v1/auth/signup'
body = {'name': 'Test', 'email': 'test3@test.com', 'password': 'password'}

print("Waiting for deployment to finish...")
for _ in range(30):
    try:
        res = requests.post(url, json=body)
        print(f"Status: {res.status_code}")
        print(res.text)
        if "traceback" in res.text or res.status_code == 200 or "Email already exists" in res.text:
            break
    except Exception as e:
        print("Error:", e)
    time.sleep(10)
