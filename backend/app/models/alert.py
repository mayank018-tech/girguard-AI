"""Alert model."""

import datetime
import enum
from ..extensions import db


class AlertStatusEnum(str, enum.Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.String(30), primary_key=True)
    village_id = db.Column(db.String(20), db.ForeignKey("villages.id"), nullable=False, index=True)
    species = db.Column(db.String(30), nullable=False)
    risk_score = db.Column(db.Integer, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Integer, nullable=True)
    message = db.Column(db.Text, nullable=True)
    language = db.Column(db.String(10), nullable=False, default="en")
    status = db.Column(db.String(20), nullable=False, default=AlertStatusEnum.NEW.value)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    acknowledged_at = db.Column(db.DateTime, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "village_id": self.village_id,
            "village": self.village_rel.name if self.village_rel else None,
            "animal": self.species,
            "species": self.species,
            "riskScore": self.risk_score,
            "riskLevel": self.risk_level,
            "confidence": self.confidence,
            "reason": self.message,
            "message": self.message,
            "language": self.language,
            "status": self.status,
            "time": self.created_at.isoformat() if self.created_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }

