"""Wildlife sightings routes.

Event hook: when a sighting is set to VERIFIED (POST or PATCH),
a new risk prediction is computed and persisted for the village.
This is a synchronous hook — real-time streaming can be added in Task 4.
"""

import uuid
import datetime
import logging
import json

from flask import Blueprint, request
from ..extensions import db
from ..models.sighting import WildlifeSighting
from ..models.village import Village
from ..models.incident import Incident
from ..services import risk_service
from ..models.risk import RiskPrediction
from ..utils.responses import success, created, not_found, validation_error, paginate
from ..utils.validators import parse_int, parse_date, require_fields

logger = logging.getLogger(__name__)

bp = Blueprint("sightings", __name__, url_prefix="/api/v1/sightings")

VALID_STATUSES = {"PENDING", "VERIFIED", "REJECTED"}


@bp.get("")
def list_sightings():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=20, min_val=1, max_val=100)

    query = WildlifeSighting.query

    if species := request.args.get("species"):
        query = query.filter(WildlifeSighting.species.ilike(f"%{species}%"))
    if village_id := request.args.get("village_id"):
        query = query.filter_by(village_id=village_id)
    if status := request.args.get("verification_status"):
        query = query.filter_by(verification_status=status)
    if date := request.args.get("date"):
        d = parse_date(date)
        if d:
            query = query.filter_by(sighting_date=d)

    query = query.order_by(WildlifeSighting.created_at.desc())
    items, meta = paginate(query, page, per_page)
    return success(data=[s.to_dict(include_coords=True) for s in items], meta=meta)


@bp.post("")
def create_sighting():
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ["species", "date", "village"])
    if missing:
        return validation_error(f"Missing required fields: {', '.join(missing)}")

    sighting_date = parse_date(data["date"])
    if not sighting_date:
        return validation_error("Invalid date format. Use YYYY-MM-DD.")

    # Resolve village by name or ID
    village = None
    if data.get("village_id"):
        village = db.session.get(Village, data["village_id"])
    elif data.get("village"):
        village = Village.query.filter(Village.name.ilike(data["village"])).first()

    sighting_id = f"SIGHT-{uuid.uuid4().hex[:8].upper()}"

    sighting = WildlifeSighting(
        id=sighting_id,
        species=data["species"],
        sighting_date=sighting_date,
        sighting_time=data.get("time"),
        village_id=village.id if village else None,
        latitude=data.get("lat"),
        longitude=data.get("lng"),
        source=data.get("source", "CITIZEN"),
        description=data.get("description"),
        verification_status="PENDING",
        confidence=data.get("confidence"),
    )

    db.session.add(sighting)
    db.session.commit()

    return created(data={
        "id": sighting.id,
        "status": "Pending Verification",
        "sighting": sighting.to_dict(include_coords=True),
    })


@bp.get("/<sighting_id>")
def get_sighting(sighting_id):
    sighting = db.session.get(WildlifeSighting, sighting_id)
    if not sighting:
        return not_found("Sighting")
    return success(data=sighting.to_dict(include_coords=True))


@bp.patch("/<sighting_id>")
def patch_sighting(sighting_id):
    sighting = db.session.get(WildlifeSighting, sighting_id)
    if not sighting:
        return not_found("Sighting")

    data = request.get_json(silent=True) or {}
    was_verified = sighting.verification_status == "VERIFIED"

    if "verification_status" in data:
        if data["verification_status"] not in VALID_STATUSES:
            return validation_error(f"Invalid verification_status. Must be one of: {VALID_STATUSES}")
        sighting.verification_status = data["verification_status"]
    if "confidence" in data:
        sighting.confidence = data["confidence"]
    if "description" in data:
        sighting.description = data["description"]

    db.session.commit()

    # Event hook: if sighting just became VERIFIED and has a village, update risk
    newly_verified = (not was_verified) and sighting.verification_status == "VERIFIED"
    if newly_verified and sighting.village_id:
        _trigger_risk_update(sighting.village_id)

    return success(data=sighting.to_dict(include_coords=True))


def _trigger_risk_update(village_id: str) -> None:
    """
    Synchronous event hook: compute and persist a new risk prediction for
    a village after a sighting is verified.

    Design: kept separate so it can later be replaced with an async task/queue.
    """
    try:
        from ..models.village import Village
        village = db.session.get(Village, village_id)
        if not village:
            return

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

        risk_data = risk_service.calculate_risk(village, recent_sightings, recent_incidents)

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
            logger.info(
                "[sightings] Risk update for village %s: %s (%s)",
                village_id, risk_data["risk_level"], risk_data["risk_score"],
            )
    except Exception as exc:
        logger.error("[sightings] Risk update failed for village %s: %s", village_id, exc)
