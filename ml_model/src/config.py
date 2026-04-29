from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ModelConfig:
    """
    Shared configuration for training + inference.
    In Step 5 we will expand this and persist it as metadata.json.
    """

    window_size: int = 30
    feature_name: str = "price"
    model_dir: str = "artifacts"
    model_filename: str = "lstm_model.h5"
    scaler_filename: str = "scaler.joblib"
    metadata_filename: str = "metadata.json"
    plot_filename: str = "actual_vs_predicted.png"

