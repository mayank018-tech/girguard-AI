"""Tests — villages endpoints."""


def test_list_villages(client):
    r = client.get("/api/v1/villages")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 2
    assert "meta" in data


def test_get_village_by_id(client):
    r = client.get("/api/v1/villages/V001")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert data["data"]["id"] == "V001"
    assert data["data"]["name"] == "Sasan Gir"


def test_village_not_found(client):
    r = client.get("/api/v1/villages/NOTEXIST")
    assert r.status_code == 404
    data = r.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"


def test_village_has_lat_lng(client):
    r = client.get("/api/v1/villages/V001")
    data = r.get_json()
    assert "lat" in data["data"]
    assert "lng" in data["data"]
