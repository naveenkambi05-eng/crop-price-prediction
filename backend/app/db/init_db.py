from __future__ import annotations

from app.db.base import Base
from app.db.session import engine
from app.db import models  # noqa: F401  # Ensure model metadata is registered.


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

