"""
GirGuard AI - Database Seed Script
===================================
Generates SYNTHETIC/DEMO data only.
All records are clearly labelled with data_source = "SYNTHETIC_DEMO".
Do NOT use real sensitive wildlife coordinates.

Usage:
    python seed.py
    python seed.py --reset   # drop and re-create tables first
"""

import sys
import datetime
import random
import uuid

from app import create_app
from app.extensions import db
from app.models.village import Village
from app.models.sighting import WildlifeSighting
from app.models.risk import RiskPrediction
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.response_team import ResponseTeam
from app.models.livestock_loss import LivestockLoss
from app.models.tourist_incident import TouristIncident


def _id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


def seed():
    reset = "--reset" in sys.argv

    app = create_app("development")
    with app.app_context():
        if reset:
            print("Dropping all tables...")
            db.drop_all()
        db.create_all()

        # ── 15 Villages ──────────────────────────────────────────────────────
        villages_data = [
            ("V001", "Sasan Gir",    "Junagadh", 21.1244, 70.6059, 2800, 420, 0.8),
            ("V002", "Jamwala",      "Junagadh", 21.1800, 70.8100,  950, 180, 0.3),
            ("V003", "Visavadar",    "Junagadh", 21.5498, 70.5250, 1800, 260, 2.1),
            ("V004", "Talala",       "Junagadh", 21.0100, 70.4450, 3200, 510, 4.5),
            ("V005", "Mendarda",     "Junagadh", 21.3100, 70.4550, 1500, 220, 3.2),
            ("V006", "Maliya",       "Junagadh", 21.3700, 70.5850, 2100, 310, 5.1),
            ("V007", "Kodinar",      "Junagadh", 20.7950, 70.7020, 4500, 680, 6.8),
            ("V008", "Una",          "Junagadh", 20.8211, 71.0368, 8200, 920, 9.2),
            ("V009", "Dhari",        "Amreli",   21.3281, 71.0178, 2600, 390, 3.9),
            ("V010", "Rajula",       "Amreli",   21.0392, 71.4367, 5800, 770, 7.3),
            ("V011", "Lathi",        "Amreli",   21.7235, 71.3875, 1200, 160, 2.6),
            ("V012", "Amreli City",  "Amreli",   21.6031, 71.2205, 55000, 1200, 12.4),
            ("V013", "Veraval",      "Junagadh", 20.9073, 70.3673, 12000, 1450, 11.1),
            ("V014", "Junagadh",     "Junagadh", 21.5222, 70.4580, 320000, 2800, 15.6),
            ("V015", "Gir Forest HQ","Junagadh", 21.1337, 70.8254, 500, 60, 0.1),
        ]
        existing_village_ids = {v.id for v in Village.query.all()}
        villages = []
        for row in villages_data:
            vid, name, district, lat, lng, pop, livestock, fdist = row
            if vid not in existing_village_ids:
                v = Village(id=vid, name=name, district=district, state="Gujarat",
                            latitude=lat, longitude=lng, population=pop,
                            livestock_count=livestock, forest_distance=fdist)
                db.session.add(v)
                villages.append(v)
            else:
                villages.append(Village.query.get(vid))
        db.session.flush()
        print(f"  Villages: {len(villages_data)} records")

        # ── 5 Response Teams ────────────────────────────────────────────────
        teams_data = [
            ("TEAM-A1", "Rapid Response Team Alpha", "Rapid Response", 6,
             21.185, 70.815, "Jamwala Sector", "Gypsy 4WD", "DEPLOYED"),
            ("TEAM-B1", "Forest Response Team Beta",  "Forest Response", 5,
             21.124, 70.605, "Sasan Gir HQ",   "Patrol Vehicle", "STANDBY"),
            ("TEAM-C1", "Patrol Unit 1",              "Patrol",          3,
             21.310, 70.455, "Mendarda Zone",  "Motorcycle", "PATROLLING"),
            ("TEAM-D1", "Wildlife Veterinary Team",   "Veterinary",      4,
             21.549, 70.525, "Visavadar Clinic","Medical Van", "STANDBY"),
            ("TEAM-E1", "Night Patrol Unit",          "Night Patrol",    4,
             21.003, 70.445, "Talala Range",   "Gypsy 4WD", "OFF_DUTY"),
        ]
        existing_team_ids = {t.id for t in ResponseTeam.query.all()}
        teams = []
        for row in teams_data:
            tid, name, ttype, members, lat, lng, loc, vehicle, status = row
            if tid not in existing_team_ids:
                t = ResponseTeam(id=tid, name=name, team_type=ttype, members=members,
                                 latitude=lat, longitude=lng, location=loc,
                                 vehicle=vehicle, availability_status=status)
                db.session.add(t)
                teams.append(t)
            else:
                teams.append(ResponseTeam.query.get(tid))
        db.session.flush()
        print(f"  Response Teams: {len(teams_data)} records")

        # ── 40 Wildlife Sightings ────────────────────────────────────────────
        # Generalised coordinates only - shifted ±0.05 degrees (~5km)
        species_pool   = ["Asiatic Lion", "Leopard", "Asiatic Lion", "Asiatic Lion", "Leopard"]
        source_pool    = ["CITIZEN", "FOREST_OFFICIAL", "CAMERA_TRAP", "CITIZEN", "OTHER"]
        status_pool    = ["PENDING", "VERIFIED", "PENDING", "VERIFIED", "REJECTED"]
        descriptions   = [
            "Animal seen near water source at dusk.",
            "Tracks observed along forest boundary.",
            "Camera trap trigger - movement confirmed.",
            "Resident reported movement near agricultural field.",
            "Sounds heard overnight - likely territorial call.",
            "Animal crossing village road observed.",
            "Pugmarks found near livestock pen.",
            "Sighting reported by patrol officer.",
        ]
        existing_sight_ids = {s.id for s in WildlifeSighting.query.all()}
        sight_count = 0
        sight_date_base = datetime.date(2024, 1, 10)
        for i in range(40):
            sid = f"SIGHT-S{i+1:03d}"
            if sid in existing_sight_ids:
                continue
            village = villages[i % len(villages)]
            delta_days = random.randint(0, 14)
            sdate = sight_date_base + datetime.timedelta(days=delta_days)
            hour = random.choice([6, 7, 18, 19, 20, 21, 22, 5])
            # Generalised coords: offset village coords by small random amount
            lat = round(village.latitude  + random.uniform(-0.04, 0.04), 4)
            lng = round(village.longitude + random.uniform(-0.04, 0.04), 4)
            s = WildlifeSighting(
                id=sid,
                species=random.choice(species_pool),
                sighting_date=sdate,
                sighting_time=f"{hour:02d}:{random.randint(0,59):02d}",
                village_id=village.id,
                latitude=lat,
                longitude=lng,
                source=random.choice(source_pool),
                description=random.choice(descriptions),
                verification_status=random.choice(status_pool),
                confidence=random.randint(60, 95),
            )
            db.session.add(s)
            sight_count += 1
        db.session.flush()
        print(f"  Wildlife Sightings: {sight_count} new records")

        # ── 20 Risk Predictions ──────────────────────────────────────────────
        risk_reasons = [
            "Forest boundary < 1 km. Night hours - peak wildlife activity.",
            "Recent verified sighting within 48h. High livestock density.",
            "2 pending sightings. Movement corridor overlap.",
            "Historical baseline - no recent sightings.",
            "Recent incident. Forest proximity 2.1 km.",
            "Camera trap activity detected. Seasonal movement pattern.",
        ]
        risk_levels_by_score = [
            (88, "CRITICAL"), (82, "CRITICAL"), (73, "HIGH"), (65, "HIGH"),
            (55, "ELEVATED"), (48, "ELEVATED"), (38, "MODERATE"), (25, "MODERATE"),
            (15, "LOW"), (10, "LOW"), (78, "HIGH"), (90, "CRITICAL"),
            (60, "ELEVATED"), (35, "MODERATE"), (18, "LOW"), (70, "HIGH"),
            (45, "ELEVATED"), (30, "MODERATE"), (85, "CRITICAL"), (12, "LOW"),
        ]
        existing_risk_ids = {r.id for r in RiskPrediction.query.all()}
        risk_count = 0
        for i in range(20):
            rid = f"RISK-S{i+1:03d}"
            if rid in existing_risk_ids:
                continue
            village = villages[i % len(villages)]
            score, level = risk_levels_by_score[i]
            r = RiskPrediction(
                id=rid,
                village_id=village.id,
                species=random.choice(["Asiatic Lion", "Leopard", None]),
                risk_score=score,
                risk_level=level,
                confidence=random.randint(65, 92),
                reason=random.choice(risk_reasons),
                prediction_window="6h",
                model_version="demo-v1",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(0, 48)),
            )
            db.session.add(r)
            risk_count += 1
        db.session.flush()
        print(f"  Risk Predictions: {risk_count} new records")

        # ── 15 Alerts ────────────────────────────────────────────────────────
        alert_messages = [
            "CRITICAL: Lion spotted near village boundary. Avoid outdoor activity.",
            "HIGH: Leopard sighting confirmed. Keep livestock secured.",
            "ELEVATED: Recent wildlife movement detected in corridor.",
            "HIGH: Multiple verified sightings in last 48h. Stay alert.",
            "CRITICAL: Active incident - response team deployed.",
        ]
        alert_statuses = ["NEW", "NEW", "ACKNOWLEDGED", "NEW", "IN_PROGRESS",
                          "RESOLVED", "NEW", "ACKNOWLEDGED", "NEW", "NEW",
                          "IN_PROGRESS", "NEW", "ACKNOWLEDGED", "RESOLVED", "NEW"]
        risk_data_pool = [
            (88, "CRITICAL"), (82, "CRITICAL"), (73, "HIGH"), (65, "HIGH"), (55, "ELEVATED"),
            (48, "ELEVATED"), (38, "MODERATE"), (78, "HIGH"), (90, "CRITICAL"), (15, "LOW"),
            (70, "HIGH"), (45, "ELEVATED"), (85, "CRITICAL"), (30, "MODERATE"), (60, "ELEVATED"),
        ]
        existing_alert_ids = {a.id for a in Alert.query.all()}
        alert_count = 0
        for i in range(15):
            aid = f"ALT-S{i+1:03d}"
            if aid in existing_alert_ids:
                continue
            village = villages[i % len(villages)]
            score, level = risk_data_pool[i]
            status = alert_statuses[i]
            acked_at = datetime.datetime.utcnow() if status in ("ACKNOWLEDGED", "RESOLVED", "IN_PROGRESS") else None
            resolved_at = datetime.datetime.utcnow() if status == "RESOLVED" else None
            a = Alert(
                id=aid,
                village_id=village.id,
                species=random.choice(["Asiatic Lion", "Leopard"]),
                risk_score=score,
                risk_level=level,
                confidence=random.randint(65, 92),
                message=random.choice(alert_messages),
                language="en",
                status=status,
                acknowledged_at=acked_at,
                resolved_at=resolved_at,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 72)),
            )
            db.session.add(a)
            alert_count += 1
        db.session.flush()
        print(f"  Alerts: {alert_count} new records")

        # ── 15 Incidents ─────────────────────────────────────────────────────
        inc_types = [
            "Proximity Alert", "Agricultural Transit", "Livestock Predation",
            "Village Entry", "Territorial Marking", "Tourist Zone Breach",
        ]
        inc_descriptions = [
            "Sub-adult male lion territorial movement near village boundary.",
            "Leopard spotted crossing agricultural land near forest edge.",
            "Livestock attacked overnight - evidence of predation found.",
            "Wildlife entered village periphery - residents alerted.",
            "Fresh scent markings and pugmarks found near cattle shed.",
            "Animal seen near tourist trail - area cordoned off.",
        ]
        inc_statuses = [
            "DETECTED", "VERIFICATION_REQUIRED", "VERIFIED", "ALERT_ISSUED",
            "TEAM_ASSIGNED", "RESPONSE_ACTIVE", "STABILIZED", "CLOSED",
            "ACTIVE", "RESPONDING", "MONITORING", "DETECTED", "VERIFIED",
            "TEAM_ASSIGNED", "CLOSED",
        ]
        sev_pool = ["CRITICAL", "HIGH", "HIGH", "MODERATE", "LOW", "CRITICAL",
                    "HIGH", "MODERATE", "CRITICAL", "HIGH", "MODERATE",
                    "LOW", "HIGH", "CRITICAL", "MODERATE"]
        existing_inc_ids = {inc.id for inc in Incident.query.all()}
        inc_count = 0
        for i in range(15):
            iid = f"INC-S{i+1:03d}"
            if iid in existing_inc_ids:
                continue
            village = villages[i % len(villages)]
            team = teams[i % len(teams)] if i % 3 == 0 else None
            status = inc_statuses[i]
            det_at = datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 96))
            ver_at = det_at + datetime.timedelta(hours=1) if status not in ("DETECTED", "VERIFICATION_REQUIRED") else None
            closed_at = det_at + datetime.timedelta(hours=random.randint(2, 12)) if status == "CLOSED" else None
            inc = Incident(
                id=iid,
                village_id=village.id,
                species=random.choice(["Asiatic Lion", "Leopard"]),
                severity=sev_pool[i],
                description=random.choice(inc_descriptions),
                incident_type=random.choice(inc_types),
                detected_at=det_at,
                verified_at=ver_at,
                assigned_team_id=team.id if team else None,
                status=status,
                resolution_notes="SYNTHETIC_DEMO" if status == "CLOSED" else None,
                closed_at=closed_at,
            )
            db.session.add(inc)
            inc_count += 1
        db.session.flush()
        print(f"  Incidents: {inc_count} new records")

        # ── 10 Livestock Loss Claims ─────────────────────────────────────────
        livestock_types = ["Cow", "Buffalo", "Goat", "Sheep", "Donkey"]
        loss_statuses = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "VERIFICATION_REQUIRED",
                         "REJECTED", "SUBMITTED", "UNDER_REVIEW", "APPROVED",
                         "SUBMITTED", "UNDER_REVIEW"]
        existing_loss_ids = {l.id for l in LivestockLoss.query.all()}
        loss_count = 0
        for i in range(10):
            lid = f"LS-S{i+1:03d}"
            if lid in existing_loss_ids:
                continue
            village = villages[i % 8]  # Use first 8 villages
            ltype = livestock_types[i % len(livestock_types)]
            qty = random.randint(1, 5)
            idate = datetime.date(2024, 1, 1) + datetime.timedelta(days=random.randint(0, 20))
            loss = LivestockLoss(
                id=lid,
                claim_id=f"GUJ-{random.randint(10000, 99999)}",
                village_id=village.id,
                livestock_type=ltype,
                quantity=qty,
                species=random.choice(["Asiatic Lion", "Leopard"]),
                incident_date=idate,
                latitude=round(village.latitude + random.uniform(-0.02, 0.02), 4),
                longitude=round(village.longitude + random.uniform(-0.02, 0.02), 4),
                description=f"SYNTHETIC_DEMO: {qty} {ltype.lower()}(s) predated near forest boundary.",
                status=loss_statuses[i],
            )
            db.session.add(loss)
            loss_count += 1
        db.session.flush()
        print(f"  Livestock Loss Claims: {loss_count} new records")

        # ── 10 Tourist Incidents ─────────────────────────────────────────────
        tourist_types = [
            "Wildlife Proximity", "Trail Violation", "Vehicle Breakdown",
            "Medical Emergency", "Unauthorized Entry",
        ]
        tourist_descriptions = [
            "Lion approached safari vehicle within 20m - guests evacuated safely.",
            "Tourists found off-designated trail near core zone.",
            "Safari jeep breakdown in zone 3 - rescue dispatched.",
            "Tourist suffered heat exhaustion near Devaliya Safari Park.",
            "Unauthorized entry through restricted eastern gate.",
        ]
        tourist_statuses = ["OPEN", "RESOLVED", "OPEN", "RESOLVED", "OPEN",
                            "RESOLVED", "OPEN", "OPEN", "RESOLVED", "OPEN"]
        tourist_locs = [
            (21.134, 70.804), (21.158, 70.765), (21.112, 70.695),
            (21.143, 70.778), (21.167, 70.812), (21.099, 70.721),
            (21.128, 70.754), (21.151, 70.791), (21.088, 70.680),
            (21.172, 70.831),
        ]
        existing_ti_ids = {t.id for t in TouristIncident.query.all()}
        ti_count = 0
        for i in range(10):
            tiid = f"TI-S{i+1:03d}"
            if tiid in existing_ti_ids:
                continue
            lat, lng = tourist_locs[i]
            status = tourist_statuses[i]
            created = datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 120))
            resolved = created + datetime.timedelta(hours=random.randint(1, 4)) if status == "RESOLVED" else None
            ti = TouristIncident(
                id=tiid,
                incident_type=tourist_types[i % len(tourist_types)],
                description=f"SYNTHETIC_DEMO: {tourist_descriptions[i % len(tourist_descriptions)]}",
                latitude=lat,
                longitude=lng,
                severity=random.choice(["LOW", "MODERATE", "HIGH"]),
                status=status,
                created_at=created,
                resolved_at=resolved,
            )
            db.session.add(ti)
            ti_count += 1
        db.session.flush()
        print(f"  Tourist Incidents: {ti_count} new records")

        db.session.commit()
        print("\n[SEED COMPLETE] All SYNTHETIC_DEMO data committed.")
        print("Note: All coordinates are generalised (±5km offset). No real sensitive wildlife locations.")


if __name__ == "__main__":
    seed()
