"""
GirGuard AI — Feature Engineering
====================================
Builds the model input feature vector from live database records.

This module is the bridge between the Flask/SQLAlchemy world and the ML model.
It is used at INFERENCE TIME only — no model training occurs here.

Design principles:
- Accepts plain Python objects (dicts / ORM model instances) — no DB session here.
- Provides a single entry point: build_feature_vector(village, sightings, incidents)
- Returns a dict AND a DataFrame row (both are needed by different callers).
- Handles missing data gracefully; applies the INSUFFICIENT_DATA fallback.
"""

import datetime
import pandas as pd

from .preprocessing import FEATURE_COLS

# Minimum data points required for a confident ML prediction
MIN_DATA_POINTS = 3

# Cap values to match training distribution
MAX_HOURS_SIGHTING  = 168.0   # 7 days
MAX_HOURS_INCIDENT  = 336.0   # 14 days


def _season(month: int) -> int:
    """0=winter, 1=summer, 2=monsoon, 3=post-monsoon"""
    if month in (11, 12, 1, 2):
        return 0
    if month in (3, 4, 5):
        return 1
    if month in (6, 7, 8, 9):
        return 2
    return 3


def _hours_since(dt) -> float:
    """Return hours elapsed since a datetime (or None → capped max)."""
    if dt is None:
        return MAX_HOURS_SIGHTING
    now = datetime.datetime.utcnow()
    # Handle both datetime objects and ISO strings
    if isinstance(dt, str):
        try:
            dt = datetime.datetime.fromisoformat(dt.replace("Z", "+00:00"))
            dt = dt.replace(tzinfo=None)
        except ValueError:
            return MAX_HOURS_SIGHTING
    delta = (now - dt).total_seconds() / 3600.0
    return min(max(delta, 0.0), MAX_HOURS_SIGHTING)


def _hours_since_incident(dt) -> float:
    if dt is None:
        return MAX_HOURS_INCIDENT
    now = datetime.datetime.utcnow()
    if isinstance(dt, str):
        try:
            dt = datetime.datetime.fromisoformat(dt.replace("Z", "+00:00"))
            dt = dt.replace(tzinfo=None)
        except ValueError:
            return MAX_HOURS_INCIDENT
    delta = (now - dt).total_seconds() / 3600.0
    return min(max(delta, 0.0), MAX_HOURS_INCIDENT)


def build_feature_vector(
    village,
    recent_sightings: list,
    recent_incidents: list,
    now: datetime.datetime = None,
) -> dict:
    """
    Build a feature dictionary from DB objects.

    Parameters
    ----------
    village         : Village ORM object OR dict with keys: forest_distance,
                      livestock_count, population
    recent_sightings: list of WildlifeSighting ORM objects (last 48h)
    recent_incidents: list of Incident ORM objects (last 7 days)
    now             : datetime to use as "now" (defaults to utcnow)

    Returns
    -------
    dict with keys matching FEATURE_COLS, plus:
      '_data_points' : total number of data points available
      '_insufficient' : bool — True if below MIN_DATA_POINTS
    """
    now = now or datetime.datetime.utcnow()

    # ── Village features ──────────────────────────────────────────────────────
    if isinstance(village, dict):
        forest_distance = float(village.get("forest_distance") or 5.0)
        livestock_count = int(village.get("livestock_count") or 0)
        population      = int(village.get("population") or 0)
    else:
        forest_distance = float(getattr(village, "forest_distance", None) or 5.0)
        livestock_count = int(getattr(village, "livestock_count", None) or 0)
        population      = int(getattr(village, "population", None) or 0)

    # ── Sighting features ─────────────────────────────────────────────────────
    verified_sightings = [
        s for s in recent_sightings
        if (getattr(s, "verification_status", s.get("status") if isinstance(s, dict) else "PENDING") == "VERIFIED")
    ]
    pending_sightings = [
        s for s in recent_sightings
        if (getattr(s, "verification_status", s.get("status") if isinstance(s, dict) else "PENDING") == "PENDING")
    ]

    recent_verified_sightings = len(verified_sightings)
    recent_pending_sightings  = len(pending_sightings)

    # Hours since the most recent sighting (any status)
    sight_times = []
    for s in recent_sightings:
        if isinstance(s, dict):
            dt = s.get("created_at")
        else:
            dt = getattr(s, "created_at", None)
        if dt is not None:
            sight_times.append(dt)

    if sight_times:
        most_recent_sight = max(
            sight_times,
            key=lambda d: d if isinstance(d, datetime.datetime) else datetime.datetime.fromisoformat(str(d).replace("Z", ""))
        )
        hours_since_last_sighting = _hours_since(most_recent_sight)
    else:
        hours_since_last_sighting = MAX_HOURS_SIGHTING

    # ── Incident features ─────────────────────────────────────────────────────
    recent_incidents_count = len(recent_incidents)

    inc_times = []
    for inc in recent_incidents:
        if isinstance(inc, dict):
            dt = inc.get("detected_at")
        else:
            dt = getattr(inc, "detected_at", None)
        if dt is not None:
            inc_times.append(dt)

    if inc_times:
        most_recent_inc = max(
            inc_times,
            key=lambda d: d if isinstance(d, datetime.datetime) else datetime.datetime.fromisoformat(str(d).replace("Z", ""))
        )
        hours_since_last_incident = _hours_since_incident(most_recent_inc)
    else:
        hours_since_last_incident = MAX_HOURS_INCIDENT

    # ── Temporal features ─────────────────────────────────────────────────────
    hour_of_day = now.hour
    month       = now.month
    season      = _season(month)
    is_night    = 1 if (hour_of_day >= 18 or hour_of_day < 6) else 0

    # ── Sufficiency check ────────────────────────────────────────────────────
    data_points = len(recent_sightings) + len(recent_incidents)
    insufficient = data_points < MIN_DATA_POINTS

    features = {
        "forest_distance":              round(forest_distance, 2),
        "livestock_count":              livestock_count,
        "population":                   population,
        "recent_verified_sightings":    recent_verified_sightings,
        "recent_pending_sightings":     recent_pending_sightings,
        "recent_incidents":             recent_incidents_count,
        "hours_since_last_sighting":    round(hours_since_last_sighting, 1),
        "hours_since_last_incident":    round(hours_since_last_incident, 1),
        "hour_of_day":                  hour_of_day,
        "month":                        month,
        "season":                       season,
        "is_night":                     is_night,
        # Internal metadata (not passed to model)
        "_data_points":                 data_points,
        "_insufficient":                insufficient,
    }
    return features


def features_to_dataframe(features: dict) -> pd.DataFrame:
    """Convert a feature dict to a single-row DataFrame for model input."""
    row = {k: v for k, v in features.items() if k in FEATURE_COLS}
    return pd.DataFrame([row])[FEATURE_COLS]


def explain_features(features: dict, importances: dict) -> list:
    """
    Generate human-readable top factors based on feature values and importances.

    Returns a list of up to 5 factor strings, sorted by importance.
    These are evidence-based — derived from actual feature values.
    """
    explanations = []

    fd = features.get("forest_distance", 99)
    rv = features.get("recent_verified_sightings", 0)
    rp = features.get("recent_pending_sightings", 0)
    ri = features.get("recent_incidents", 0)
    hs = features.get("hours_since_last_sighting", 999)
    hi = features.get("hours_since_last_incident", 999)
    ngt = features.get("is_night", 0)
    season = features.get("season", -1)
    lc  = features.get("livestock_count", 0)

    # Pair each factor with its model importance so we can rank
    candidates = []

    if fd <= 1.0:
        candidates.append((importances.get("forest_distance", 0.0),
                           f"Forest boundary within {fd:.1f} km"))
    elif fd <= 3.0:
        candidates.append((importances.get("forest_distance", 0.0),
                           f"Forest distance {fd:.1f} km — close proximity"))

    if rv > 0:
        candidates.append((importances.get("recent_verified_sightings", 0.0),
                           f"{rv} verified wildlife sighting{'s' if rv > 1 else ''} in last 48h"))
    if rp > 0:
        candidates.append((importances.get("recent_pending_sightings", 0.0),
                           f"{rp} unverified sighting report{'s' if rp > 1 else ''} in last 48h"))
    if ri > 0:
        candidates.append((importances.get("recent_incidents", 0.0),
                           f"{ri} conflict incident{'s' if ri > 1 else ''} in last 7 days"))
    if hs < 6:
        candidates.append((importances.get("hours_since_last_sighting", 0.0),
                           f"Sighting {hs:.1f}h ago — very recent activity"))
    elif hs < 24:
        candidates.append((importances.get("hours_since_last_sighting", 0.0),
                           f"Sighting {hs:.0f}h ago — recent activity"))
    if hi < 12:
        candidates.append((importances.get("hours_since_last_incident", 0.0),
                           f"Incident {hi:.0f}h ago — area recently active"))
    if ngt:
        candidates.append((importances.get("is_night", 0.0),
                           "Night hours — peak crepuscular/nocturnal activity window"))
    if season == 1:
        candidates.append((importances.get("season", 0.0),
                           "Summer season — water stress increases village proximity"))
    if lc > 400:
        candidates.append((importances.get("livestock_count", 0.0),
                           f"High livestock density ({lc}) — elevated predation opportunity"))

    if not candidates:
        return ["Historical baseline — insufficient recent activity data"]

    # Sort by importance descending, take top 5
    candidates.sort(key=lambda x: x[0], reverse=True)
    return [desc for _, desc in candidates[:5]]
