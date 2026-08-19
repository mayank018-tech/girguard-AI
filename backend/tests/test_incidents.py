"""Tests — incidents endpoints."""


def test_list_incidents(client):
    r = client.get("/api/v1/incidents")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_get_incident(client):
    r = client.get("/api/v1/incidents/INC-TEST01")
    assert r.status_code == 200
    data = r.get_json()
    assert data["data"]["id"] == "INC-TEST01"
    assert "assignedTeam" in data["data"]


def test_incident_not_found(client):
    r = client.get("/api/v1/incidents/NOTEXIST")
    assert r.status_code == 404


def test_create_incident(client):
    payload = {
        "village_id": "V001",
        "species": "Leopard",
        "severity": "MODERATE",
        "description": "Test incident from pytest.",
        "type": "Agricultural Transit",
    }
    r = client.post("/api/v1/incidents", json=payload)
    assert r.status_code == 201
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["id"].startswith("INC-")


def test_create_incident_missing_fields(client):
    r = client.post("/api/v1/incidents", json={"village_id": "V001"})
    assert r.status_code == 422


def test_patch_incident_status(client):
    r = client.post("/api/v1/incidents", json={
        "village_id": "V001", "species": "Leopard", "severity": "LOW",
    })
    inc_id = r.get_json()["data"]["id"]

    r2 = client.patch(f"/api/v1/incidents/{inc_id}", json={"status": "RESOLVED"})
    assert r2.status_code == 200
    assert r2.get_json()["data"]["status"] == "RESOLVED"


def test_filter_incidents_by_status(client):
    r = client.get("/api/v1/incidents?status=ACTIVE")
    assert r.status_code == 200
    for item in r.get_json()["data"]:
        assert item["status"] == "ACTIVE"
