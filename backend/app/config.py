import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "CampusPark API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # CouchDB configuration
    COUCHDB_URL: str = "http://127.0.0.1:5984"
    COUCHDB_USERNAME: str = "admin"
    COUCHDB_PASSWORD: str = "123456"

    # Database names
    DB_USERS: str = "campuspark_users"
    DB_ZONES: str = "campuspark_zones"
    DB_BOOKINGS: str = "campuspark_bookings"
    DB_LOCKS: str = "campuspark_locks"
    DB_INBOX: str = "campuspark_inbox"

    # JWT Authentication
    JWT_SECRET_KEY: str = "campuspark_super_secret_jwt_key_2026_nosql_subject_secure_token"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS settings
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
