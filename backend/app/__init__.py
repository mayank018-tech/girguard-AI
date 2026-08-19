"""GirGuard AI — Flask Application Factory."""

from flask import Flask
from flask_cors import CORS

from .config import get_config
from .extensions import db
from .utils.errors import register_error_handlers
from .utils.logging import setup_logging


def create_app(config_name: str = None) -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load config
    app.config.from_object(get_config(config_name))

    # Extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Logging
    setup_logging(app)

    # Register blueprints
    from .routes.health import bp as health_bp
    from .routes.villages import bp as villages_bp
    from .routes.sightings import bp as sightings_bp
    from .routes.risk import bp as risk_bp
    from .routes.alerts import bp as alerts_bp
    from .routes.incidents import bp as incidents_bp
    from .routes.response_teams import bp as teams_bp
    from .routes.livestock_loss import bp as livestock_bp
    from .routes.tourist_incidents import bp as tourist_bp

    for blueprint in [
        health_bp, villages_bp, sightings_bp, risk_bp,
        alerts_bp, incidents_bp, teams_bp, livestock_bp, tourist_bp,
    ]:
        app.register_blueprint(blueprint)

    # Error handlers
    register_error_handlers(app)

    # Create tables (dev only — use migrations in production)
    with app.app_context():
        db.create_all()

    return app
