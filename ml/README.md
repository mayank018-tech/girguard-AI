# GirGuard AI — ML Risk Prediction Engine

## Overview

Wildlife-Human Conflict Risk Prediction Engine for the Gir Forest region, Gujarat, India.

Predicts the **probability of wildlife-human conflict** near a village over the **next 6 hours**, producing a risk score (0–100) and level (LOW / MODERATE / ELEVATED / HIGH / CRITICAL).

> ⚠ This is a **decision support tool**, not guaranteed wildlife movement prediction.  
> All training data is clearly labelled by source. Synthetic data is not presented as real.

---

## Architecture

```
Database (SQLite/PostgreSQL)
    ↓
Feature Engineering  (ml/src/feature_engineering.py)
    ↓
ML Model Inference   (ml/src/predict.py)
    ↓
Risk Score 0–100
    ↓
Flask API            (backend/app/services/risk_service.py)
    ↓
Frontend Dashboard
```

---

## Dataset Sources

| Source Tag         | Description                                                               |
|--------------------|---------------------------------------------------------------------------|
| `SYNTHETIC_DEMO`   | Synthetically generated records based on published ecological research    |
| `PUBLIC_RESEARCH`  | Feature distributions informed by peer-reviewed lion ecology literature   |

### Key References Used to Shape Feature Distributions
- Banerjee, K. et al. (2013) *Habitat Use and Movement of Asiatic Lions* — WII Technical Report
- Singh, H.S. (2017) *Human-Lion Conflict in Gir Forest* — Gujarat Forest Dept
- General ecological principles: crepuscular activity peaks, forest-edge proximity effects

**No real GPS-track data or sensitive wildlife location data is used.**  
All coordinates are generalised or fully synthetic.

---

## Features

| Feature                    | Type       | Source              | Description                                   |
|----------------------------|------------|---------------------|-----------------------------------------------|
| `recent_verified_sightings`| int        | DB: sightings       | Verified sightings within 48h                 |
| `recent_pending_sightings` | int        | DB: sightings       | Pending sightings within 48h                  |
| `recent_incidents`         | int        | DB: incidents       | Incidents within 7 days                       |
| `hours_since_last_sighting`| float      | DB: sightings       | Hours since most recent sighting (capped 168h)|
| `hours_since_last_incident`| float      | DB: incidents       | Hours since most recent incident (capped 336h)|
| `forest_distance`          | float      | DB: villages        | Distance from village to forest edge (km)     |
| `livestock_count`          | int        | DB: villages        | Village livestock count                       |
| `population`               | int        | DB: villages        | Village population                            |
| `is_night`                 | int (0/1)  | System clock        | 1 if 18:00–06:00 UTC                          |
| `hour_of_day`              | int        | System clock        | Hour 0–23                                     |
| `month`                    | int        | System clock        | Month 1–12 (seasonality)                      |
| `season`                   | int        | System clock        | 0=winter, 1=summer, 2=monsoon, 3=post-monsoon |

**Features NOT used** (unavailable in current dataset): rainfall, temperature, water source distance, exact GPS proximity to individual animals.

---

## Models Compared

| Model               | Rationale                                                  |
|---------------------|------------------------------------------------------------|
| Logistic Regression | Fast, interpretable linear baseline                        |
| Random Forest       | Handles non-linearity, robust, feature importance built-in |
| Gradient Boosting   | Often strong performance on tabular data                   |

Selected model: **Random Forest** (see evaluation metrics in `evaluate.py` output).

**Model version**: `rf-v1`

---

## Data Split Strategy

Time-aware split to prevent data leakage:
- Records are sorted by `created_at` timestamp
- **Train**: oldest 70% of records
- **Validation**: next 15%
- **Test**: most recent 15%

No future observations leak into training data.

---

## Evaluation Metrics (Synthetic Dataset)

Metrics are computed on the held-out test set. See `ml/src/evaluate.py` output.

Key metric: **Recall for HIGH/CRITICAL** events  
(missed high-risk events are more costly than false alarms)

---

## Risk Level Mapping

| Score   | Level     |
|---------|-----------|
| 0–20    | LOW       |
| 21–40   | MODERATE  |
| 41–60   | ELEVATED  |
| 61–80   | HIGH      |
| 81–100  | CRITICAL  |

---

## Usage

### Train the model
```bash
cd ml
pip install -r requirements.txt
python src/train.py
```

### Evaluate
```bash
python src/evaluate.py
```

### Generate a prediction (standalone test)
```bash
python src/predict.py --village_id V001
```

---

## Directory Structure

```
ml/
├── data/
│   └── training_data.csv          # Synthetic training dataset
├── models/
│   ├── rf_model.pkl               # Trained Random Forest model
│   └── scaler.pkl                 # Feature scaler / preprocessor
├── src/
│   ├── data_loader.py             # Load + generate training data
│   ├── preprocessing.py           # Feature scaling and encoding
│   ├── feature_engineering.py     # Build features from DB records
│   ├── train.py                   # Model training + comparison
│   ├── evaluate.py                # Evaluation metrics + confusion matrix
│   └── predict.py                 # Production inference (no retraining)
├── requirements.txt
└── README.md
```

---

## Known Limitations

1. **Synthetic training data**: Model is trained entirely on synthetic data; real-world performance will differ and must be validated with actual field data before operational deployment.
2. **No rainfall/temperature features**: Weather data is not currently in the database; adding it would improve accuracy.
3. **No GPS proximity**: Distance to individual animals cannot be computed without real tracking data.
4. **Class imbalance**: Critical events are rare; addressed with `class_weight='balanced'` in training.
5. **Temporal drift**: Seasonal patterns may shift; model should be retrained periodically.
6. **Minimum data threshold**: Villages with < 3 data points trigger an `INSUFFICIENT_DATA` fallback.
7. **Not a movement prediction**: The system predicts *conflict probability*, not animal location.

---

## Model Versioning

| Version | Description                    |
|---------|--------------------------------|
| `rf-v1` | Random Forest, synthetic data  |
