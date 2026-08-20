"""GirGuard AI — Configuration classes."""

import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

    # IBM Cloud — placeholders (never hard-code)
    IBM_CLOUD_API_KEY = os.environ.get("IBM_CLOUD_API_KEY", "")
    GRANITE_API_URL = os.environ.get("GRANITE_API_URL", "")

    # Pagination
    PAGE_SIZE = 20


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///girguard_dev.db"
    )


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    # Disable CSRF for tests
    WTF_CSRF_ENABLED = False


class ProductionConfig(BaseConfig):
    DEBUG = False
    # PostgreSQL on IBM Cloud / Supabase
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///girguard_dev.db")
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        # Fix for SQLAlchemy 1.4+ requiring postgresql://
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
            "postgres://", "postgresql://", 1
        )


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(config_name: str = None):
    """Return config class based on FLASK_ENV or explicit name."""
    name = config_name or os.environ.get("FLASK_ENV", "development")
    return CONFIG_MAP.get(name, DevelopmentConfig)
