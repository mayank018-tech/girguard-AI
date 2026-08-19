"""Response helper utilities — enforce consistent API contract."""

from flask import jsonify


def success(data=None, meta=None, status_code=200):
    """Return a standardised success response."""
    body = {"success": True, "data": data if data is not None else {}}
    if meta:
        body["meta"] = meta
    return jsonify(body), status_code


def created(data=None, meta=None):
    return success(data=data, meta=meta, status_code=201)


def error(code: str, message: str, status_code: int = 400):
    """Return a standardised error response."""
    body = {"success": False, "error": {"code": code, "message": message}}
    return jsonify(body), status_code


def not_found(resource: str = "Resource"):
    return error("NOT_FOUND", f"{resource} not found.", 404)


def validation_error(message: str):
    return error("VALIDATION_ERROR", message, 422)


def paginate(query, page: int, per_page: int):
    """Paginate a SQLAlchemy query and return (items, meta_dict)."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    meta = {
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
    }
    return pagination.items, meta
