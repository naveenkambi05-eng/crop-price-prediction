from __future__ import annotations

from pathlib import Path

import pandas as pd

from pipeline.config import PipelineConfig


def fetch_from_csv(config: PipelineConfig) -> pd.DataFrame:
    """
    Read local CSV data.
    Expected columns: date, crop, price
    Optional columns: market, source
    """
    csv_path = Path(__file__).resolve().parent / config.data_csv_path
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    return pd.read_csv(csv_path)

