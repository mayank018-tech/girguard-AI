"""Risk prediction routes.

Endpoints:
    GET  /api/v1/risk                  — paginated list of stored predictions
    GET  /api/v1/risk/village/<id>     — compute + store prediction for a village
    POST /api/v1/risk/predict          — on-demand prediction (no auto-save required)
"""

import datetime
import uuid
import json
from flask import Blueprint, request
from ..extensions import db
from ..models.risk import RiskPrediction
from ..models.village import Village
from ..models.sighting import WildlifeSighting
from ..models.incident import Incident
from ..services import risk_service
from ..utils.responses import success, not_found, validation_error, paginate
from ..utils.validators import parse_int
from ..utils.auth import require_auth
from ..utils.responses import error

bp = Blueprint("risk", __name__, url_prefix="/api/v1/risk")


# ── Helper: fetch context data for a village ──────────────────────────────────

def _fetch_village_context(village_id: str):
    """Return (village, recent_sightings_48h, recent_incidents_7d)."""
    village = db.session.get(Village, village_id)
    if not village:
        return None, None, None

    cutoff_48h = datetime.datetime.utcnow() - datetime.timedelta(hours=48)
    cutoff_7d  = datetime.datetime.utcnow() - datetime.timedelta(days=7)

    recent_sightings = (
        WildlifeSighting.query
        .filter_by(village_id=village_id)
        .filter(WildlifeSighting.created_at >= cutoff_48h)
        .all()
    )
    recent_incidents = (
        Incident.query
        .filter_by(village_id=village_id)
        .filter(Incident.detected_at >= cutoff_7d)
        .all()
    )
    return village, recent_sightings, recent_incidents


def _prediction_to_response(risk_data: dict, village_id: str, village_name: str, species: str = None) -> dict:
    """Normalise a prediction dict to the API response shape."""
    return {
        "village_id":        village_id,
        "village":           village_name,
        "species":           species,
        "risk_score":        risk_data.get("risk_score"),
        "risk_level":        risk_data.get("risk_level"),
        "confidence":        risk_data.get("confidence"),
        "risk_probability":  risk_data.get("risk_probability"),
        "prediction_window": risk_data.get("prediction_window", "6h"),
        "top_factors":       risk_data.get("top_factors", []),
        "reason":            risk_data.get("reason", ""),
        "model_version":     risk_data.get("model_version", "rf-v1"),
        "insufficient_data": risk_data.get("insufficient_data", False),
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@bp.get("")
@require_auth
def list_risk():
    page     = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=50, min_val=1, max_val=100)

    query = RiskPrediction.query
    if risk_level := request.args.get("risk_level"):
        query = query.filter_by(risk_level=risk_level)
    if village_id := request.args.get("village_id"):
        query = query.filter_by(village_id=village_id)

    query = query.order_by(RiskPrediction.created_at.desc())
    items, meta = paginate(query, page, per_page)
    return success(data=[r.to_dict() for r in items], meta=meta)


@bp.get("/village/<village_id>")
@require_auth
def risk_for_village(village_id):
    village, recent_sightings, recent_incidents = _fetch_village_context(village_id)
    if village is None:
        return not_found("Village")

    risk_data = risk_service.calculate_risk(village, recent_sightings, recent_incidents)

    # Persist prediction unless insufficient data
    if not risk_data.get("insufficient_data"):
        pred = RiskPrediction(
            id=f"RISK-{uuid.uuid4().hex[:8].upper()}",
            village_id=village_id,
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            confidence=risk_data["confidence"],
            reason=risk_data["reason"],
            prediction_window=risk_data.get("prediction_window", "6h"),
            model_version=risk_data.get("model_version", "rf-v1"),
            top_factors_json=json.dumps(risk_data.get("top_factors") or []),
        )
        db.session.add(pred)
        db.session.commit()

    return success(data=_prediction_to_response(risk_data, village_id, village.name))


@bp.post("/predict")
@require_auth
def predict():
    """
    On-demand risk prediction.

    Body:
        village_id  (required)
        species     (optional)

    Response mirrors GET /risk/village/<id> but does NOT auto-save to DB.
    The caller may choose to save the result or use it transiently.
    """
    data = request.get_json(silent=True) or {}
    village_id = data.get("village_id")

    if not village_id:
        return validation_error("Missing required field: village_id")

    village, recent_sightings, recent_incidents = _fetch_village_context(village_id)
    if village is None:
        return not_found("Village")

    species = data.get("species")
    risk_data = risk_service.calculate_risk(village, recent_sightings, recent_incidents)

    # Persist prediction
    if not risk_data.get("insufficient_data"):
        pred = RiskPrediction(
            id=f"RISK-{uuid.uuid4().hex[:8].upper()}",
            village_id=village_id,
            species=species,
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            confidence=risk_data["confidence"],
            reason=risk_data["reason"],
            prediction_window=risk_data.get("prediction_window", "6h"),
            model_version=risk_data.get("model_version", "rf-v1"),
            top_factors_json=json.dumps(risk_data.get("top_factors") or []),
        )
        db.session.add(pred)
        db.session.commit()

    return success(data=_prediction_to_response(risk_data, village_id, village.name, species))
