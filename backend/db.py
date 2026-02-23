"""
Database setup (SQLAlchemy + MySQL).
"""

from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from .config import settings


engine = create_engine(
    settings.db.url,
    future=True,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def db_session() -> Session:
    """
    Utility context manager if you need manual sessions outside FastAPI.
    """

    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

