"""
GirGuard AI — Model Evaluation
================================
Loads the trained model and evaluates it on the test split.
Prints a full evaluation report including confusion matrix.

Usage:
    python ml/src/evaluate.py
"""

import os
import sys
import json
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix,
)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.data_loader import load_or_generate
from src.preprocessing import (
    FEATURE_COLS, TARGET_COL,
    get_feature_matrix, load_scaler, transform,
    chronological_split,
)
from src.predict import load_model, load_meta

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def evaluate():
    print("── GirGuard AI — Model Evaluation Report ────────────────────────────")

    # Load artifacts
    model = load_model()
    scaler = load_scaler()
    meta = load_meta()

    print(f"Model version : {meta.get('model_version', 'unknown')}")
    print(f"Model type    : {meta.get('model_type', 'unknown')}")
    print(f"Data source   : {meta.get('data_source', 'unknown')}")
    print(f"Note          : {meta.get('note', '')}")
    print()

    # Load dataset and reproduce test split
    df = load_or_generate()
    _, _, test_df = chronological_split(df)

    X_test = get_feature_matrix(test_df)
    y_test = test_df[TARGET_COL].values

    X_test_s = transform(X_test, scaler)

    # Predictions
    y_pred = model.predict(X_test_s)
    y_prob = model.predict_proba(X_test_s)[:, 1]

    # ── Metrics ────────────────────────────────────────────────────────────
    print("── Metrics (held-out test set) ─────────────────────────────────────")
    print(f"  Accuracy  : {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision : {precision_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"  Recall    : {recall_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"  F1        : {f1_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"  ROC-AUC   : {roc_auc_score(y_test, y_prob):.4f}")

    print()
    print("── Classification Report ───────────────────────────────────────────")
    print(classification_report(y_test, y_pred,
                                 target_names=["No Conflict (0)", "Conflict (1)"]))

    # ── Confusion Matrix ───────────────────────────────────────────────────
    cm = confusion_matrix(y_test, y_pred)
    print("── Confusion Matrix ────────────────────────────────────────────────")
    print(f"                  Pred: No Conflict  Pred: Conflict")
    print(f"  True: No Conflict   {cm[0][0]:>10}    {cm[0][1]:>10}")
    print(f"  True: Conflict      {cm[1][0]:>10}    {cm[1][1]:>10}")
    print()
    print("  TP (correctly flagged conflicts) :", cm[1][1])
    print("  FN (missed conflicts — COSTLY)   :", cm[1][0])
    print("  FP (false alarms)                :", cm[0][1])
    print("  TN (correctly cleared)           :", cm[0][0])

    # ── Feature Importances ────────────────────────────────────────────────
    importances = meta.get("feature_importances", {})
    if importances:
        print()
        print("── Feature Importances ─────────────────────────────────────────────")
        for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
            bar = "█" * int(imp * 40)
            print(f"  {feat:<40} {imp:.4f}  {bar}")

    # ── Risk Level distribution on test set ───────────────────────────────
    scores = (y_prob * 100).astype(int)

    def score_to_level(s):
        if s <= 20: return "LOW"
        if s <= 40: return "MODERATE"
        if s <= 60: return "ELEVATED"
        if s <= 80: return "HIGH"
        return "CRITICAL"

    levels = pd.Series([score_to_level(s) for s in scores])
    print()
    print("── Predicted Risk Level Distribution (test set) ────────────────────")
    print(levels.value_counts().to_string())
    print()
    print("⚠  All metrics are computed on SYNTHETIC_DEMO data.")
    print("   Real-world performance must be validated with field data before deployment.")


if __name__ == "__main__":
    evaluate()
