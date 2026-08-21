import os
import pandas as pd
from datetime import datetime, timedelta
import random
import uuid
import json

os.makedirs('demo_data', exist_ok=True)

# 1. Villages
villages = []
for i in range(15):
    vid = f"VLG-{1000+i}"
    villages.append({
        "id": vid,
        "name": f"Village {chr(65+i)}",
        "district": "Junagadh" if i % 2 == 0 else "Amreli",
        "state": "Gujarat",
        "latitude": 21.1 + random.uniform(-0.1, 0.1),
        "longitude": 70.8 + random.uniform(-0.1, 0.1),
        "population": random.randint(500, 3000),
        "livestock_count": random.randint(100, 800),
        "forest_distance": round(random.uniform(0.1, 5.0), 2),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    })
pd.DataFrame(villages).to_csv('demo_data/villages.csv', index=False)

# 2. Response Teams
teams = []
for i in range(5):
    teams.append({
        "id": f"RT-{100+i}",
        "name": f"Rapid Response {i+1}",
        "team_type": "FOREST_GUARD" if i % 2 == 0 else "VETERINARY",
        "members": random.randint(3, 6),
        "latitude": 21.1 + random.uniform(-0.1, 0.1),
        "longitude": 70.8 + random.uniform(-0.1, 0.1),
        "location": "Central Range" if i % 2 == 0 else "Eastern Range",
        "vehicle": "Mahindra Bolero",
        "availability_status": "AVAILABLE" if i > 1 else "BUSY",
        "created_at": datetime.now().isoformat()
    })
pd.DataFrame(teams).to_csv('demo_data/response_teams.csv', index=False)

# 3. Wildlife Sightings
sightings = []
for i in range(40):
    date = datetime.now() - timedelta(days=random.randint(0, 30))
    sightings.append({
        "id": f"WS-{uuid.uuid4().hex[:8]}",
        "species": random.choice(["Asiatic Lion", "Leopard"]),
        "sighting_date": date.strftime('%Y-%m-%d'),
        "sighting_time": f"{random.randint(0, 23):02d}:00",
        "village_id": random.choice(villages)["id"],
        "latitude": 21.1 + random.uniform(-0.1, 0.1),
        "longitude": 70.8 + random.uniform(-0.1, 0.1),
        "source": random.choice(["CAMERA_TRAP", "VILLAGER", "FOREST_GUARD"]),
        "description": "Spotted near the water body.",
        "verification_status": random.choice(["VERIFIED", "UNVERIFIED", "PENDING"]),
        "confidence": random.randint(60, 99),
        "image_url": "",
        "created_at": date.isoformat()
    })
pd.DataFrame(sightings).to_csv('demo_data/wildlife_sightings.csv', index=False)

# 4. Risk Predictions
predictions = []
for i in range(20):
    predictions.append({
        "id": f"RP-{uuid.uuid4().hex[:8]}",
        "village_id": random.choice(villages)["id"],
        "species": random.choice(["Asiatic Lion", "Leopard"]),
        "risk_score": random.randint(20, 95),
        "risk_level": random.choice(["LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL"]),
        "confidence": random.randint(70, 95),
        "prediction_window": "24h",
        "reason": "Recent movement patterns and dry season water scarcity.",
        "top_factors_json": json.dumps(["Water proximity", "Livestock count"]),
        "model_version": "rf-v1",
        "created_at": datetime.now().isoformat()
    })
pd.DataFrame(predictions).to_csv('demo_data/risk_predictions.csv', index=False)

# 5. Alerts
alerts = []
for i in range(15):
    alerts.append({
        "id": f"ALT-{uuid.uuid4().hex[:8]}",
        "village_id": random.choice(villages)["id"],
        "species": random.choice(["Asiatic Lion", "Leopard"]),
        "risk_score": random.randint(60, 95),
        "risk_level": random.choice(["HIGH", "CRITICAL"]),
        "confidence": random.randint(80, 95),
        "message": "High risk of wildlife movement in your area tonight.",
        "language": "en",
        "status": "SENT",
        "created_at": datetime.now().isoformat(),
        "acknowledged_at": "",
        "resolved_at": ""
    })
pd.DataFrame(alerts).to_csv('demo_data/alerts.csv', index=False)

# 6. Incidents
incidents = []
for i in range(15):
    incidents.append({
        "id": f"INC-{uuid.uuid4().hex[:8]}",
        "village_id": random.choice(villages)["id"],
        "species": random.choice(["Asiatic Lion", "Leopard"]),
        "severity": random.choice(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
        "description": "Livestock predation reported.",
        "incident_type": "Livestock Predation",
        "detected_at": datetime.now().isoformat(),
        "verified_at": datetime.now().isoformat(),
        "assigned_team_id": random.choice(teams)["id"],
        "status": random.choice(["OPEN", "RESOLVED"]),
        "resolution_notes": "",
        "closed_at": "",
        "created_at": datetime.now().isoformat()
    })
pd.DataFrame(incidents).to_csv('demo_data/incidents.csv', index=False)

print('CSV generation complete.')
