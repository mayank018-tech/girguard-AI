"""Tests — alerts endpoints."""


def test_list_alerts(client):
    r = client.get("/api/v1/alerts")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_get_alert(client):
    r = client.get("/api/v1/alerts/ALT-TEST01")
    assert r.status_code == 200
    data = r.get_json()
    assert data["data"]["id"] == "ALT-TEST01"
    assert "riskLevel" in data["data"]
    assert "status" in data["data"]


def test_alert_not_found(client):
    r = client.get("/api/v1/alerts/NOTEXIST")
    assert r.status_code == 404


def test_create_alert(client):
    payload = {
        "village_id": "V001",
        "species": "Leopard",
        "risk_score": 55,
        "risk_level": "ELEVATED",
        "confidence": 72,
        "message": "Test alert from pytest.",
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 201
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["status"] == "NEW"


def test_create_alert_missing_fields(client):
    r = client.post("/api/v1/alerts", json={"village_id": "V001"})
    assert r.status_code == 422


def test_patch_alert_status(client):
    # Create then patch
    r = client.post("/api/v1/alerts", json={
        "village_id": "V001", "species": "Asiatic Lion",
        "risk_score": 72, "risk_level": "HIGH",
    })
    alert_id = r.get_json()["data"]["id"]

    r2 = client.patch(f"/api/v1/alerts/{alert_id}", json={"status": "ACKNOWLEDGED"})
    assert r2.status_code == 200
    assert r2.get_json()["data"]["status"] == "ACKNOWLEDGED"


def test_patch_alert_invalid_status(client):
    r = client.patch("/api/v1/alerts/ALT-TEST01", json={"status": "INVALID_STATUS"})
    assert r.status_code == 422


def test_filter_alerts_by_status(client):
    r = client.get("/api/v1/alerts?status=NEW")
    assert r.status_code == 200
    for item in r.get_json()["data"]:
        assert item["status"] == "NEW"
