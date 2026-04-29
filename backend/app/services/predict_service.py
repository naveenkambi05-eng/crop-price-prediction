from __future__ import annotations

from functools import lru_cache
from pathlib import Path
import sys
from datetime import timedelta
from typing import Final

from app.schemas.market import PredictionPoint
from app.services.price_service import PriceService


class PredictService:
    """
    Prediction service.
    Current implementation uses a simple trend projection so API integration works end-to-end.
    In Step 5/7 this will call the trained LSTM inference module.
    """

    _max_daily_change_ratio: Final[float] = 0.002
    _volatility_weight: Final[float] = 0.2
    _artifacts_root: Final[Path] = Path(__file__).resolve().parents[3] / "ml_model" / "artifacts"
    _model_filename: Final[str] = "lstm_model.h5"
    _scaler_filename: Final[str] = "scaler.joblib"
    _metadata_filename: Final[str] = "metadata.json"

    @classmethod
    def predict(cls, crop: str, days: int, state: str | None = None) -> list[PredictionPoint]:
        history = PriceService.get_prices(crop=crop, state=state)
        if len(history) < 2:
            raise ValueError("Not enough historical data to generate predictions.")

        normalized_crop = crop.strip().lower()
        ml_predictions = None
        if cls._has_lstm_artifacts(normalized_crop):
            ml_predictions = cls._predict_with_lstm(
                crop=normalized_crop,
                days=days,
                history=[point.price for point in history],
            )
        if ml_predictions is not None:
            last_point = history[-1]
            return [
                PredictionPoint(
                    date=last_point.date + timedelta(days=index + 1),
                    predicted_price=round(float(price), 2),
                )
                for index, price in enumerate(ml_predictions)
            ]

        # Fallback method if model artifacts are unavailable.
        # Uses recent trend with strict bounds so 30-day forecasts stay realistic.
        history_prices = [point.price for point in history]
        last_point = history[-1]
        deltas = [history_prices[idx] - history_prices[idx - 1] for idx in range(1, len(history_prices))]
        avg_delta = sum(deltas) / len(deltas)
        avg_abs_delta = sum(abs(delta) for delta in deltas) / len(deltas)
        max_step = max(last_point.price * cls._max_daily_change_ratio, 1.0)
        bounded_trend = max(-max_step, min(max_step, avg_delta))
        bounded_noise = min(avg_abs_delta, max_step * cls._volatility_weight)

        predictions: list[PredictionPoint] = []
        running_price = float(last_point.price)
        cycle = [-0.7, 0.25, -0.2, 0.55, -0.35, 0.15, 0.3]
        for day_offset in range(1, days + 1):
            seasonal_component = bounded_noise * cycle[(day_offset - 1) % len(cycle)]
            projected_price = max(100.0, running_price + bounded_trend + seasonal_component)
            running_price = projected_price
            predictions.append(
                PredictionPoint(
                    date=last_point.date + timedelta(days=day_offset),
                    predicted_price=round(projected_price, 2),
                )
            )

        return predictions

    @classmethod
    def _predict_with_lstm(cls, crop: str, days: int, history: list[float]) -> list[float] | None:
        try:
            forecast_fn = cls._get_lstm_forecast_fn()
            result = forecast_fn(history=history, days=days, crop=crop, artifacts_root=str(cls._artifacts_root))
            return result.predictions
        except Exception:
            return None

    @classmethod
    def _has_lstm_artifacts(cls, crop: str) -> bool:
        crop_dir = cls._artifacts_root / crop
        model_path = crop_dir / cls._model_filename
        scaler_path = crop_dir / cls._scaler_filename
        metadata_path = crop_dir / cls._metadata_filename
        return model_path.exists() and scaler_path.exists() and metadata_path.exists()

    @staticmethod
    @lru_cache(maxsize=1)
    def _get_lstm_forecast_fn():
        ml_model_src = Path(__file__).resolve().parents[3] / "ml_model"
        if str(ml_model_src) not in sys.path:
            sys.path.append(str(ml_model_src))
        from src.inference import forecast_next_days  # pylint: disable=import-outside-toplevel

        return forecast_next_days

