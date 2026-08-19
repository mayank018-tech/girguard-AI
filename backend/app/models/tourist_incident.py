"""TouristIncident model."""

import datetime
from ..extensions import db


class TouristIncident(db.Model):
    __tablename__ = "tourist_incidents"

    id = db.Column(db.String(30), primary_key=True)
    incident_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    severity = db.Column(db.String(20), nullable=False, default="LOW")
    status = db.Column(db.String(30), nullable=False, default="OPEN")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "incident_type": self.incident_type,
            "description": self.description,
            "lat": self.latitude,
            "lng": self.longitude,
            "severity": self.severity,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
