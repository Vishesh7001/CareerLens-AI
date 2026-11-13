from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="CareerLens AI")
    message: str = Field(..., example="AI service is running")

