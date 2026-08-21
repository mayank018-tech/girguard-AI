"""Incidents routes."""

import datetime
import uuid
from flask import Blueprint, request
from ..extensions import db
from ..models.incident import Incident
from ..utils.responses import success, created, not_found, validation_error, paginate
from ..utils.validators import parse_int, require_fields

from ..utils.auth import require_auth

bp = Blueprint("incidents", __name__, url_prefix="/api/v1/incidents")

@bp.get("")
@require_auth
def list_incidents():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=20, min_val=1, max_val=100)

    query = Incident.query
    if species := request.args.get("species"):
        query = query.filter(Incident.species.ilike(f"%{species}%"))
    if village_id := request.args.get("village_id"):
        query = query.filter_by(village_id=village_id)
    if status := request.args.get("status"):
        query = query.filter_by(status=status)

    query = query.order_by(Incident.detected_at.desc())
    items, meta = paginate(query, page, per_page)
    return success(data=[i.to_dict() for i in items], meta=meta)


@bp.post("")
@require_auth
def create_incident():
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ["village_id", "species", "severity"])
    if missing:
        return validation_error(f"Missing required fields: {', '.join(missing)}")

    incident = Incident(
        id=f"INC-{uuid.uuid4().hex[:8].upper()}",
        village_id=data["village_id"],
        reported_by=request.user.id,
        species=data["species"],
        severity=data["severity"],
        description=data.get("description"),
        incident_type=data.get("type"),
        detected_at=datetime.datetime.utcnow(),
        assigned_team_id=data.get("assigned_team_id"),
        status=data.get("status", "DETECTED"),
    )
    db.session.add(incident)
    db.session.commit()
    return created(data=incident.to_dict())


@bp.get("/<incident_id>")
@require_auth
def get_incident(incident_id):
    incident = db.session.get(Incident, incident_id)
    if not incident:
        return not_found("Incident")
    return success(data=incident.to_dict())


@bp.patch("/<incident_id>")
@require_auth
def patch_incident(incident_id):
    incident = db.session.get(Incident, incident_id)
    if not incident:
        return not_found("Incident")

    if request.user.role not in ("DEPARTMENT", "ADMIN"):
        from ..utils.responses import error
        return error("FORBIDDEN", "Only department or admin can update incidents.", 403)

    data = request.get_json(silent=True) or {}

    if "status" in data:
        incident.status = data["status"]
        if data["status"] in ("CLOSED", "RESOLVED"):
            incident.closed_at = incident.closed_at or datetime.datetime.utcnow()
        if data["status"] == "VERIFIED":
            incident.verified_at = incident.verified_at or datetime.datetime.utcnow()
    if "assigned_team_id" in data:
        incident.assigned_team_id = data["assigned_team_id"]
    if "resolution_notes" in data:
        incident.resolution_notes = data["resolution_notes"]
    if "description" in data:
        incident.description = data["description"]

    db.session.commit()
    return success(data=incident.to_dict())
