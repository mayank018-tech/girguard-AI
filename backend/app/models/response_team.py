"""ResponseTeam model."""

import datetime
from ..extensions import db


class ResponseTeam(db.Model):
    __tablename__ = "response_teams"

    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    team_type = db.Column(db.String(50), nullable=True)
    members = db.Column(db.Integer, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location = db.Column(db.String(150), nullable=True)
    vehicle = db.Column(db.String(100), nullable=True)
    availability_status = db.Column(db.String(30), nullable=False, default="STANDBY")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.team_type,
            "members": self.members,
            "lat": self.latitude,
            "lng": self.longitude,
            "location": self.location,
            "vehicle": self.vehicle,
            "status": self.availability_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
