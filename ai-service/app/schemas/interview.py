from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, AliasChoices, ConfigDict


# -------------------------------------------------------------
# Question Generation Schemas
# -------------------------------------------------------------
class QuestionGenerateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    role: str = Field(..., min_length=2, max_length=100, description="Target job role")
    custom_role: Optional[str] = Field(
        default=None,
        max_length=100,
        validation_alias=AliasChoices("custom_role", "customRole"),
        description="Custom role name if role is 'Custom Role'"
    )
    interview_type: str = Field(
        default="Technical Interview",
        validation_alias=AliasChoices("interview_type", "interviewType"),
        description="Technical Interview, HR Interview, or Mixed Interview"
    )
    difficulty: str = Field(
        default="Intermediate",
        description="Beginner, Intermediate, or Advanced"
    )
    total_questions: int = Field(
        default=5,
        ge=1,
        le=15,
        validation_alias=AliasChoices("total_questions", "totalQuestions"),
        description="Number of questions to generate (5, 10, or 15)"
    )
    resume_data: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("resume_data", "resumeData"),
        description="Parsed resume details for personalization"
    )
    job_description: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("job_description", "jobDescription"),
        description="Job description text for targeted questions"
    )
    job_title: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("job_title", "jobTitle"),
        description="Job title from saved job"
    )
    company_name: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("company_name", "companyName"),
        description="Target company name"
    )


class QuestionItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    question_id: str = Field(..., validation_alias=AliasChoices("question_id", "questionId"))
    question_text: str = Field(..., validation_alias=AliasChoices("question_text", "questionText"))
    category: str = Field(..., description="'technical' or 'hr'")
    difficulty: str = Field(..., description="'beginner', 'intermediate', or 'advanced'")
    topic: str = Field(default="General")
    order: int = Field(default=1)
    expected_concepts: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("expected_concepts", "expectedConcepts")
    )
    evaluation_criteria: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("evaluation_criteria", "evaluationCriteria")
    )
    sample_answer: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("sample_answer", "sampleAnswer")
    )


class QuestionGenerateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    success: bool = True
    role: str
    interview_type: str = Field(..., validation_alias=AliasChoices("interview_type", "interviewType"))
    difficulty: str
    total_questions: int = Field(..., validation_alias=AliasChoices("total_questions", "totalQuestions"))
    questions: List[QuestionItem]
    provider: str = "fastapi-ai-engine"


# -------------------------------------------------------------
# Answer Evaluation Schemas
# -------------------------------------------------------------
class AnswerEvaluationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    question_id: str = Field(..., validation_alias=AliasChoices("question_id", "questionId"))
    question_text: str = Field(..., validation_alias=AliasChoices("question_text", "questionText"))
    category: str = Field(default="technical", description="'technical' or 'hr'")
    difficulty: str = Field(default="Intermediate")
    topic: Optional[str] = "General"
    expected_concepts: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("expected_concepts", "expectedConcepts")
    )
    evaluation_criteria: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("evaluation_criteria", "evaluationCriteria")
    )
    sample_answer: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("sample_answer", "sampleAnswer")
    )
    answer: str = Field(..., description="Student submitted answer text")
    role: Optional[str] = "Software Developer"
    resume_data: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("resume_data", "resumeData")
    )
    job_description: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("job_description", "jobDescription")
    )


class AnswerEvaluationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    success: bool = True
    overall_score: int = Field(..., ge=0, le=100, validation_alias=AliasChoices("overall_score", "overallScore"))
    performance_label: str = Field(..., validation_alias=AliasChoices("performance_label", "performanceLabel"))
    criterion_scores: Dict[str, int] = Field(
        ...,
        validation_alias=AliasChoices("criterion_scores", "criterionScores"),
        description="Individual score for each weighted criterion (0-100)"
    )
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_concepts: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("missing_concepts", "missingConcepts")
    )
    incorrect_concepts: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("incorrect_concepts", "incorrectConcepts")
    )
    improvement_suggestions: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("improvement_suggestions", "improvementSuggestions")
    )
    improved_sample_answer: str = Field(
        ...,
        validation_alias=AliasChoices("improved_sample_answer", "improvedSampleAnswer")
    )
    explanation: str = Field(...)
    provider: str = "fastapi-ai-engine"


# -------------------------------------------------------------
# Report Generation Schemas
# -------------------------------------------------------------
class ReportGenerateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    role: str
    interview_type: str = Field(..., validation_alias=AliasChoices("interview_type", "interviewType"))
    difficulty: str
    questions: List[Dict[str, Any]] = Field(..., description="Questions with submitted answers and evaluations")


class ReportGenerateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    success: bool = True
    overall_score: int = Field(..., ge=0, le=100, validation_alias=AliasChoices("overall_score", "overallScore"))
    performance_label: str = Field(..., validation_alias=AliasChoices("performance_label", "performanceLabel"))
    completion_percentage: int = Field(..., ge=0, le=100, validation_alias=AliasChoices("completion_percentage", "completionPercentage"))
    total_questions: int = Field(..., validation_alias=AliasChoices("total_questions", "totalQuestions"))
    answered_questions: int = Field(..., validation_alias=AliasChoices("answered_questions", "answeredQuestions"))
    skipped_questions: int = Field(default=0, validation_alias=AliasChoices("skipped_questions", "skippedQuestions"))
    performance_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        validation_alias=AliasChoices("performance_breakdown", "performanceBreakdown")
    )
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    readiness_assessment: str = Field(
        ...,
        validation_alias=AliasChoices("readiness_assessment", "readinessAssessment")
    )
    provider: str = "fastapi-ai-engine"
