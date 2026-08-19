"""Tests — risk prediction endpoints."""


def test_list_risk(client):
    r = client.get("/api/v1/risk")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_risk_for_village(client):
    r = client.get("/api/v1/risk/village/V001")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    d = data["data"]
    assert "risk_score" in d
    assert "risk_level" in d
    assert "confidence" in d
    assert "model_version" in d
    assert d["model_version"] in ("rf-v1", "fallback-v1", "demo-v1")
    assert 0 <= d["risk_score"] <= 100


def test_risk_levels_valid(client):
    r = client.get("/api/v1/risk/village/V001")
    level = r.get_json()["data"]["risk_level"]
    assert level in {"LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL", "INSUFFICIENT_DATA"}


def test_risk_village_not_found(client):
    r = client.get("/api/v1/risk/village/NOTEXIST")
    assert r.status_code == 404


def test_risk_filter_by_level(client):
    r = client.get("/api/v1/risk?risk_level=HIGH")
    assert r.status_code == 200
    for item in r.get_json()["data"]:
        assert item["riskLevel"] == "HIGH"
