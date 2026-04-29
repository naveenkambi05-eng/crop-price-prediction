from __future__ import annotations

import pandas as pd

from pipeline.config import PipelineConfig


def clean_market_data(df: pd.DataFrame, config: PipelineConfig) -> pd.DataFrame:
    """
    Basic cleaning:
    - keep required columns
    - normalize types and text
    - remove invalid and duplicate rows
    """
    required = {"date", "crop", "price"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Input data missing required columns: {sorted(missing)}")

    clean_df = df.copy()
    clean_df["date"] = pd.to_datetime(clean_df["date"], errors="coerce").dt.date
    clean_df["crop"] = clean_df["crop"].astype(str).str.strip().str.lower()
    clean_df["price"] = pd.to_numeric(clean_df["price"], errors="coerce")

    if "market" not in clean_df.columns:
        clean_df["market"] = config.default_market
    clean_df["market"] = clean_df["market"].astype(str).str.strip().str.lower()

    if "source" not in clean_df.columns:
        clean_df["source"] = config.source_name
    clean_df["source"] = clean_df["source"].astype(str).str.strip().str.lower()

    clean_df = clean_df.dropna(subset=["date", "crop", "price"])
    clean_df = clean_df[clean_df["price"] > 0]
    clean_df = clean_df.drop_duplicates(subset=["date", "crop", "market"], keep="last")
    clean_df = clean_df.sort_values(["crop", "market", "date"]).reset_index(drop=True)
    return clean_df

