"""WildlifeSighting model."""

import datetime
import enum
from ..extensions import db


class SpeciesEnum(str, enum.Enum):
    LION = "LION"
    LEOPARD = "LEOPARD"
    OTHER = "OTHER"


class SourceEnum(str, enum.Enum):
    CITIZEN = "CITIZEN"
    FOREST_OFFICIAL = "FOREST_OFFICIAL"
    CAMERA_TRAP = "CAMERA_TRAP"
    OTHER = "OTHER"


class VerificationEnum(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class WildlifeSighting(db.Model):
    __tablename__ = "wildlife_sightings"

    id = db.Column(db.String(30), primary_key=True)
    species = db.Column(db.String(30), nullable=False)   # store as string for flexibility
    sighting_date = db.Column(db.Date, nullable=False)
    sighting_time = db.Column(db.String(10), nullable=True)
    village_id = db.Column(db.String(20), db.ForeignKey("villages.id"), nullable=True)
    user_id = db.Column(db.String(50), db.ForeignKey("users.id"), nullable=True)
    # Generalised coordinates â€” never expose exact wildlife locations publicly
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    source = db.Column(db.String(20), nullable=False, default=SourceEnum.CITIZEN.value)
    description = db.Column(db.Text, nullable=True)
    verification_status = db.Column(
        db.String(20), nullable=False, default=VerificationEnum.PENDING.value
    )
    confidence = db.Column(db.Integer, nullable=True)  # 0-100
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self, include_coords: bool = False):
        d = {
            "id": self.id,
            "species": self.species,
            "date": self.sighting_date.isoformat() if self.sighting_date else None,
            "time": self.sighting_time,
            "village_id": self.village_id,
            "village": self.village_rel.name if self.village_rel else None,
            "source": self.source,
            "description": self.description,
            "status": self.verification_status,
            "confidence": self.confidence,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_coords:
            d["lat"] = self.latitude
            d["lng"] = self.longitude
        return d

