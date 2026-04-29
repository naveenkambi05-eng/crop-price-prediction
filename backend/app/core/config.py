from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized configuration.
    Keep secrets out of code; use `.env` in local development.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Market Price Forecasting API"
    env: str = "dev"
    allowed_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    # DB will be wired in Step 6
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/market_prices"
    # Default to synthetic fallback so local development works without DB setup.
    use_synthetic_fallback: bool = True


settings = Settings()

