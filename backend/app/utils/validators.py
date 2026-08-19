"""Input validation helpers."""

import datetime


def require_fields(data: dict, fields: list) -> list:
    """Return a list of missing required field names."""
    return [f for f in fields if not data.get(f)]


def parse_date(value: str):
    """Parse ISO date string → date object, or None."""
    if not value:
        return None
    try:
        return datetime.date.fromisoformat(value)
    except ValueError:
        return None


def parse_int(value, default=None, min_val=None, max_val=None):
    """Safely parse integer with optional bounds."""
    try:
        v = int(value)
        if min_val is not None and v < min_val:
            return default
        if max_val is not None and v > max_val:
            return default
        return v
    except (TypeError, ValueError):
        return default
