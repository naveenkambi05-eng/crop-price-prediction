from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.models import Sequential

from src.config import ModelConfig
from src.inference import forecast_next_days


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Train the LSTM market price forecasting model."
    )
    parser.add_argument("--crop", type=str, default="rice", help="Crop name")
    parser.add_argument("--data", type=str, default="data/sample_prices.csv", help="Path to CSV data")
    parser.add_argument("--epochs", type=int, default=30, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--window-size", type=int, default=30, help="Sequence window size")
    return parser


def ensure_sample_dataset(data_path: Path) -> None:
    """
    Create a realistic sample dataset if no file exists.
    This keeps the project runnable for beginners without external data.
    """
    if data_path.exists():
        return

    data_path.parent.mkdir(parents=True, exist_ok=True)
    np.random.seed(42)

    date_range = pd.date_range(start="2023-01-01", periods=400, freq="D")
    crops = ["rice", "wheat", "maize"]
    rows: list[dict[str, object]] = []

    base_price_map = {"rice": 2100, "wheat": 1900, "maize": 1750}

    for crop in crops:
        base = base_price_map[crop]
        seasonal = 80 * np.sin(np.linspace(0, 10 * np.pi, len(date_range)))
        trend = np.linspace(0, 250, len(date_range))
        noise = np.random.normal(0, 20, len(date_range))
        prices = base + seasonal + trend + noise
        for date, price in zip(date_range, prices, strict=True):
            rows.append({"date": date.date().isoformat(), "crop": crop, "price": round(float(price), 2)})

    df = pd.DataFrame(rows)
    df.to_csv(data_path, index=False)


def load_and_filter_dataset(data_path: Path, crop: str) -> pd.DataFrame:
    df = pd.read_csv(data_path)
    required_columns = {"date", "crop", "price"}
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        raise ValueError(f"Dataset missing required columns: {sorted(missing_columns)}")

    df["date"] = pd.to_datetime(df["date"])
    df["crop"] = df["crop"].str.lower().str.strip()
    crop_df = df[df["crop"] == crop.lower().strip()].copy()
    if crop_df.empty:
        available = ", ".join(sorted(df["crop"].unique().tolist()))
        raise ValueError(f"Crop '{crop}' not found in dataset. Available crops: {available}")

    crop_df = crop_df.sort_values("date")
    crop_df["price"] = pd.to_numeric(crop_df["price"], errors="coerce")
    crop_df = crop_df.dropna(subset=["price"])
    return crop_df


def make_sequences(series: np.ndarray, window_size: int) -> tuple[np.ndarray, np.ndarray]:
    x_data: list[np.ndarray] = []
    y_data: list[float] = []
    for index in range(window_size, len(series)):
        x_data.append(series[index - window_size : index])
        y_data.append(float(series[index]))
    x_array = np.array(x_data, dtype=np.float32).reshape(-1, window_size, 1)
    y_array = np.array(y_data, dtype=np.float32)
    return x_array, y_array


def build_lstm_model(window_size: int) -> Sequential:
    model = Sequential(
        [
            LSTM(64, return_sequences=True, input_shape=(window_size, 1)),
            Dropout(0.2),
            LSTM(32),
            Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mse")
    return model


def save_actual_vs_predicted_plot(
    *,
    output_path: Path,
    actual: np.ndarray,
    predicted: np.ndarray,
    crop: str,
) -> None:
    plt.figure(figsize=(10, 5))
    plt.plot(actual, label="Actual", linewidth=2)
    plt.plot(predicted, label="Predicted", linewidth=2)
    plt.title(f"Actual vs Predicted Prices ({crop.title()})")
    plt.xlabel("Test Samples")
    plt.ylabel("Price")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def main() -> None:
    args = build_arg_parser().parse_args()
    config = ModelConfig(window_size=args.window_size)
    crop = args.crop.strip().lower()
    data_path = Path(args.data)
    ensure_sample_dataset(data_path)

    dataset = load_and_filter_dataset(data_path, crop)
    prices = dataset[config.feature_name].values.reshape(-1, 1).astype(np.float32)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(prices).flatten()

    if len(scaled_prices) <= config.window_size + 10:
        raise ValueError("Not enough data points for selected window_size. Use smaller window or more data.")

    x_all, y_all = make_sequences(scaled_prices, config.window_size)

    split_index = int(len(x_all) * 0.8)
    x_train, x_test = x_all[:split_index], x_all[split_index:]
    y_train, y_test = y_all[:split_index], y_all[split_index:]

    model = build_lstm_model(config.window_size)
    early_stop = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)

    model.fit(
        x_train,
        y_train,
        validation_data=(x_test, y_test),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=[early_stop],
        verbose=1,
    )

    y_pred_scaled = model.predict(x_test, verbose=0).flatten()
    y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
    y_pred_actual = scaler.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()

    rmse = float(np.sqrt(mean_squared_error(y_test_actual, y_pred_actual)))
    mae = float(mean_absolute_error(y_test_actual, y_pred_actual))

    crop_artifact_dir = Path(config.model_dir) / crop
    crop_artifact_dir.mkdir(parents=True, exist_ok=True)

    model_path = crop_artifact_dir / config.model_filename
    scaler_path = crop_artifact_dir / config.scaler_filename
    plot_path = crop_artifact_dir / config.plot_filename
    metadata_path = crop_artifact_dir / config.metadata_filename

    model.save(model_path)
    joblib.dump(scaler, scaler_path)

    save_actual_vs_predicted_plot(
        output_path=plot_path,
        actual=y_test_actual,
        predicted=y_pred_actual,
        crop=crop,
    )

    metadata = {
        "crop": crop,
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "window_size": config.window_size,
        "feature_name": config.feature_name,
        "model_path": str(model_path),
        "scaler_path": str(scaler_path),
        "plot_path": str(plot_path),
        "metrics": {"rmse": round(rmse, 4), "mae": round(mae, 4)},
        "dataset_size": int(len(dataset)),
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print("\nTraining complete")
    print(f"Crop: {crop}")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE : {mae:.4f}")
    print(f"Saved model: {model_path}")
    print(f"Saved scaler: {scaler_path}")
    print(f"Saved plot: {plot_path}")
    print(f"Saved metadata: {metadata_path}")

    # Demo inference for requested horizons so beginners can verify quickly.
    history = prices.flatten().tolist()
    for horizon in (7, 15, 30):
        result = forecast_next_days(history=history, days=horizon, crop=crop, artifacts_root=config.model_dir)
        print(f"\nNext {horizon} days forecast:")
        print(result.predictions)


if __name__ == "__main__":
    main()

