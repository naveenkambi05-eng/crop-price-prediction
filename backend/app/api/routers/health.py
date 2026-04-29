from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    """
    Simple health endpoint for local/dev and deployment checks.
    """
    return {"status": "ok"}

