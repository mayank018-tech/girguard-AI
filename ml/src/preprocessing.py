"""
GirGuard AI — Feature Preprocessing
=====================================
Handles feature selection, scaling and serialisation of preprocessing artifacts.

Design: preprocessing artifacts (scaler) are trained ONCE during training and
        persisted to disk. Inference loads the saved artifacts — no retraining.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")

# ── Feature columns used by the model ────────────────────────────────────────
# Order matters — must be consistent between training and inference.
FEATURE_COLS = [
    "forest_distance",
    "livestock_count",
    "population",
    "recent_verified_sightings",
    "recent_pending_sightings",
    "recent_incidents",
    "hours_since_last_sighting",
    "hours_since_last_incident",
    "hour_of_day",
    "month",
    "season",
    "is_night",
]

TARGET_COL = "conflict"


def get_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Extract and return only the model feature columns from a dataframe."""
    missing = [c for c in FEATURE_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing feature columns: {missing}")
    return df[FEATURE_COLS].copy()


def fit_scaler(X: pd.DataFrame) -> StandardScaler:
    """Fit a StandardScaler on training features and save to disk."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    scaler = StandardScaler()
    scaler.fit(X)
    joblib.dump(scaler, SCALER_PATH)
    print(f"[preprocessing] Scaler fitted and saved to {SCALER_PATH}")
    return scaler


def load_scaler() -> StandardScaler:
    """Load the previously fitted scaler from disk."""
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Scaler not found at {SCALER_PATH}. Run train.py first."
        )
    return joblib.load(SCALER_PATH)


def transform(X: pd.DataFrame, scaler: StandardScaler) -> np.ndarray:
    """Apply the scaler to feature matrix X."""
    return scaler.transform(X)


def chronological_split(
    df: pd.DataFrame,
    train_frac: float = 0.70,
    val_frac: float = 0.15,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Chronological train/validation/test split.

    Sorts by row index (proxy for creation order in synthetic data).
    In production with real timestamped data, sort by created_at.

    Returns: train_df, val_df, test_df
    """
    n = len(df)
    n_train = int(n * train_frac)
    n_val   = int(n * val_frac)

    train = df.iloc[:n_train].copy()
    val   = df.iloc[n_train : n_train + n_val].copy()
    test  = df.iloc[n_train + n_val :].copy()

    print(
        f"[preprocessing] Split — train: {len(train)}, "
        f"val: {len(val)}, test: {len(test)}"
    )
    return train, val, test
