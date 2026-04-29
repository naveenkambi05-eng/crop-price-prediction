from __future__ import annotations

import pandas as pd
from sqlalchemy import select

from app.db.init_db import init_db
from app.db.models import MarketPrice
from app.db.session import SessionLocal


def upsert_market_data(df: pd.DataFrame) -> tuple[int, int]:
    """
    Insert new rows and update existing rows by (crop, market, date).
    Returns: (inserted_count, updated_count)
    """
    init_db()
    inserted = 0
    updated = 0

    with SessionLocal() as session:
        for row in df.itertuples(index=False):
            existing = session.execute(
                select(MarketPrice).where(
                    MarketPrice.crop == row.crop,
                    MarketPrice.market == row.market,
                    MarketPrice.price_date == row.date,
                )
            ).scalar_one_or_none()

            if existing:
                existing.price = float(row.price)
                existing.market = row.market
                existing.source = row.source
                updated += 1
            else:
                session.add(
                    MarketPrice(
                        crop=row.crop,
                        market=row.market,
                        price_date=row.date,
                        price=float(row.price),
                        source=row.source,
                    )
                )
                inserted += 1
        session.commit()

    return inserted, updated

