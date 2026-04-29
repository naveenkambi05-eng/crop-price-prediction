from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from pipeline.config import PipelineConfig


def trigger_model_training(config: PipelineConfig) -> int:
    """
    Triggers ML model retraining after fresh data ingestion.
    """
    repo_root = Path(__file__).resolve().parents[2]
    ml_dir = repo_root / "ml_model"
    train_cmd = [
        sys.executable,
        "-m",
        "src.train",
        "--crop",
        config.model_crop,
        "--data",
        "data/sample_prices.csv",
        "--epochs",
        str(config.retrain_epochs),
    ]
    result = subprocess.run(train_cmd, cwd=ml_dir, check=False)
    return result.returncode

