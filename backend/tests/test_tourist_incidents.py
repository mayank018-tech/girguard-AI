"""Tests — tourist incidents endpoints."""


def test_list_tourist_incidents(client):
    r = client.get("/api/v1/tourist-incidents")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_create_tourist_incident(client):
    payload = {
        "incident_type": "Wildlife Proximity",
        "description": "Lion approached safari vehicle.",
        "lat": 21.1244,
        "lng": 70.6059,
        "severity": "HIGH",
    }
    r = client.post("/api/v1/tourist-incidents", json=payload)
    assert r.status_code == 201
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["id"].startswith("TI-")
    assert data["data"]["status"] == "OPEN"


def test_create_tourist_incident_missing_type(client):
    r = client.post("/api/v1/tourist-incidents", json={"description": "Missing type"})
    assert r.status_code == 422


def test_patch_tourist_incident_status(client):
    r = client.post("/api/v1/tourist-incidents", json={
        "incident_type": "Trail Violation",
        "description": "Test patch.",
    })
    ti_id = r.get_json()["data"]["id"]

    r2 = client.patch(f"/api/v1/tourist-incidents/{ti_id}", json={"status": "RESOLVED"})
    assert r2.status_code == 200
    data = r2.get_json()
    assert data["data"]["status"] == "RESOLVED"
    assert data["data"]["resolved_at"] is not None


def test_tourist_incident_not_found(client):
    r = client.patch("/api/v1/tourist-incidents/NOTEXIST", json={"status": "RESOLVED"})
    assert r.status_code == 404
