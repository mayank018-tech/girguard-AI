"""Alerts routes."""

import datetime
import uuid
from flask import Blueprint, request
from ..extensions import db
from ..models.alert import Alert, AlertStatusEnum
from ..utils.responses import success, created, not_found, validation_error, paginate
from ..utils.validators import parse_int, require_fields

bp = Blueprint("alerts", __name__, url_prefix="/api/v1/alerts")

VALID_STATUSES = {s.value for s in AlertStatusEnum}


@bp.get("")
def list_alerts():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=20, min_val=1, max_val=100)

    query = Alert.query
    if species := request.args.get("species"):
        query = query.filter(Alert.species.ilike(f"%{species}%"))
    if village_id := request.args.get("village_id"):
        query = query.filter_by(village_id=village_id)
    if status := request.args.get("status"):
        query = query.filter_by(status=status)
    if risk_level := request.args.get("risk_level"):
        query = query.filter_by(risk_level=risk_level)

    query = query.order_by(Alert.created_at.desc())
    items, meta = paginate(query, page, per_page)
    return success(data=[a.to_dict() for a in items], meta=meta)


@bp.post("")
def create_alert():
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ["village_id", "species", "risk_score", "risk_level"])
    if missing:
        return validation_error(f"Missing required fields: {', '.join(missing)}")

    alert = Alert(
        id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
        village_id=data["village_id"],
        species=data["species"],
        risk_score=data["risk_score"],
        risk_level=data["risk_level"],
        confidence=data.get("confidence"),
        message=data.get("message"),
        language=data.get("language", "en"),
        status=AlertStatusEnum.NEW.value,
    )
    db.session.add(alert)
    db.session.commit()
    return created(data=alert.to_dict())


@bp.get("/<alert_id>")
def get_alert(alert_id):
    alert = db.session.get(Alert, alert_id)
    if not alert:
        return not_found("Alert")
    return success(data=alert.to_dict())


@bp.patch("/<alert_id>")
def patch_alert(alert_id):
    alert = db.session.get(Alert, alert_id)
    if not alert:
        return not_found("Alert")

    data = request.get_json(silent=True) or {}

    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return validation_error(f"Invalid status. Must be one of: {VALID_STATUSES}")
        alert.status = data["status"]
        if data["status"] == AlertStatusEnum.ACKNOWLEDGED.value and not alert.acknowledged_at:
            alert.acknowledged_at = datetime.datetime.utcnow()
        if data["status"] == AlertStatusEnum.RESOLVED.value and not alert.resolved_at:
            alert.resolved_at = datetime.datetime.utcnow()

    if "message" in data:
        alert.message = data["message"]

    db.session.commit()
    return success(data=alert.to_dict())
