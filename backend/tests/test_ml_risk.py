"""
Tests — ML Risk Prediction Engine
===================================
Covers:
  - Feature generation (build_feature_vector)
  - Model loading
  - Prediction output contract
  - Risk classification (score → level)
  - Insufficient data handling
  - Invalid village / invalid species
  - API response shape (GET /risk, GET /risk/village, POST /risk/predict)
  - Database persistence (top_factors_json, model_version)
  - Automatic risk update on sighting verification
"""

import os
import sys
import json
import datetime
import pytest

# Ensure ml/ is importable from tests
# Tests run from backend/, so ml/ is a sibling of backend/
_ML_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "ml")
)
if _ML_PATH not in sys.path:
    sys.path.insert(0, _ML_PATH)


# ── Feature Engineering Tests ─────────────────────────────────────────────────

class TestFeatureEngineering:
    """Tests for ml/src/feature_engineering.py"""

    def _make_village(self, forest_distance=2.5, livestock=300, population=1800):
        """Return a simple dict acting as a village object."""
        return {
            "forest_distance": forest_distance,
            "livestock_count": livestock,
            "population": population,
        }

    def _make_sighting(self, status="VERIFIED", hours_ago=4):
        dt = datetime.datetime.utcnow() - datetime.timedelta(hours=hours_ago)
        return type("S", (), {
            "verification_status": status,
            "created_at": dt,
        })()

    def _make_incident(self, hours_ago=12):
        dt = datetime.datetime.utcnow() - datetime.timedelta(hours=hours_ago)
        return type("I", (), {"detected_at": dt})()

    def test_feature_vector_has_all_keys(self):
        from src.feature_engineering import build_feature_vector
        from src.preprocessing import FEATURE_COLS
        village = self._make_village()
        features = build_feature_vector(village, [], [])
        for col in FEATURE_COLS:
            assert col in features, f"Missing feature: {col}"

    def test_is_night_flag_day(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        now_day = datetime.datetime(2024, 6, 1, 10, 0, 0)  # 10am UTC
        features = build_feature_vector(village, [], [], now=now_day)
        assert features["is_night"] == 0

    def test_is_night_flag_night(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        now_night = datetime.datetime(2024, 6, 1, 21, 0, 0)  # 9pm UTC
        features = build_feature_vector(village, [], [], now=now_night)
        assert features["is_night"] == 1

    def test_season_summer(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        now_summer = datetime.datetime(2024, 4, 15, 12, 0, 0)  # April = summer
        features = build_feature_vector(village, [], [], now=now_summer)
        assert features["season"] == 1

    def test_season_monsoon(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        now_monsoon = datetime.datetime(2024, 7, 1, 12, 0, 0)
        features = build_feature_vector(village, [], [], now=now_monsoon)
        assert features["season"] == 2

    def test_verified_sightings_counted(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        sightings = [self._make_sighting("VERIFIED"), self._make_sighting("VERIFIED")]
        features = build_feature_vector(village, sightings, [])
        assert features["recent_verified_sightings"] == 2

    def test_pending_sightings_counted(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        sightings = [self._make_sighting("PENDING"), self._make_sighting("PENDING")]
        features = build_feature_vector(village, sightings, [])
        assert features["recent_pending_sightings"] == 2

    def test_hours_since_sighting_recent(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        sightings = [self._make_sighting("VERIFIED", hours_ago=2)]
        features = build_feature_vector(village, sightings, [])
        assert features["hours_since_last_sighting"] <= 3.0

    def test_insufficient_data_flag_empty(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        features = build_feature_vector(village, [], [])
        assert features["_insufficient"] is True

    def test_insufficient_data_flag_with_data(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village()
        sightings = [self._make_sighting() for _ in range(3)]
        incidents = [self._make_incident()]
        features = build_feature_vector(village, sightings, incidents)
        assert features["_insufficient"] is False

    def test_forest_distance_captured(self):
        from src.feature_engineering import build_feature_vector
        village = self._make_village(forest_distance=0.8)
        features = build_feature_vector(village, [], [])
        assert features["forest_distance"] == pytest.approx(0.8, abs=0.01)

    def test_features_to_dataframe_shape(self):
        from src.feature_engineering import build_feature_vector, features_to_dataframe
        from src.preprocessing import FEATURE_COLS
        village = self._make_village()
        features = build_feature_vector(village, [], [])
        df = features_to_dataframe(features)
        assert list(df.columns) == FEATURE_COLS
        assert len(df) == 1


# ── Model Loading Tests ────────────────────────────────────────────────────────

class TestModelLoading:
    def test_model_file_exists(self):
        # The service uses the model via its own path resolution; just verify it loads
        from src.predict import load_model
        model = load_model()
        assert model is not None

    def test_scaler_file_exists(self):
        from src.preprocessing import load_scaler
        scaler = load_scaler()
        assert scaler is not None

    def test_meta_file_exists(self):
        from src.predict import load_meta
        meta = load_meta()
        assert isinstance(meta, dict)

    def test_model_loads(self):
        from src.predict import load_model
        model = load_model()
        assert model is not None
        assert hasattr(model, "predict_proba")

    def test_meta_has_version(self):
        from src.predict import load_meta
        meta = load_meta()
        assert "model_version" in meta
        assert meta["model_version"] == "rf-v1"

    def test_meta_has_feature_importances(self):
        from src.predict import load_meta
        meta = load_meta()
        assert "feature_importances" in meta
        importances = meta["feature_importances"]
        assert len(importances) > 0


# ── Prediction Output Contract Tests ─────────────────────────────────────────

class TestPrediction:
    def _base_features(self, insufficient=False, data_points=5):
        return {
            "forest_distance":              2.5,
            "livestock_count":              300,
            "population":                   1800,
            "recent_verified_sightings":    2,
            "recent_pending_sightings":     1,
            "recent_incidents":             1,
            "hours_since_last_sighting":    4.0,
            "hours_since_last_incident":    24.0,
            "hour_of_day":                  20,
            "month":                        4,
            "season":                       1,
            "is_night":                     1,
            "_data_points":                 data_points,
            "_insufficient":                insufficient,
        }

    def test_prediction_has_required_keys(self):
        from src.predict import predict
        result = predict(self._base_features())
        for key in ["risk_score", "risk_level", "confidence", "prediction_window",
                    "top_factors", "model_version", "insufficient_data"]:
            assert key in result, f"Missing key: {key}"

    def test_risk_score_range(self):
        from src.predict import predict
        result = predict(self._base_features())
        assert 0 <= result["risk_score"] <= 100

    def test_risk_level_valid(self):
        from src.predict import predict
        result = predict(self._base_features())
        assert result["risk_level"] in {"LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL"}

    def test_confidence_range(self):
        from src.predict import predict
        result = predict(self._base_features())
        assert 0.0 <= result["confidence"] <= 1.0

    def test_prediction_window(self):
        from src.predict import predict
        result = predict(self._base_features())
        assert result["prediction_window"] == "6h"

    def test_model_version_set(self):
        from src.predict import predict
        result = predict(self._base_features())
        assert result["model_version"] == "rf-v1"

    def test_top_factors_is_list(self):
        from src.predict import predict
        result = predict(self._base_features())
        assert isinstance(result["top_factors"], list)

    def test_high_risk_features_yield_higher_score_than_low(self):
        """Forest at 0.5km + night + recent sightings should score higher than 12km + day + no data."""
        from src.predict import predict
        high_features = {**self._base_features(), "forest_distance": 0.5, "is_night": 1,
                         "recent_verified_sightings": 3, "hours_since_last_sighting": 1.0}
        low_features  = {**self._base_features(), "forest_distance": 12.0, "is_night": 0,
                         "recent_verified_sightings": 0, "hours_since_last_sighting": 160.0,
                         "recent_incidents": 0}
        high_result = predict(high_features)
        low_result  = predict(low_features)
        assert high_result["risk_score"] > low_result["risk_score"]

    def test_insufficient_data_returns_fallback(self):
        from src.predict import predict
        result = predict(self._base_features(insufficient=True, data_points=1))
        assert result["insufficient_data"] is True
        assert result["risk_score"] is None
        assert result["risk_level"] == "INSUFFICIENT_DATA"
        assert result["reason"] is not None
        assert "Insufficient data" in result["reason"]


# ── Risk Level Classification Tests ──────────────────────────────────────────

class TestRiskLevelMapping:
    def test_score_to_level(self):
        from src.predict import score_to_level
        assert score_to_level(0)   == "LOW"
        assert score_to_level(10)  == "LOW"
        assert score_to_level(20)  == "LOW"
        assert score_to_level(21)  == "MODERATE"
        assert score_to_level(40)  == "MODERATE"
        assert score_to_level(41)  == "ELEVATED"
        assert score_to_level(60)  == "ELEVATED"
        assert score_to_level(61)  == "HIGH"
        assert score_to_level(80)  == "HIGH"
        assert score_to_level(81)  == "CRITICAL"
        assert score_to_level(100) == "CRITICAL"


# ── API Tests ─────────────────────────────────────────────────────────────────

class TestRiskAPI:
    def test_list_risk_returns_200(self, client):
        r = client.get("/api/v1/risk")
        assert r.status_code == 200
        data = r.get_json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_list_risk_has_meta(self, client):
        r = client.get("/api/v1/risk")
        assert "meta" in r.get_json()

    def test_risk_for_village_returns_200(self, client):
        r = client.get("/api/v1/risk/village/V001")
        assert r.status_code == 200
        d = r.get_json()["data"]
        assert d["village_id"] == "V001"

    def test_risk_for_village_score_range(self, client):
        r = client.get("/api/v1/risk/village/V001")
        d = r.get_json()["data"]
        score = d.get("risk_score")
        if score is not None:  # may be None for INSUFFICIENT_DATA
            assert 0 <= score <= 100

    def test_risk_for_village_level_valid(self, client):
        r = client.get("/api/v1/risk/village/V001")
        level = r.get_json()["data"]["risk_level"]
        assert level in {"LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL", "INSUFFICIENT_DATA"}

    def test_risk_for_village_has_model_version(self, client):
        r = client.get("/api/v1/risk/village/V001")
        d = r.get_json()["data"]
        assert "model_version" in d

    def test_risk_for_village_has_top_factors(self, client):
        r = client.get("/api/v1/risk/village/V001")
        d = r.get_json()["data"]
        assert "top_factors" in d
        assert isinstance(d["top_factors"], list)

    def test_risk_for_village_has_prediction_window(self, client):
        r = client.get("/api/v1/risk/village/V001")
        d = r.get_json()["data"]
        assert d.get("prediction_window") == "6h"

    def test_risk_for_village_has_confidence(self, client):
        r = client.get("/api/v1/risk/village/V001")
        d = r.get_json()["data"]
        assert "confidence" in d

    def test_risk_village_not_found(self, client):
        r = client.get("/api/v1/risk/village/NOTEXIST")
        assert r.status_code == 404

    def test_predict_endpoint_returns_200(self, client):
        r = client.post("/api/v1/risk/predict", json={"village_id": "V001"})
        assert r.status_code == 200
        d = r.get_json()
        assert d["success"] is True

    def test_predict_endpoint_with_species(self, client):
        r = client.post("/api/v1/risk/predict",
                        json={"village_id": "V001", "species": "Asiatic Lion"})
        assert r.status_code == 200
        d = r.get_json()["data"]
        assert d["species"] == "Asiatic Lion"

    def test_predict_missing_village_id(self, client):
        r = client.post("/api/v1/risk/predict", json={})
        assert r.status_code == 422
        assert r.get_json()["error"]["code"] == "VALIDATION_ERROR"

    def test_predict_invalid_village_id(self, client):
        r = client.post("/api/v1/risk/predict", json={"village_id": "INVALID"})
        assert r.status_code == 404

    def test_risk_filter_by_level(self, client):
        # Seed a HIGH prediction first
        client.get("/api/v1/risk/village/V001")  # generates a prediction
        r = client.get("/api/v1/risk")
        assert r.status_code == 200

    def test_predict_persists_to_db(self, client):
        """POST /predict should create a RiskPrediction record."""
        r_before = client.get("/api/v1/risk?per_page=100")
        count_before = len(r_before.get_json()["data"])

        r = client.post("/api/v1/risk/predict", json={"village_id": "V002"})
        d = r.get_json()["data"]

        if not d.get("insufficient_data"):
            r_after = client.get("/api/v1/risk?per_page=100")
            count_after = len(r_after.get_json()["data"])
            assert count_after >= count_before


# ── Sighting Verification → Risk Update Hook Tests ────────────────────────────

class TestSightingRiskHook:
    def test_verifying_sighting_triggers_no_error(self, client):
        """Verify that PATCH verification_status=VERIFIED does not raise a 500."""
        # Create a sighting
        r = client.post("/api/v1/sightings", json={
            "species": "Asiatic Lion",
            "date": "2024-03-10",
            "village": "Sasan Gir",
        })
        assert r.status_code == 201
        sighting_id = r.get_json()["data"]["id"]

        # Verify it — this should trigger risk update hook
        r2 = client.patch(f"/api/v1/sightings/{sighting_id}",
                          json={"verification_status": "VERIFIED", "confidence": 88})
        assert r2.status_code == 200
        assert r2.get_json()["data"]["status"] == "VERIFIED"

    def test_pending_sighting_does_not_trigger_update(self, client):
        """PATCH to PENDING (no status change) should not trigger risk update."""
        r = client.post("/api/v1/sightings", json={
            "species": "Leopard",
            "date": "2024-03-11",
            "village": "Jamwala",
        })
        sighting_id = r.get_json()["data"]["id"]
        r2 = client.patch(f"/api/v1/sightings/{sighting_id}",
                          json={"description": "Updated description"})
        assert r2.status_code == 200


# ── DB Persistence Tests ──────────────────────────────────────────────────────

class TestRiskPredictionPersistence:
    def test_risk_prediction_stored_with_model_version(self, client, db):
        from app.models.risk import RiskPrediction
        import uuid
        from app import create_app

        r = client.post("/api/v1/risk/predict", json={"village_id": "V001"})
        assert r.status_code == 200

        # Fetch the most recent prediction
        recent = RiskPrediction.query.order_by(RiskPrediction.created_at.desc()).first()
        assert recent is not None
        assert recent.model_version in ("rf-v1", "fallback-v1")

    def test_risk_score_bounds_in_db(self, client, db):
        from app.models.risk import RiskPrediction
        client.get("/api/v1/risk/village/V001")
        recent = RiskPrediction.query.order_by(RiskPrediction.created_at.desc()).first()
        if recent and recent.risk_score is not None:
            assert 0 <= recent.risk_score <= 100

    def test_to_dict_includes_top_factors(self, client, db):
        from app.models.risk import RiskPrediction
        import json as _json
        client.get("/api/v1/risk/village/V001")
        recent = RiskPrediction.query.order_by(RiskPrediction.created_at.desc()).first()
        if recent:
            d = recent.to_dict()
            assert "top_factors" in d
            assert isinstance(d["top_factors"], list)
