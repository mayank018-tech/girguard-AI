"""
GirGuard AI — Production Inference
=====================================
Loads the trained model and generates predictions.

This module is the ONLY inference entry point.
- Does NOT retrain the model.
- Does NOT access the database directly.
- Receives feature dict from feature_engineering.py.
- Returns a structured prediction dict.

Usage (standalone test):
    python ml/src/predict.py
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.preprocessing import FEATURE_COLS, load_scaler, transform
from src.feature_engineering import features_to_dataframe, explain_features

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "rf_model.pkl")
META_PATH  = os.path.join(MODELS_DIR, "model_meta.json")

# ── Model cache (loaded once per process) ─────────────────────────────────────
_model  = None
_scaler = None
_meta   = None


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained model not found at {MODEL_PATH}. Run ml/src/train.py first."
        )
    return joblib.load(MODEL_PATH)


def load_meta() -> dict:
    if not os.path.exists(META_PATH):
        return {"model_version": "rf-v1", "feature_importances": {}}
    with open(META_PATH) as f:
        return json.load(f)


def _get_model():
    global _model
    if _model is None:
        _model = load_model()
    return _model


def _get_scaler():
    global _scaler
    if _scaler is None:
        _scaler = load_scaler()
    return _scaler


def _get_meta():
    global _meta
    if _meta is None:
        _meta = load_meta()
    return _meta


def score_to_level(score: int) -> str:
    if score <= 20: return "LOW"
    if score <= 40: return "MODERATE"
    if score <= 60: return "ELEVATED"
    if score <= 80: return "HIGH"
    return "CRITICAL"


def predict(features: dict) -> dict:
    """
    Generate a risk prediction from a feature dictionary.

    Parameters
    ----------
    features : dict  — output of feature_engineering.build_feature_vector()

    Returns
    -------
    dict with:
        risk_score       int  0-100
        risk_level       str  LOW/MODERATE/ELEVATED/HIGH/CRITICAL
        confidence       float 0.0-1.0
        risk_probability float 0.0-1.0
        prediction_window str
        top_factors      list[str]  evidence-based explanations
        model_version    str
        insufficient_data bool
    """
    # Check for insufficient data
    if features.get("_insufficient", False):
        return {
            "risk_score":        None,
            "risk_level":        "INSUFFICIENT_DATA",
            "confidence":        None,
            "risk_probability":  None,
            "prediction_window": "6h",
            "top_factors":       [],
            "model_version":     _get_meta().get("model_version", "rf-v1"),
            "insufficient_data": True,
            "reason":            (
                "Insufficient data for reliable prediction. "
                f"Only {features.get('_data_points', 0)} data point(s) available "
                f"(minimum {3} required). Historical baseline only."
            ),
        }

    model  = _get_model()
    scaler = _get_scaler()
    meta   = _get_meta()

    # Build feature DataFrame
    X_df = features_to_dataframe(features)
    X_s  = transform(X_df, scaler)

    # Predict probability of conflict
    prob = float(model.predict_proba(X_s)[0][1])

    # Convert to score and level
    risk_score = int(round(prob * 100))
    risk_score = max(0, min(100, risk_score))
    risk_level = score_to_level(risk_score)

    # Confidence: how far from the decision boundary (0.5)
    # Values near 0 or 1 → high confidence; near 0.5 → low confidence
    confidence = float(abs(prob - 0.5) * 2)  # normalise to [0, 1]
    confidence = round(max(0.30, min(0.97, confidence)), 2)

    # Feature importances for explanation
    importances = meta.get("feature_importances", {})

    # Generate evidence-based top factors
    top_factors = explain_features(features, importances)

    # Build reason string (first factor)
    reason = " · ".join(top_factors) if top_factors else "Model prediction based on available features"

    return {
        "risk_score":        risk_score,
        "risk_level":        risk_level,
        "confidence":        confidence,
        "risk_probability":  round(prob, 4),
        "prediction_window": "6h",
        "top_factors":       top_factors,
        "model_version":     meta.get("model_version", "rf-v1"),
        "insufficient_data": False,
        "reason":            reason,
    }


# ── Standalone test ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import datetime

    # Simulate a high-risk village scenario
    test_features = {
        "forest_distance":              0.8,
        "livestock_count":              420,
        "population":                   2800,
        "recent_verified_sightings":    2,
        "recent_pending_sightings":     1,
        "recent_incidents":             1,
        "hours_since_last_sighting":    1.4,
        "hours_since_last_incident":    8.0,
        "hour_of_day":                  20,
        "month":                        4,
        "season":                       1,
        "is_night":                     1,
        "_data_points":                 4,
        "_insufficient":                False,
    }

    result = predict(test_features)
    print("\n── Prediction Result ────────────────────────────────────────────────")
    for k, v in result.items():
        print(f"  {k:<25}: {v}")
