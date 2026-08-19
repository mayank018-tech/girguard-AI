"""Villages routes."""

from flask import Blueprint, request
from ..extensions import db
from ..models.village import Village
from ..utils.responses import success, not_found, paginate
from ..utils.validators import parse_int

bp = Blueprint("villages", __name__, url_prefix="/api/v1/villages")


@bp.get("")
def list_villages():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=50, min_val=1, max_val=100)

    query = Village.query.order_by(Village.name)
    items, meta = paginate(query, page, per_page)
    return success(data=[v.to_dict() for v in items], meta=meta)


@bp.get("/<village_id>")
def get_village(village_id):
    village = db.session.get(Village, village_id)
    if not village:
        return not_found("Village")
    return success(data=village.to_dict())
