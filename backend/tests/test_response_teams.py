"""Tests — response teams endpoints."""


def test_list_response_teams(client):
    r = client.get("/api/v1/response-teams")
    assert r.status_code == 200
    data = r.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_team_has_expected_fields(client):
    r = client.get("/api/v1/response-teams")
    team = r.get_json()["data"][0]
    for field in ("id", "name", "type", "status", "location"):
        assert field in team


def test_team_not_found(client):
    r = client.patch("/api/v1/response-teams/NOTEXIST", json={"status": "STANDBY"})
    assert r.status_code == 404


def test_patch_team_status(client):
    r = client.patch("/api/v1/response-teams/TEAM-A1", json={"status": "STANDBY"})
    assert r.status_code == 200
    assert r.get_json()["data"]["status"] == "STANDBY"

    # Restore
    client.patch("/api/v1/response-teams/TEAM-A1", json={"status": "DEPLOYED"})


def test_filter_teams_by_status(client):
    r = client.get("/api/v1/response-teams?status=DEPLOYED")
    assert r.status_code == 200
    for item in r.get_json()["data"]:
        assert item["status"] == "DEPLOYED"
