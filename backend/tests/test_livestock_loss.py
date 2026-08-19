"""Tests — livestock loss endpoints."""


def test_list_livestock_losses(client):
    r = client.get("/api/v1/livestock-loss")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_get_livestock_loss(client):
    r = client.get("/api/v1/livestock-loss/LS-TEST01")
    assert r.status_code == 200
    data = r.get_json()
    assert data["data"]["id"] == "LS-TEST01"
    assert "livestockType" in data["data"]
    assert "status" in data["data"]


def test_livestock_loss_not_found(client):
    r = client.get("/api/v1/livestock-loss/NOTEXIST")
    assert r.status_code == 404


def test_create_livestock_loss(client):
    payload = {
        "village": "Sasan Gir",
        "livestock_type": "Goat",
        "count": 3,
        "date": "2024-01-16",
        "description": "Three goats taken by unknown predator.",
        "species": "Leopard",
    }
    r = client.post("/api/v1/livestock-loss", json=payload)
    assert r.status_code == 201
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["id"].startswith("LS-")
    assert data["data"]["status"] == "SUBMITTED"


def test_create_livestock_loss_missing_fields(client):
    r = client.post("/api/v1/livestock-loss", json={"livestock_type": "Cow"})
    assert r.status_code == 422


def test_create_livestock_loss_invalid_count(client):
    r = client.post("/api/v1/livestock-loss", json={
        "livestock_type": "Cow",
        "count": -1,
        "date": "2024-01-16",
        "description": "Test",
    })
    assert r.status_code == 422


def test_patch_livestock_loss_status(client):
    # Create then patch
    r = client.post("/api/v1/livestock-loss", json={
        "livestock_type": "Buffalo", "count": 1,
        "date": "2024-01-15", "description": "Patch test.",
    })
    loss_id = r.get_json()["data"]["id"]

    r2 = client.patch(f"/api/v1/livestock-loss/{loss_id}", json={"status": "UNDER_REVIEW"})
    assert r2.status_code == 200
    assert r2.get_json()["data"]["status"] == "UNDER_REVIEW"
