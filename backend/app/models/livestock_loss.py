"""LivestockLoss model."""

import datetime
import enum
from ..extensions import db


class LossStatusEnum(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class LivestockLoss(db.Model):
    __tablename__ = "livestock_losses"

    id = db.Column(db.String(30), primary_key=True)
    claim_id = db.Column(db.String(30), nullable=True)   # govt claim reference
    village_id = db.Column(db.String(20), db.ForeignKey("villages.id"), nullable=True)
    livestock_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    species = db.Column(db.String(30), nullable=True)    # suspected predator species
    incident_date = db.Column(db.Date, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    description = db.Column(db.Text, nullable=True)
    evidence_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(30), nullable=False, default=LossStatusEnum.SUBMITTED.value)
    submitted_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "claim_id": self.claim_id,
            "village_id": self.village_id,
            "village": self.village_rel.name if self.village_rel else None,
            "livestockType": self.livestock_type,
            "count": self.quantity,
            "species": self.species,
            "date": self.incident_date.isoformat() if self.incident_date else None,
            "description": self.description,
            "evidence_url": self.evidence_url,
            "status": self.status,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

