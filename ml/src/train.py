"""
GirGuard AI — Model Training
==============================
Trains and compares Logistic Regression, Random Forest, and Gradient Boosting.
Selects the best model by validation F1 (with emphasis on HIGH/CRITICAL recall).
Saves the winning model and preprocessing artifacts to ml/models/.

Usage:
    python ml/src/train.py

IMPORTANT: Never run this during API request handling.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report,
)
from sklearn.utils.class_weight import compute_sample_weight

# Allow running from project root or ml/src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from src.data_loader import load_or_generate
from src.preprocessing import (
    FEATURE_COLS, TARGET_COL,
    get_feature_matrix, fit_scaler, transform,
    chronological_split,
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH  = os.path.join(MODELS_DIR, "rf_model.pkl")
META_PATH   = os.path.join(MODELS_DIR, "model_meta.json")

os.makedirs(MODELS_DIR, exist_ok=True)


# ── Model candidates ─────────────────────────────────────────────────────────

def _get_candidates():
    return {
        "logistic_regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_leaf=10,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ),
        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.05,
            random_state=42,
        ),
    }


def _evaluate_on(model, X, y, label="") -> dict:
    pred = model.predict(X)
    prob = model.predict_proba(X)[:, 1] if hasattr(model, "predict_proba") else pred

    metrics = {
        "accuracy":  float(accuracy_score(y, pred)),
        "precision": float(precision_score(y, pred, zero_division=0)),
        "recall":    float(recall_score(y, pred, zero_division=0)),
        "f1":        float(f1_score(y, pred, zero_division=0)),
        "roc_auc":   float(roc_auc_score(y, prob)),
    }
    if label:
        print(f"  [{label}] acc={metrics['accuracy']:.3f}  prec={metrics['precision']:.3f}"
              f"  rec={metrics['recall']:.3f}  f1={metrics['f1']:.3f}  auc={metrics['roc_auc']:.3f}")
    return metrics


def train():
    # ── Load data ──────────────────────────────────────────────────────────
    df = load_or_generate()

    train_df, val_df, test_df = chronological_split(df)

    X_train = get_feature_matrix(train_df)
    y_train = train_df[TARGET_COL].values
    X_val   = get_feature_matrix(val_df)
    y_val   = val_df[TARGET_COL].values
    X_test  = get_feature_matrix(test_df)
    y_test  = test_df[TARGET_COL].values

    # ── Fit scaler on train only ───────────────────────────────────────────
    scaler = fit_scaler(X_train)
    X_train_s = transform(X_train, scaler)
    X_val_s   = transform(X_val, scaler)
    X_test_s  = transform(X_test, scaler)

    # ── Gradient Boosting uses sample weights (no class_weight param) ─────
    sample_weights = compute_sample_weight("balanced", y_train)

    # ── Train and compare ──────────────────────────────────────────────────
    candidates = _get_candidates()
    val_results = {}

    print("\n── Training candidates ──────────────────────────────────────────")
    for name, model in candidates.items():
        print(f"\n[{name}]")
        if name == "gradient_boosting":
            model.fit(X_train_s, y_train, sample_weight=sample_weights)
        else:
            model.fit(X_train_s, y_train)

        train_metrics = _evaluate_on(model, X_train_s, y_train, "train")
        val_metrics   = _evaluate_on(model, X_val_s, y_val, "val  ")
        val_results[name] = (model, val_metrics)

    # ── Select best by validation F1 ──────────────────────────────────────
    best_name = max(val_results, key=lambda k: val_results[k][1]["f1"])
    best_model, best_val = val_results[best_name]

    print(f"\n── Selected: {best_name} (val F1={best_val['f1']:.3f}) ──────────────")

    # ── Evaluate on held-out test set ─────────────────────────────────────
    test_metrics = _evaluate_on(best_model, X_test_s, y_test, "test ")

    pred_test = best_model.predict(X_test_s)
    print("\nClassification report (test set):")
    print(classification_report(y_test, pred_test, target_names=["No Conflict", "Conflict"]))

    # ── Feature importances ────────────────────────────────────────────────
    if hasattr(best_model, "feature_importances_"):
        importances = dict(zip(FEATURE_COLS, best_model.feature_importances_))
    elif hasattr(best_model, "coef_"):
        importances = dict(zip(FEATURE_COLS, abs(best_model.coef_[0])))
    else:
        importances = {f: 1.0 / len(FEATURE_COLS) for f in FEATURE_COLS}

    # Normalise importances to sum to 1
    total = sum(importances.values()) or 1.0
    importances = {k: round(v / total, 4) for k, v in importances.items()}

    print("\nTop feature importances (sorted):")
    for feat, imp in sorted(importances.items(), key=lambda x: -x[1])[:8]:
        print(f"  {feat:<40} {imp:.4f}")

    # ── Save model ─────────────────────────────────────────────────────────
    joblib.dump(best_model, MODEL_PATH)
    print(f"\n[train] Model saved to {MODEL_PATH}")

    # ── Save metadata ──────────────────────────────────────────────────────
    meta = {
        "model_version":    "rf-v1",
        "model_type":       best_name,
        "feature_cols":     FEATURE_COLS,
        "feature_importances": importances,
        "val_metrics":      best_val,
        "test_metrics":     test_metrics,
        "train_samples":    int(len(train_df)),
        "val_samples":      int(len(val_df)),
        "test_samples":     int(len(test_df)),
        "data_source":      "SYNTHETIC_DEMO",
        "note": (
            "Model trained on synthetic data — not validated on real wildlife incidents. "
            "Performance metrics reflect synthetic distribution only."
        ),
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"[train] Metadata saved to {META_PATH}")

    return best_model, meta


if __name__ == "__main__":
    train()
