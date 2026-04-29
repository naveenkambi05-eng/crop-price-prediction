from __future__ import annotations

from collections.abc import Sequence
from datetime import date
import hashlib
from fastapi import HTTPException, status
from sqlalchemy import select

from app.db.models import MarketPrice
from app.db.session import SessionLocal
from app.schemas.market import PricePoint


class PriceService:
    """
    Service that provides historical price data.
    Uses in-memory sample data for now; Step 6 will switch this to DB queries.
    """

    _sample_data: dict[str, list[PricePoint]] = {
        "rice": [
            PricePoint(date=date(2026, 4, 1), price=2140),
            PricePoint(date=date(2026, 4, 2), price=2160),
            PricePoint(date=date(2026, 4, 3), price=2135),
            PricePoint(date=date(2026, 4, 4), price=2188),
            PricePoint(date=date(2026, 4, 5), price=2205),
            PricePoint(date=date(2026, 4, 6), price=2222),
            PricePoint(date=date(2026, 4, 7), price=2216),
        ],
        "wheat": [
            PricePoint(date=date(2026, 4, 1), price=1980),
            PricePoint(date=date(2026, 4, 2), price=1995),
            PricePoint(date=date(2026, 4, 3), price=2012),
            PricePoint(date=date(2026, 4, 4), price=2025),
            PricePoint(date=date(2026, 4, 5), price=2030),
            PricePoint(date=date(2026, 4, 6), price=2044),
            PricePoint(date=date(2026, 4, 7), price=2055),
        ],
        "maize": [
            PricePoint(date=date(2026, 4, 1), price=1788),
            PricePoint(date=date(2026, 4, 2), price=1802),
            PricePoint(date=date(2026, 4, 3), price=1796),
            PricePoint(date=date(2026, 4, 4), price=1815),
            PricePoint(date=date(2026, 4, 5), price=1822),
            PricePoint(date=date(2026, 4, 6), price=1835),
            PricePoint(date=date(2026, 4, 7), price=1848),
        ],
        "cotton": [
            PricePoint(date=date(2026, 4, 1), price=6420),
            PricePoint(date=date(2026, 4, 2), price=6468),
            PricePoint(date=date(2026, 4, 3), price=6512),
            PricePoint(date=date(2026, 4, 4), price=6496),
            PricePoint(date=date(2026, 4, 5), price=6550),
            PricePoint(date=date(2026, 4, 6), price=6592),
            PricePoint(date=date(2026, 4, 7), price=6628),
        ],
    }
    _sample_state_adjustment: dict[str, float] = {
        "all states": 1.0,
        "andhra pradesh": 1.01,
        "karnataka": 0.99,
        "tamil nadu": 1.02,
        "telangana": 1.0,
        "maharashtra": 1.015,
        "kerala": 1.03,
    }
    _fallback_base_price: dict[str, float] = {
        "sugarcane": 360.0,
        "barley": 1900.0,
        "millet": 2300.0,
        "sorghum": 2900.0,
        "soybean": 4400.0,
        "groundnut": 5900.0,
        "mustard": 5600.0,
        "sunflower": 5400.0,
        "pulses": 6700.0,
        "potato": 1650.0,
        "onion": 2100.0,
        "tomato": 1900.0,
    }

    @classmethod
    def _generate_sample_prices(cls, crop: str) -> list[PricePoint]:
        """
        Build deterministic fallback prices for crops not present in static sample data.
        This keeps UI/API usable for the full crop list when DB data is unavailable.
        """
        normalized = crop.strip().lower()
        seed = int(hashlib.sha1(normalized.encode("utf-8")).hexdigest()[:8], 16)
        base_price = cls._fallback_base_price.get(normalized, 2500.0)
        daily_change_pattern = [-0.008, 0.006, -0.004, 0.007, 0.005, -0.003, 0.006]
        start = date(2026, 4, 1)
        prices: list[PricePoint] = []
        running = float(base_price)
        # Small deterministic jitter keeps values stable but avoids flat lines.
        jitter = ((seed % 21) - 10) / 10000.0
        for index, daily_change in enumerate(daily_change_pattern):
            running = max(100.0, running * (1 + daily_change + jitter))
            prices.append(
                PricePoint(
                    date=date(start.year, start.month, start.day + index),
                    price=round(running, 2),
                )
            )
        return prices

    @classmethod
    def supported_states(cls) -> list[str]:
        db_states = cls._get_supported_states_from_db()
        if db_states:
            return db_states
        return [state for state in cls._sample_state_adjustment.keys() if state != "all states"]

    @classmethod
    def supported_crops(cls) -> list[str]:
        db_crops = cls._get_supported_crops_from_db()
        if db_crops:
            return db_crops
        return sorted(cls._sample_data.keys())

    @classmethod
    def _get_supported_crops_from_db(cls) -> list[str]:
        try:
            with SessionLocal() as session:
                rows = session.execute(select(MarketPrice.crop).distinct()).scalars().all()
            return sorted({crop.strip().lower() for crop in rows if crop})
        except Exception:
            # If DB is unavailable, fall back to in-memory sample data.
            return []

    @classmethod
    def _get_supported_states_from_db(cls) -> list[str]:
        try:
            with SessionLocal() as session:
                rows = session.execute(select(MarketPrice.market).distinct()).scalars().all()
            return sorted({state.strip().lower() for state in rows if state})
        except Exception:
            return []

    @classmethod
    def get_prices(cls, crop: str, state: str | None = None) -> Sequence[PricePoint]:
        normalized_crop = crop.strip().lower()
        normalized_state = state.strip().lower() if state else None
        db_prices = cls._get_prices_from_db(normalized_crop, normalized_state)
        if db_prices:
            return db_prices

        base_prices = cls._sample_data.get(normalized_crop, cls._generate_sample_prices(normalized_crop))
        if not normalized_state or normalized_state == "all states":
            return base_prices
        factor = cls._sample_state_adjustment.get(normalized_state)
        if factor is None:
            supported_states = ", ".join(cls.supported_states())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"State '{state}' not found. Supported states: {supported_states}",
            )
        return [
            PricePoint(date=point.date, price=round(point.price * factor, 2))
            for point in base_prices
        ]

    @classmethod
    def _get_prices_from_db(cls, crop: str, state: str | None = None) -> list[PricePoint]:
        try:
            with SessionLocal() as session:
                query = (
                    select(MarketPrice.price_date, MarketPrice.price)
                    .where(MarketPrice.crop == crop)
                    .order_by(MarketPrice.price_date.asc())
                )
                if state and state != "all states":
                    query = query.where(MarketPrice.market == state)
                rows = (
                    session.execute(query).all()
                )
            return [PricePoint(date=row.price_date, price=float(row.price)) for row in rows]
        except Exception:
            # Fail open so API still works with sample data if DB is down.
            return []

