from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"
    __table_args__ = (UniqueConstraint("crop", "market", "price_date", name="uq_crop_market_price_date"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    crop: Mapped[str] = mapped_column(String(50), index=True)
    market: Mapped[str] = mapped_column(String(120), default="default_market")
    price_date: Mapped[date] = mapped_column(Date, index=True)
    price: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(120), default="pipeline")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

