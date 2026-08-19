"""Health check endpoint."""

from flask import Blueprint
from ..utils.responses import success

bp = Blueprint("health", __name__, url_prefix="/api/v1")


@bp.get("/health")
def health():
    return success(data={"status": "ok", "service": "GirGuard AI Backend", "version": "1.0.0"})
