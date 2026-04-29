from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PipelineConfig:
    # Local CSV fallback keeps the pipeline runnable without external API keys.
    data_csv_path: str = "../ml_model/data/sample_prices.csv"
    source_name: str = "sample_csv"
    default_market: str = "local_market"
    model_crop: str = "rice"
    retrain_epochs: int = 20

