"""Tourist incidents routes."""

import uuid
import datetime
from flask import Blueprint, request
from ..extensions import db
from ..models.tourist_incident import TouristIncident
from ..utils.responses import success, created, not_found, validation_error, paginate
from ..utils.validators import parse_int, require_fields

bp = Blueprint("tourist_incidents", __name__, url_prefix="/api/v1/tourist-incidents")


@bp.get("")
def list_tourist_incidents():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=20, min_val=1, max_val=100)

    query = TouristIncident.query
    if status := request.args.get("status"):
        query = query.filter_by(status=status)

    query = query.order_by(TouristIncident.created_at.desc())
    items, meta = paginate(query, page, per_page)
    return success(data=[t.to_dict() for t in items], meta=meta)


@bp.post("")
def create_tourist_incident():
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ["incident_type"])
    if missing:
        return validation_error(f"Missing required fields: {', '.join(missing)}")

    incident = TouristIncident(
        id=f"TI-{uuid.uuid4().hex[:8].upper()}",
        incident_type=data["incident_type"],
        description=data.get("description"),
        latitude=data.get("lat"),
        longitude=data.get("lng"),
        severity=data.get("severity", "LOW"),
        status=data.get("status", "OPEN"),
    )
    db.session.add(incident)
    db.session.commit()
    return created(data=incident.to_dict())


@bp.patch("/<incident_id>")
def patch_tourist_incident(incident_id):
    incident = db.session.get(TouristIncident, incident_id)
    if not incident:
        return not_found("TouristIncident")

    data = request.get_json(silent=True) or {}

    if "status" in data:
        incident.status = data["status"]
        if data["status"] == "RESOLVED" and not incident.resolved_at:
            incident.resolved_at = datetime.datetime.utcnow()
    if "severity" in data:
        incident.severity = data["severity"]

    db.session.commit()
    return success(data=incident.to_dict())
