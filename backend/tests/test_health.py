"""Tests — health endpoint."""


def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["status"] == "ok"


def test_404_returns_json(client):
    r = client.get("/api/v1/nonexistent")
    assert r.status_code == 404
    data = r.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
