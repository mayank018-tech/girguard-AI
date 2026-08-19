"""Livestock loss routes."""

import uuid
import datetime
from flask import Blueprint, request
from ..extensions import db
from ..models.livestock_loss import LivestockLoss, LossStatusEnum
from ..models.village import Village
from ..utils.responses import success, created, not_found, validation_error, paginate
from ..utils.validators import parse_int, parse_date, require_fields

bp = Blueprint("livestock_loss", __name__, url_prefix="/api/v1/livestock-loss")

VALID_STATUSES = {s.value for s in LossStatusEnum}


@bp.get("")
def list_losses():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=20, min_val=1, max_val=100)

    query = LivestockLoss.query
    if village_id := request.args.get("village_id"):
        query = query.filter_by(village_id=village_id)
    if status := request.args.get("status"):
        query = query.filter_by(status=status)

    query = query.order_by(LivestockLoss.submitted_at.desc())
    items, meta = paginate(query, page, per_page)
    return success(data=[l.to_dict() for l in items], meta=meta)


@bp.post("")
def create_loss():
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ["livestock_type", "date", "description"])
    if missing:
        return validation_error(f"Missing required fields: {', '.join(missing)}")

    count = data.get("count", 1)
    try:
        count = int(count)
        if count < 1:
            raise ValueError
    except (ValueError, TypeError):
        return validation_error("count must be a positive integer.")

    incident_date = parse_date(data["date"])
    if not incident_date:
        return validation_error("Invalid date format. Use YYYY-MM-DD.")

    # Resolve village
    village = None
    if data.get("village_id"):
        village = db.session.get(Village, data["village_id"])
    elif data.get("village"):
        village = Village.query.filter(Village.name.ilike(data["village"])).first()

    loss = LivestockLoss(
        id=f"LS-{uuid.uuid4().hex[:8].upper()}",
        village_id=village.id if village else None,
        livestock_type=data["livestock_type"],
        quantity=count,
        species=data.get("species"),
        incident_date=incident_date,
        description=data["description"],
        status=LossStatusEnum.SUBMITTED.value,
    )
    db.session.add(loss)
    db.session.commit()

    return created(data={
        "id": loss.id,
        "status": "SUBMITTED",
        "loss": loss.to_dict(),
    })


@bp.get("/<loss_id>")
def get_loss(loss_id):
    loss = db.session.get(LivestockLoss, loss_id)
    if not loss:
        return not_found("LivestockLoss")
    return success(data=loss.to_dict())


@bp.patch("/<loss_id>")
def patch_loss(loss_id):
    loss = db.session.get(LivestockLoss, loss_id)
    if not loss:
        return not_found("LivestockLoss")

    data = request.get_json(silent=True) or {}

    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return validation_error(f"Invalid status. Must be one of: {VALID_STATUSES}")
        loss.status = data["status"]

    db.session.commit()
    return success(data=loss.to_dict())
