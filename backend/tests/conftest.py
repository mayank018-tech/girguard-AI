"""Shared pytest fixtures."""

import pytest
import sys
import os

# Ensure the backend/ directory is importable when running from within tests/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from app.extensions import db as _db
from app.models.village import Village
from app.models.sighting import WildlifeSighting
from app.models.risk import RiskPrediction
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.response_team import ResponseTeam
from app.models.livestock_loss import LivestockLoss
from app.models.tourist_incident import TouristIncident
import datetime


@pytest.fixture(scope="session")
def app():
    """Create application with in-memory SQLite for testing."""
    application = create_app("testing")
    return application


@pytest.fixture(scope="session")
def db(app):
    """Create all tables once per test session."""
    with app.app_context():
        _db.create_all()
        _seed_minimal(app)
        yield _db
        _db.drop_all()


@pytest.fixture
def client(app, db):
    """Test client — reuses session-level db."""
    return app.test_client()


# ── Minimal seed for tests ────────────────────────────────────────────────────

def _seed_minimal(app):
    with app.app_context():
        # Villages
        v1 = Village(id="V001", name="Sasan Gir", district="Junagadh",
                     state="Gujarat", latitude=21.1244, longitude=70.6059,
                     population=2800, livestock_count=420, forest_distance=0.8)
        v2 = Village(id="V002", name="Jamwala", district="Junagadh",
                     state="Gujarat", latitude=21.1800, longitude=70.8100,
                     population=950, livestock_count=180, forest_distance=0.3)
        _db.session.add_all([v1, v2])

        # Response team
        t1 = ResponseTeam(id="TEAM-A1", name="Rapid Response Team Alpha",
                          team_type="Rapid Response", members=6,
                          latitude=21.185, longitude=70.815,
                          location="Jamwala Sector", availability_status="DEPLOYED")
        _db.session.add(t1)

        # Sighting
        s1 = WildlifeSighting(
            id="SIGHT-TEST01", species="Asiatic Lion",
            sighting_date=datetime.date(2024, 1, 15), sighting_time="18:45",
            village_id="V001", latitude=21.115, longitude=70.620,
            source="CAMERA_TRAP", description="Test sighting",
            verification_status="PENDING", confidence=85,
        )
        _db.session.add(s1)

        # Risk prediction
        r1 = RiskPrediction(
            id="RISK-TEST01", village_id="V001", species="Asiatic Lion",
            risk_score=72, risk_level="HIGH", confidence=88,
            reason="Test reason", prediction_window="6h", model_version="demo-v1",
        )
        _db.session.add(r1)

        # Alert
        a1 = Alert(
            id="ALT-TEST01", village_id="V001", species="Asiatic Lion",
            risk_score=72, risk_level="HIGH", confidence=88,
            message="Test alert message", status="NEW",
        )
        _db.session.add(a1)

        # Incident
        i1 = Incident(
            id="INC-TEST01", village_id="V001", species="Asiatic Lion",
            severity="HIGH", description="Test incident",
            incident_type="Proximity Alert",
            detected_at=datetime.datetime(2024, 1, 15, 20, 30, 0),
            assigned_team_id="TEAM-A1", status="ACTIVE",
        )
        _db.session.add(i1)

        # Livestock loss
        l1 = LivestockLoss(
            id="LS-TEST01", village_id="V001",
            livestock_type="Cow", quantity=2, species="Asiatic Lion",
            incident_date=datetime.date(2024, 1, 14),
            description="Test livestock loss", status="SUBMITTED",
        )
        _db.session.add(l1)

        # Tourist incident
        ti1 = TouristIncident(
            id="TI-TEST01", incident_type="Vehicle Breakdown",
            description="Test tourist incident",
            latitude=21.1244, longitude=70.6059,
            severity="LOW", status="OPEN",
        )
        _db.session.add(ti1)

        _db.session.commit()
