"""RiskPrediction model."""

import datetime
import enum
from ..extensions import db


class RiskLevelEnum(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    ELEVATED = "ELEVATED"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskPrediction(db.Model):
    __tablename__ = "risk_predictions"

    id = db.Column(db.String(30), primary_key=True)
    village_id = db.Column(db.String(20), db.ForeignKey("villages.id"), nullable=False)
    species = db.Column(db.String(30), nullable=True)
    risk_score = db.Column(db.Integer, nullable=False)   # 0-100
    risk_level = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Integer, nullable=True)    # 0-100 (stored as int percentage)
    prediction_window = db.Column(db.String(50), nullable=True, default="6h")
    reason = db.Column(db.Text, nullable=True)
    # top_factors stored as JSON-encoded list
    top_factors_json = db.Column(db.Text, nullable=True)
    model_version = db.Column(db.String(30), nullable=False, default="rf-v1")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        import json
        top_factors = []
        if self.top_factors_json:
            try:
                top_factors = json.loads(self.top_factors_json)
            except (ValueError, TypeError):
                top_factors = []

        return {
            "id":               self.id,
            "village_id":       self.village_id,
            "village":          self.village_rel.name if self.village_rel else None,
            "species":          self.species,
            "riskScore":        self.risk_score,
            "riskLevel":        self.risk_level,
            "confidence":       self.confidence,
            "prediction_window":self.prediction_window,
            "reason":           self.reason,
            "top_factors":      top_factors,
            "model_version":    self.model_version,
            "timestamp":        self.created_at.isoformat() if self.created_at else None,
        }
