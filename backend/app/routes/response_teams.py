"""Response teams routes."""

from flask import Blueprint, request
from ..extensions import db
from ..models.response_team import ResponseTeam
from ..utils.responses import success, not_found, validation_error, paginate
from ..utils.validators import parse_int
from ..utils.auth import require_auth
from ..utils.responses import error

bp = Blueprint("response_teams", __name__, url_prefix="/api/v1/response-teams")


@bp.get("")
@require_auth
def list_teams():
    page = parse_int(request.args.get("page"), default=1, min_val=1)
    per_page = parse_int(request.args.get("per_page"), default=50, min_val=1, max_val=100)

    query = ResponseTeam.query
    if status := request.args.get("status"):
        query = query.filter_by(availability_status=status)

    query = query.order_by(ResponseTeam.name)
    items, meta = paginate(query, page, per_page)
    return success(data=[t.to_dict() for t in items], meta=meta)


@bp.patch("/<team_id>")
@require_auth
def patch_team(team_id):
    if request.user.role not in ("DEPARTMENT", "ADMIN"):
        return error("FORBIDDEN", "Only department or admin can update teams.", 403)
    team = db.session.get(ResponseTeam, team_id)
    if not team:
        return not_found("ResponseTeam")

    data = request.get_json(silent=True) or {}

    if "status" in data:
        team.availability_status = data["status"]
    if "location" in data:
        team.location = data["location"]
    if "lat" in data:
        team.latitude = data["lat"]
    if "lng" in data:
        team.longitude = data["lng"]

    db.session.commit()
    return success(data=team.to_dict())
