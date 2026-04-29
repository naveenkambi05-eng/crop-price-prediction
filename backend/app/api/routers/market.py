from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.market import CropsResponse, PredictResponse, PricesResponse, StatesResponse
from app.services.predict_service import PredictService
from app.services.price_service import PriceService

router = APIRouter(tags=["market"])


@router.get("/prices", response_model=PricesResponse)
def get_prices(
    crop: str = Query(
        ...,
        min_length=2,
        max_length=30,
        description="Crop name, e.g. rice",
    ),
    state: str | None = Query(
        None,
        min_length=2,
        max_length=50,
        description="Optional state name, e.g. karnataka",
    ),
) -> PricesResponse:
    """
    Return historical prices for a crop.
    """
    rows = PriceService.get_prices(crop=crop, state=state)
    return PricesResponse(crop=crop.lower(), state=state.lower() if state else None, count=len(rows), data=list(rows))


@router.get("/predict", response_model=PredictResponse)
def get_prediction(
    crop: str = Query(
        ...,
        min_length=2,
        max_length=30,
        description="Crop name, e.g. rice",
    ),
    days: int = Query(
        ...,
        ge=1,
        le=30,
        description="Number of days to predict (1-30).",
    ),
    state: str | None = Query(
        None,
        min_length=2,
        max_length=50,
        description="Optional state name, e.g. karnataka",
    ),
) -> PredictResponse:
    """
    Return projected prices for requested number of days.
    """
    predictions = PredictService.predict(crop=crop, days=days, state=state)
    return PredictResponse(crop=crop.lower(), state=state.lower() if state else None, days=days, predictions=predictions)


@router.get("/states", response_model=StatesResponse)
def get_states() -> StatesResponse:
    """
    Return supported states for filtering predictions.
    """
    return StatesResponse(states=PriceService.supported_states())


@router.get("/crops", response_model=CropsResponse)
def get_crops() -> CropsResponse:
    """
    Return supported crops available for prediction.
    """
    return CropsResponse(crops=PriceService.supported_crops())

