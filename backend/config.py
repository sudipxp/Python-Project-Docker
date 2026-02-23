"""
Configuration for the backend service.

All MySQL connection details are read from environment variables so it is
easy to run with Docker / Docker Compose.
"""

from functools import lru_cache
import os
from pydantic import BaseModel


def _get_int_env(name: str, default: int) -> int:
    """
    Safely read an integer from an environment variable.
    Falls back to `default` if the value is missing or invalid.
    """

    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


class DatabaseSettings(BaseModel):
    """
    MySQL connection information.

    Values default to a typical Docker Compose setup but can be overridden
    with environment variables:

    - DB_HOST
    - DB_PORT
    - DB_USER
    - DB_PASSWORD
    - DB_NAME
    """

    driver: str = "mysql+pymysql"
    # For local development we default to localhost. When you run API + MySQL
    # both in Docker, override this with DB_HOST=mysql in docker-compose.
    host: str = os.getenv("DB_HOST", "127.0.0.1")
    port: int = _get_int_env("DB_PORT", 3306)
    user: str = os.getenv("DB_USER", "app_user")
    password: str = os.getenv("DB_PASSWORD", "app_password")
    database: str = os.getenv("DB_NAME", "app_db")

    @property
    def url(self) -> str:
        return (
            f"{self.driver}://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.database}"
        )


class Settings(BaseModel):
    db: DatabaseSettings = DatabaseSettings()


@lru_cache
def get_settings() -> Settings:
    """
    In a real project you would probably read environment variables here
    (e.g. using `pydantic-settings` or `os.getenv`). For simplicity this
    returns an object whose attributes you can override via env later.
    """

    return Settings()


settings = get_settings()

