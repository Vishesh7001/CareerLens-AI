from fastapi import APIRouter, HTTPException, status
from app.schemas.interview import (
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    AnswerEvaluationRequest,
    AnswerEvaluationResponse,
    ReportGenerateRequest,
    ReportGenerateResponse,
)
from app.services.interview_service import (
    generate_interview_questions,
    evaluate_answer,
    generate_interview_report,
)

router = APIRouter(prefix="/interview", tags=["AI Mock Interview & Evaluation"])


@router.post("/generate-questions", response_model=QuestionGenerateResponse, status_code=status.HTTP_200_OK)
def generate_questions_endpoint(request: QuestionGenerateRequest):
    """
    Generate tailored interview questions based on job role, interview type,
    difficulty level, and optional resume/job context.
    """
    try:
        response = generate_interview_questions(
            role=request.role,
            custom_role=request.custom_role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            total_questions=request.total_questions,
            resume_data=request.resume_data,
            job_description=request.job_description,
            job_title=request.job_title,
            company_name=request.company_name,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview questions: {str(e)}",
        )


@router.post("/evaluate-answer", response_model=AnswerEvaluationResponse, status_code=status.HTTP_200_OK)
def evaluate_answer_endpoint(request: AnswerEvaluationRequest):
    """
    Evaluate a candidate's answer against weighted rubrics (Technical or HR)
    and provide detailed feedback, score, and improved sample answer.
    """
    try:
        response = evaluate_answer(
            question_id=request.question_id,
            question_text=request.question_text,
            category=request.category,
            difficulty=request.difficulty,
            topic=request.topic,
            expected_concepts=request.expected_concepts,
            evaluation_criteria=request.evaluation_criteria,
            sample_answer=request.sample_answer,
            answer=request.answer,
            role=request.role,
            resume_data=request.resume_data,
            job_description=request.job_description,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate answer: {str(e)}",
        )


@router.post("/generate-report", response_model=ReportGenerateResponse, status_code=status.HTTP_200_OK)
def generate_report_endpoint(request: ReportGenerateRequest):
    """
    Synthesize complete interview session into an overall performance report
    with category breakdowns, strengths, weaknesses, and readiness assessment.
    """
    try:
        response = generate_interview_report(
            role=request.role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            questions=request.questions,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview report: {str(e)}",
        )
