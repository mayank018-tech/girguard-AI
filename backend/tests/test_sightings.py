"""Tests — sightings endpoints."""


def test_list_sightings(client):
    r = client.get("/api/v1/sightings")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert "meta" in data


def test_get_sighting(client):
    r = client.get("/api/v1/sightings/SIGHT-TEST01")
    assert r.status_code == 200
    data = r.get_json()
    assert data["data"]["id"] == "SIGHT-TEST01"
    assert data["data"]["status"] == "PENDING"


def test_sighting_not_found(client):
    r = client.get("/api/v1/sightings/NOTEXIST")
    assert r.status_code == 404


def test_create_sighting_success(client):
    payload = {
        "species": "Leopard",
        "date": "2024-01-16",
        "time": "22:00",
        "village": "Sasan Gir",
        "source": "CITIZEN",
        "description": "Leopard near the water tank.",
    }
    r = client.post("/api/v1/sightings", json=payload)
    assert r.status_code == 201
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["id"].startswith("SIGHT-")
    assert data["data"]["status"] == "Pending Verification"


def test_create_sighting_missing_fields(client):
    r = client.post("/api/v1/sightings", json={"species": "Lion"})
    assert r.status_code == 422
    data = r.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_create_sighting_bad_date(client):
    r = client.post("/api/v1/sightings", json={
        "species": "Lion", "date": "not-a-date", "village": "Sasan Gir",
    })
    assert r.status_code == 422


def test_patch_sighting_status(client):
    # First create one
    r = client.post("/api/v1/sightings", json={
        "species": "Leopard", "date": "2024-01-16",
        "village": "Jamwala", "description": "patch test",
    })
    sighting_id = r.get_json()["data"]["id"]

    r2 = client.patch(f"/api/v1/sightings/{sighting_id}",
                      json={"verification_status": "VERIFIED", "confidence": 90})
    assert r2.status_code == 200
    assert r2.get_json()["data"]["status"] == "VERIFIED"


def test_filter_sightings_by_village(client):
    r = client.get("/api/v1/sightings?village_id=V001")
    assert r.status_code == 200
    items = r.get_json()["data"]
    for item in items:
        assert item["village_id"] == "V001"
