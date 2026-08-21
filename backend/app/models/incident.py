"""Incident model."""

import datetime
import enum
from ..extensions import db


class SeverityEnum(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatusEnum(str, enum.Enum):
    DETECTED = "DETECTED"
    VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED"
    VERIFIED = "VERIFIED"
    ALERT_ISSUED = "ALERT_ISSUED"
    TEAM_ASSIGNED = "TEAM_ASSIGNED"
    RESPONSE_ACTIVE = "RESPONSE_ACTIVE"
    STABILIZED = "STABILIZED"
    CLOSED = "CLOSED"
    # Legacy frontend statuses mapped for compatibility
    ACTIVE = "ACTIVE"
    RESPONDING = "RESPONDING"
    MONITORING = "MONITORING"
    RESOLVED = "RESOLVED"


class Incident(db.Model):
    __tablename__ = "incidents"

    id = db.Column(db.String(30), primary_key=True)
    village_id = db.Column(db.String(20), db.ForeignKey("villages.id"), nullable=False, index=True)
    reported_by = db.Column(db.String(50), db.ForeignKey("users.id"), nullable=True)
    species = db.Column(db.String(30), nullable=False, index=True)
    severity = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    incident_type = db.Column(db.String(100), nullable=True)
    detected_at = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    verified_at = db.Column(db.DateTime, nullable=True)
    assigned_team_id = db.Column(db.String(20), db.ForeignKey("response_teams.id"), nullable=True)
    status = db.Column(db.String(30), nullable=False, default=IncidentStatusEnum.DETECTED.value, index=True)
    resolution_notes = db.Column(db.Text, nullable=True)
    closed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    team = db.relationship("ResponseTeam", backref="incidents", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "village_id": self.village_id,
            "village": self.village_rel.name if self.village_rel else None,
            "species": self.species,
            "severity": self.severity,
            "description": self.description,
            "type": self.incident_type,
            "detected": self.detected_at.isoformat() if self.detected_at else None,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "assigned_team_id": self.assigned_team_id,
            "assignedTeam": self.team.name if self.team else None,
            "status": self.status,
            "resolution_notes": self.resolution_notes,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


