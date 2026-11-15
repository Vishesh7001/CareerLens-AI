
from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check the operational status of the CareerLens AI microservice",
)
def get_health() -> HealthResponse:
    """Return health status of the AI microservice."""
    return HealthResponse(
        status="healthy",
        service="CareerLens AI",
        message="AI service is running",
    )

