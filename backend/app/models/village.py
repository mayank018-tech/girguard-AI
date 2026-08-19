"""Village model."""

import datetime
from ..extensions import db


class Village(db.Model):
    __tablename__ = "villages"

    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False, default="Gujarat")
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    population = db.Column(db.Integer, nullable=True)
    livestock_count = db.Column(db.Integer, nullable=True)
    forest_distance = db.Column(db.Float, nullable=True)  # km
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationships
    sightings = db.relationship("WildlifeSighting", backref="village_rel", lazy="dynamic")
    risk_predictions = db.relationship("RiskPrediction", backref="village_rel", lazy="dynamic")
    alerts = db.relationship("Alert", backref="village_rel", lazy="dynamic")
    incidents = db.relationship("Incident", backref="village_rel", lazy="dynamic")
    livestock_losses = db.relationship("LivestockLoss", backref="village_rel", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "district": self.district,
            "state": self.state,
            "lat": self.latitude,
            "lng": self.longitude,
            "population": self.population,
            "livestock_count": self.livestock_count,
            "forest_distance": self.forest_distance,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
