"""
GirGuard AI — ML Training Data Loader
======================================
Generates a SYNTHETIC training dataset for the wildlife-human conflict
risk prediction model.

DATA INTEGRITY STATEMENT
-------------------------
- All records are tagged data_source = "SYNTHETIC_DEMO".
- Feature distributions are informed by published ecology literature
  (forest-edge proximity, crepuscular activity peaks, livestock predation
  patterns near Gir) but NO real GPS tracks or sensitive location data
  are used.
- This dataset must NOT be presented as real incident statistics.

References for feature distributions:
  Banerjee et al. (2013) WII Technical Report — Asiatic Lion Habitat Use
  Singh (2017) Gujarat Forest Dept — Human-Lion Conflict Analysis
"""

import os
import random
import numpy as np
import pandas as pd

# Reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUTPUT_PATH = os.path.join(DATA_DIR, "training_data.csv")

# ── Ecological parameter ranges ─────────────────────────────────────────────
# Based on Gir Forest research literature for plausible feature distributions

VILLAGE_PROFILES = [
    # (name, forest_dist_km, livestock_count, population, baseline_conflict_rate)
    ("Core_Zone",       0.5,   80,  400,  0.75),
    ("Near_Boundary",   1.2,  180,  900,  0.60),
    ("Edge_Village",    2.5,  300, 1800,  0.40),
    ("Buffer_Zone",     4.0,  420, 2800,  0.25),
    ("Outer_Zone",      7.5,  600, 5000,  0.12),
    ("Urban_Fringe",   12.0, 1200, 25000, 0.05),
]


def _season(month: int) -> int:
    """0=winter(Nov-Feb), 1=summer(Mar-May), 2=monsoon(Jun-Sep), 3=post-monsoon(Oct)"""
    if month in (11, 12, 1, 2):
        return 0
    if month in (3, 4, 5):
        return 1
    if month in (6, 7, 8, 9):
        return 2
    return 3


def _is_night(hour: int) -> int:
    return 1 if (hour >= 18 or hour < 6) else 0


def _conflict_probability(
    forest_distance: float,
    recent_verified_sightings: int,
    recent_pending_sightings: int,
    recent_incidents: int,
    hours_since_last_sighting: float,
    hours_since_last_incident: float,
    livestock_count: int,
    is_night: int,
    month: int,
    season: int,
    baseline_rate: float,
) -> float:
    """
    Deterministic ecological model to generate plausible conflict probabilities.

    This encodes known ecological relationships:
    - Closer to forest → higher risk (inverse exponential)
    - Recent verified sightings → strong positive signal
    - Night hours → elevated activity (lions/leopards are crepuscular/nocturnal)
    - Livestock density → opportunity for predation
    - Summer (Mar-May) → water stress drives animals toward villages
    - Recent incidents → area is 'active'
    """
    p = baseline_rate

    # Forest proximity (exponential decay)
    prox_factor = np.exp(-0.18 * max(0, forest_distance - 0.5))
    p += 0.30 * prox_factor

    # Recent verified sightings (strong signal)
    sight_factor = min(recent_verified_sightings * 0.12, 0.30)
    p += sight_factor

    # Pending sightings (weaker signal)
    p += min(recent_pending_sightings * 0.04, 0.10)

    # Recent incidents (area active)
    p += min(recent_incidents * 0.06, 0.18)

    # Recency of last sighting
    if hours_since_last_sighting < 6:
        p += 0.15
    elif hours_since_last_sighting < 24:
        p += 0.08
    elif hours_since_last_sighting < 48:
        p += 0.03

    # Night-time multiplier
    if is_night:
        p *= 1.25

    # Livestock density (predation opportunity)
    if livestock_count > 500:
        p += 0.05
    elif livestock_count > 200:
        p += 0.03

    # Seasonal: summer water stress drives lions toward villages
    if season == 1:  # summer
        p += 0.10
    elif season == 0:  # winter — relatively lower
        p -= 0.05

    # Clamp
    return float(np.clip(p, 0.02, 0.97))


def generate_training_dataset(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate a synthetic training dataset.

    Each row represents a 'snapshot' of features at a particular time
    for a particular village type, with a conflict label derived from
    the ecological probability model above.

    data_source is always SYNTHETIC_DEMO.
    """
    records = []

    hours = list(range(24))
    months = list(range(1, 13))

    for i in range(n_samples):
        profile = VILLAGE_PROFILES[i % len(VILLAGE_PROFILES)]
        name, forest_dist, livestock, population, baseline = profile

        # Add village-level noise
        forest_distance = max(0.1, forest_dist + np.random.normal(0, 0.3))
        livestock_count = max(10, int(livestock + np.random.normal(0, livestock * 0.2)))
        pop = max(50, int(population + np.random.normal(0, population * 0.1)))

        # Activity features
        hour = random.choice(hours)
        month = random.choice(months)
        season = _season(month)
        is_ngt = _is_night(hour)

        # Sighting/incident features — correlated with forest proximity and baseline
        # High-risk profiles have more recent sightings
        sight_lambda = max(0.1, (1.0 / forest_distance) * baseline * 3)
        recent_verified = min(int(np.random.poisson(sight_lambda)), 8)
        recent_pending = min(int(np.random.poisson(sight_lambda * 0.6)), 5)
        recent_incidents = min(int(np.random.poisson(baseline * 2.0)), 6)

        hours_since_sight = float(np.clip(np.random.exponential(24), 0.5, 168))
        hours_since_inc   = float(np.clip(np.random.exponential(72), 1.0, 336))

        # Compute conflict probability
        p = _conflict_probability(
            forest_distance=forest_distance,
            recent_verified_sightings=recent_verified,
            recent_pending_sightings=recent_pending,
            recent_incidents=recent_incidents,
            hours_since_last_sighting=hours_since_sight,
            hours_since_last_incident=hours_since_inc,
            livestock_count=livestock_count,
            is_night=is_ngt,
            month=month,
            season=season,
            baseline_rate=baseline,
        )

        # Inject random noise to simulate real uncertainty
        p = float(np.clip(p + np.random.normal(0, 0.05), 0.01, 0.99))

        # Binary label: conflict event in next 6h
        conflict = int(np.random.random() < p)

        # Risk score for reference (not used as training feature)
        risk_score = int(round(p * 100))

        records.append({
            "data_source":                  "SYNTHETIC_DEMO",
            "village_profile":              name,
            "forest_distance":              round(forest_distance, 2),
            "livestock_count":              livestock_count,
            "population":                   pop,
            "recent_verified_sightings":    recent_verified,
            "recent_pending_sightings":     recent_pending,
            "recent_incidents":             recent_incidents,
            "hours_since_last_sighting":    round(hours_since_sight, 1),
            "hours_since_last_incident":    round(hours_since_inc, 1),
            "hour_of_day":                  hour,
            "month":                        month,
            "season":                       season,
            "is_night":                     is_ngt,
            "conflict_probability":         round(p, 4),
            "risk_score_ref":               risk_score,
            "conflict":                     conflict,  # TARGET: 0/1
        })

    df = pd.DataFrame(records)
    return df


def load_or_generate(force: bool = False) -> pd.DataFrame:
    """Load training data from CSV if it exists, otherwise generate it."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not force and os.path.exists(OUTPUT_PATH):
        df = pd.read_csv(OUTPUT_PATH)
        print(f"[data_loader] Loaded {len(df)} records from {OUTPUT_PATH}")
        return df
    print("[data_loader] Generating synthetic training dataset…")
    df = generate_training_dataset(n_samples=2000)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"[data_loader] Saved {len(df)} records to {OUTPUT_PATH}")
    print(f"  Conflict rate: {df['conflict'].mean():.2%}")
    print(f"  Class distribution:\n{df['conflict'].value_counts()}")
    return df


if __name__ == "__main__":
    df = load_or_generate(force=True)
    print(df.describe())
