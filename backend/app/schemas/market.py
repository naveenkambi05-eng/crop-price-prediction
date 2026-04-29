from __future__ import annotations

from datetime import date
from pydantic import BaseModel, Field


class PricePoint(BaseModel):
    date: date
    price: float = Field(gt=0, description="Market price for the given date")


class PricesResponse(BaseModel):
    crop: str
    state: str | None = None
    count: int
    data: list[PricePoint]


class PredictionPoint(BaseModel):
    date: date
    predicted_price: float = Field(gt=0)


class PredictResponse(BaseModel):
    crop: str
    state: str | None = None
    days: int
    predictions: list[PredictionPoint]


class StatesResponse(BaseModel):
    states: list[str]


class CropsResponse(BaseModel):
    crops: list[str]

