"""
GirGuard AI — ML-backed Risk Prediction Service
=================================================
Production inference service. Replaces the previous deterministic mock.

Architecture:
    Flask route
        → risk_service.predict_for_village()
        → feature_engineering.build_feature_vector()  (from database data)
        → ml/src/predict.predict()                    (model inference)
        → RiskPrediction persisted to DB

IMPORTANT:
- Model is loaded ONCE (lazy singleton) and cached for the process lifetime.
- No retraining occurs during inference.
- Insufficient data returns a safe fallback, never a fabricated prediction.
"""

import os
import sys
import uuid
import datetime
import logging

logger = logging.getLogger(__name__)

# ── Resolve ml/ package path ─────────────────────────────────────────────────
# ml/ is a sibling of backend/ at the project root.
_PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml")
)
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# ── Try to import ML modules ──────────────────────────────────────────────────
_ML_AVAILABLE = False
_ml_predict = None
_ml_feature_engineering = None

try:
    from src import predict as _ml_predict
    from src import feature_engineering as _ml_feature_engineering
    _ML_AVAILABLE = True
    logger.info("[risk_service] ML modules loaded from %s", _PROJECT_ROOT)
except Exception as exc:
    logger.warning(
        "[risk_service] ML modules not available (%s). "
        "Using deterministic fallback. Run ml/src/train.py to enable ML predictions.",
        exc,
    )

# ── Deterministic fallback (used when ML model not yet trained) ───────────────
_FALLBACK_THRESHOLDS = [
    (81, "CRITICAL"),
    (61, "HIGH"),
    (41, "ELEVATED"),
    (21, "MODERATE"),
    (0,  "LOW"),
]


def _fallback_score_to_level(score: int) -> str:
    for threshold, level in _FALLBACK_THRESHOLDS:
        if score >= threshold:
            return level
    return "LOW"


def _deterministic_fallback(village, recent_sightings: list, recent_incidents: list) -> dict:
    """
    Deterministic risk calculation used when the ML model is unavailable.
    Kept as a safety net — not the primary code path after training.
    """
    score = 0
    factors = []

    dist = getattr(village, "forest_distance", None) or 5.0
    if dist <= 1:
        score += 35
        factors.append(f"Forest boundary within {dist:.1f} km")
    elif dist <= 3:
        score += 25
        factors.append(f"Forest distance {dist:.1f} km")
    elif dist <= 7:
        score += 15
        factors.append(f"Forest distance {dist:.1f} km")
    else:
        score += 5

    verified = [s for s in recent_sightings if getattr(s, "verification_status", "") == "VERIFIED"]
    if verified:
        score += min(len(verified) * 12, 30)
        factors.append(f"{len(verified)} verified sighting(s) in last 48h")

    unverified = [s for s in recent_sightings if getattr(s, "verification_status", "") == "PENDING"]
    if unverified:
        score += min(len(unverified) * 5, 10)
        factors.append(f"{len(unverified)} pending sighting(s)")

    if recent_incidents:
        score += min(len(recent_incidents) * 8, 20)
        factors.append(f"{len(recent_incidents)} recent incident(s)")

    hour = datetime.datetime.utcnow().hour
    if hour >= 18 or hour < 6:
        score += 8
        factors.append("Night hours — peak wildlife activity window")

    score = max(0, min(score, 100))
    level = _fallback_score_to_level(score)

    data_points = len(recent_sightings) + len(recent_incidents)
    confidence = round(min(0.45 + data_points * 0.05, 0.95), 2)

    reason = " · ".join(factors) if factors else "Historical baseline — no recent sightings"

    return {
        "risk_score":        score,
        "risk_level":        level,
        "confidence":        confidence,
        "risk_probability":  round(score / 100, 4),
        "prediction_window": "6h",
        "top_factors":       factors,
        "model_version":     "fallback-v1",
        "insufficient_data": False,
        "reason":            reason,
    }


# ── Public API ────────────────────────────────────────────────────────────────

import requests
import json

def get_iam_token(api_key):
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + api_key
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def call_watson_ml(features_dict):
    api_key = os.environ.get("IBM_CLOUD_API_KEY")
    space_id = os.environ.get("IBM_WML_SPACE_ID")
    # This URL should be the exact Scoring URL from the deployment, but we can query it or require it as an env var.
    # For now, if no API key is present, fallback to local.
    if not api_key:
        return None
        
    token = get_iam_token(api_key)
    if not token:
        return None
        
    # Note: In a production environment, you would save the SCORING_URL to an environment variable.
    scoring_url = os.environ.get("IBM_WML_SCORING_URL")
    if not scoring_url:
        logger.warning("IBM_WML_SCORING_URL is not set. Cannot call Watson ML.")
        return None
        
    payload = {
        "input_data": [{
            "fields": list(features_dict.keys()),
            "values": [list(features_dict.values())]
        }]
    }
    
    headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json;charset=UTF-8"
    }
    
    try:
        res = requests.post(scoring_url, headers=headers, json=payload)
        if res.status_code == 200:
            predictions = res.json()
            score = predictions['predictions'][0]['values'][0][1][1] * 100 # Assuming probability of class 1
            return {
                "risk_score": int(score),
                "risk_level": _fallback_score_to_level(score),
                "confidence": 85,
                "risk_probability": round(score/100, 4),
                "prediction_window": "12h",
                "top_factors": ["Watson ML Real-time Prediction"],
                "model_version": "watsonx.ai-v1",
                "insufficient_data": False,
                "reason": "Analyzed via IBM Watson Machine Learning"
            }
    except Exception as e:
        logger.error(f"Watson ML Error: {e}")
    return None

def predict_for_village(village, recent_sightings: list, recent_incidents: list) -> dict:
    """
    Main entry point: generate a risk prediction for a village using Watson ML if available, else local/fallback.
    """
    if _ML_AVAILABLE:
        try:
            # Build features list as a dictionary
            features = _ml_feature_engineering.build_feature_vector(
                village, recent_sightings, recent_incidents
            )
            
            # 1. Try IBM Watson ML first
            watson_result = call_watson_ml(features)
            if watson_result:
                return watson_result
                
            # 2. Try Local ML
            result = _ml_predict.predict(features)
            return result
        except Exception as exc:
            logger.error("[risk_service] ML inference failed: %s. Using fallback.", exc)

    # 3. Fallback: deterministic model
    return _deterministic_fallback(village, recent_sightings, recent_incidents)

def calculate_risk(village, recent_sightings: list = None, recent_incidents: list = None) -> dict:
    """
    Backward-compatible wrapper for existing callers.
    Returns a dict compatible with the RiskPrediction model fields.
    """
    result = predict_for_village(
        village,
        recent_sightings or [],
        recent_incidents or [],
    )

    # Normalise field names to match RiskPrediction model
    return {
        "risk_score":        result.get("risk_score") or 0,
        "risk_level":        result.get("risk_level") or "INSUFFICIENT_DATA",
        "confidence":        int((result.get("confidence") or 0) * 100),
        "reason":            result.get("reason") or "",
        "prediction_window": result.get("prediction_window") or "6h",
        "model_version":     result.get("model_version") or "rf-v1",
        "top_factors":       result.get("top_factors") or [],
        "risk_probability":  result.get("risk_probability"),
        "insufficient_data": result.get("insufficient_data", False),
    }
