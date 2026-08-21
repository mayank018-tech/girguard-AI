import os
import pandas as pd
from datetime import datetime, timedelta
import random
import uuid

villages_df = pd.read_csv('demo_data/villages.csv')
village_ids = villages_df['id'].tolist()

# 7. Livestock Losses
losses = []
for i in range(10):
    date = datetime.now() - timedelta(days=random.randint(0, 30))
    losses.append({
        "id": f"LL-{uuid.uuid4().hex[:8]}",
        "claim_id": f"CLM-{random.randint(10000, 99999)}",
        "village_id": random.choice(village_ids),
        "livestock_type": random.choice(["Cow", "Buffalo", "Goat", "Sheep"]),
        "quantity": random.randint(1, 3),
        "species": random.choice(["Asiatic Lion", "Leopard"]),
        "incident_date": date.strftime('%Y-%m-%d'),
        "latitude": 21.1 + random.uniform(-0.1, 0.1),
        "longitude": 70.8 + random.uniform(-0.1, 0.1),
        "description": "Predation occurred at night near the forest border.",
        "evidence_url": "",
        "status": random.choice(["PENDING", "APPROVED", "REJECTED", "PAID"]),
        "submitted_at": date.isoformat(),
        "updated_at": date.isoformat()
    })
pd.DataFrame(losses).to_csv('demo_data/livestock_losses.csv', index=False)

# 8. Tourist Incidents
tourist_incidents = []
for i in range(10):
    date = datetime.now() - timedelta(days=random.randint(0, 30))
    tourist_incidents.append({
        "id": f"TI-{uuid.uuid4().hex[:8]}",
        "incident_type": random.choice(["Illegal Safari", "Close Encounter", "Harassment of Wildlife"]),
        "description": "Tourists found off-track attempting to photograph lions.",
        "latitude": 21.1 + random.uniform(-0.1, 0.1),
        "longitude": 70.8 + random.uniform(-0.1, 0.1),
        "severity": random.choice(["LOW", "MODERATE", "HIGH"]),
        "status": random.choice(["REPORTED", "INVESTIGATING", "RESOLVED"]),
        "created_at": date.isoformat(),
        "resolved_at": ""
    })
pd.DataFrame(tourist_incidents).to_csv('demo_data/tourist_incidents.csv', index=False)

print('Remaining CSVs generated.')
