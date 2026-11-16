from fastapi import APIRouter, HTTPException, status
from app.schemas.job import (
    JobParseRequest,
    JobParseResponse,
    JobMatchRequest,
    JobMatchResponse,
    CareerRecommendationRequest,
    CareerRecommendationResponse,
    RoadmapRequest,
    RoadmapResponse,
)
from app.services.job_matcher import (
    parse_job_description,
    match_resume_to_job,
    generate_career_recommendations,
    generate_learning_roadmap,
)

router = APIRouter(prefix="/job", tags=["Job Matching & Career Intelligence"])


@router.post("/parse", response_model=JobParseResponse, status_code=status.HTTP_200_OK)
def parse_job_endpoint(request: JobParseRequest):
    """
    Parse a job description into structured requirements, distinguishing
    required from preferred skills, qualifications, and responsibilities.
    """
    try:
        reqs = parse_job_description(
            job_description=request.job_description,
            job_title=request.job_title,
            company_name=request.company_name,
        )
        return JobParseResponse(
            success=True,
            extracted_requirements=reqs,
            analysis_provider="fastapi-nlp-engine",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse job description: {str(e)}",
        )


@router.post("/match", response_model=JobMatchResponse, status_code=status.HTTP_200_OK)
def match_job_endpoint(request: JobMatchRequest):
    """
    Match a resume against a target job description and compute the
    compatibility score (0-100) using the 35/25/15/15/10 rubric.
    """
    try:
        match_result = match_resume_to_job(
            resume_data=request.resume_data,
            job_description=request.job_description,
            job_title=request.job_title or "Software Engineer",
            company_name=request.company_name or "Company",
            extracted_requirements=request.extracted_requirements,
        )
        return match_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate job match: {str(e)}",
        )


@router.post("/recommendations", response_model=CareerRecommendationResponse, status_code=status.HTTP_200_OK)
def career_recommendations_endpoint(request: CareerRecommendationRequest):
    """
    Generate student/fresher-friendly career path recommendations across
    12 core tech roles based on resume skills and target job gaps.
    """
    try:
        recs = generate_career_recommendations(
            resume_data=request.resume_data,
            job_description=request.job_description,
            target_role=request.target_role,
        )
        return recs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate career recommendations: {str(e)}",
        )


@router.post("/roadmap", response_model=RoadmapResponse, status_code=status.HTTP_200_OK)
def learning_roadmap_endpoint(request: RoadmapRequest):
    """
    Generate a personalized week-by-week learning roadmap based on
    unmet job requirements and identified skill gaps.
    """
    try:
        roadmap = generate_learning_roadmap(
            resume_data=request.resume_data,
            job_description=request.job_description,
            job_title=request.job_title or "Software Engineer",
            company_name=request.company_name,
            missing_skills=request.missing_skills,
            duration_weeks=request.duration_weeks or 4,
        )
        return roadmap
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning roadmap: {str(e)}",
        )
