from __future__ import annotations

from pipeline.clean_data import clean_market_data
from pipeline.config import PipelineConfig
from pipeline.fetch_data import fetch_from_csv
from pipeline.store_data import upsert_market_data
from pipeline.trigger_training import trigger_model_training


def run_once() -> None:
    config = PipelineConfig()
    raw_df = fetch_from_csv(config)
    clean_df = clean_market_data(raw_df, config)
    inserted, updated = upsert_market_data(clean_df)
    train_code = trigger_model_training(config)

    print("Pipeline run complete")
    print(f"Rows inserted: {inserted}")
    print(f"Rows updated : {updated}")
    print(f"Train exit code: {train_code}")


if __name__ == "__main__":
    run_once()

