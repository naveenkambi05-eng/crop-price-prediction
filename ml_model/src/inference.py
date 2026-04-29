from __future__ import annotations

import json
from pathlib import Path
from dataclasses import dataclass
from typing import Sequence

import joblib
import numpy as np
from tensorflow.keras.models import load_model

from src.config import ModelConfig


@dataclass(frozen=True)
class ForecastResult:
    """
    Returned by the inference function.
    Backend will transform this into JSON in Step 7.
    """

    days: int
    predictions: list[float]


def forecast_next_days(
    *,
    history: Sequence[float],
    days: int,
    crop: str = "rice",
    artifacts_root: str = "artifacts",
) -> ForecastResult:
    """
    Placeholder inference function.
    Step 5 will implement:
    - loading model/scaler artifacts
    - windowing last N points
    - multi-step forecasting
    """
    if days <= 0:
        raise ValueError("days must be > 0")
    if len(history) < 2:
        raise ValueError("history must contain at least 2 points")

    config = ModelConfig()
    crop_name = crop.strip().lower()
    crop_dir = Path(artifacts_root) / crop_name

    model_path = crop_dir / config.model_filename
    scaler_path = crop_dir / config.scaler_filename
    metadata_path = crop_dir / config.metadata_filename

    if not model_path.exists() or not scaler_path.exists() or not metadata_path.exists():
        raise FileNotFoundError(
            f"Model artifacts not found for crop '{crop_name}'. "
            f"Expected: {model_path}, {scaler_path}, {metadata_path}"
        )

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    window_size = int(metadata.get("window_size", config.window_size))

    if len(history) < window_size:
        raise ValueError(f"history must contain at least {window_size} points for inference")

    model = load_model(model_path, compile=False)
    scaler = joblib.load(scaler_path)

    history_array = np.asarray(history, dtype=np.float32).reshape(-1, 1)
    scaled_history = scaler.transform(history_array).flatten().tolist()

    # Start with latest window and recursively append each new prediction.
    rolling_window = scaled_history[-window_size:]
    scaled_predictions: list[float] = []

    for _ in range(days):
        x_input = np.asarray(rolling_window, dtype=np.float32).reshape(1, window_size, 1)
        next_scaled_value = float(model.predict(x_input, verbose=0)[0][0])
        scaled_predictions.append(next_scaled_value)
        rolling_window = rolling_window[1:] + [next_scaled_value]

    predictions_array = np.asarray(scaled_predictions, dtype=np.float32).reshape(-1, 1)
    predictions = scaler.inverse_transform(predictions_array).flatten().tolist()

    return ForecastResult(days=days, predictions=[round(value, 2) for value in predictions])

