from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analyzer import run_resume_analysis
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["Resume Analysis"])


@router.post(
    "",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze candidate resume against target role",
    description="Evaluates technical skills, projects, experience, education, certifications, and completeness, producing structured feedback and scoring.",
)
def analyze_resume(request: AnalysisRequest) -> AnalysisResponse:
    try:
        if not request.target_role or not request.target_role.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target career role must be provided for analysis.",
            )

        response = run_resume_analysis(
            resume_data=request.resume_data,
            target_role=request.target_role.strip(),
            job_description=request.job_description,
            raw_text=request.raw_text,
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate resume analysis: {str(e)}",
        )
