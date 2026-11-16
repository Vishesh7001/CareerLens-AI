from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, AliasChoices, ConfigDict


# -------------------------------------------------------------
# Job Parse Schemas
# -------------------------------------------------------------
class JobParseRequest(BaseModel):
    job_description: str = Field(..., min_length=10, max_length=20000, description="Raw job description text")
    job_title: Optional[str] = Field(default=None, max_length=150, description="Job title")
    company_name: Optional[str] = Field(default=None, max_length=150, description="Company name")


class ExtractedRequirements(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    required_skills: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("required_skills", "requiredSkills"),
        description="Core mandatory technical skills"
    )
    preferred_skills: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("preferred_skills", "preferredSkills"),
        description="Preferred or bonus technical skills"
    )
    required_qualifications: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("required_qualifications", "requiredQualifications"),
        description="Education or qualification requirements"
    )
    experience_requirements: str = Field(
        default="Entry-level / Fresher friendly",
        validation_alias=AliasChoices("experience_requirements", "experienceRequirements"),
        description="Extracted experience range"
    )
    project_requirements: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("project_requirements", "projectRequirements"),
        description="Types of projects or implementations sought"
    )
    responsibilities: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("responsibilities"),
        description="Key duties and responsibilities"
    )
    soft_skills: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("soft_skills", "softSkills"),
        description="Communication, teamwork, problem solving"
    )


class JobParseResponse(BaseModel):
    success: bool = True
    extracted_requirements: ExtractedRequirements
    analysis_provider: str = Field(default="fastapi-nlp-engine")


# -------------------------------------------------------------
# Job Matching Schemas
# -------------------------------------------------------------
class JobMatchRequest(BaseModel):
    resume_data: Dict[str, Any] = Field(..., description="Parsed resume data object")
    job_description: str = Field(..., min_length=10, max_length=20000, description="Job description text")
    job_title: Optional[str] = Field(default="Software Engineer", max_length=150)
    company_name: Optional[str] = Field(default="Company", max_length=150)
    extracted_requirements: Optional[Dict[str, Any]] = Field(default=None, description="Pre-extracted requirements if available")


class SkillMatchItem(BaseModel):
    skill: str
    match_type: str = Field(..., description="'exact' or 'equivalent'")
    matched_with: Optional[str] = Field(default=None, description="The resume skill variant that matched")
    is_required: bool = Field(default=True, description="True if required skill, False if preferred")


class MissingSkillDetail(BaseModel):
    skill: str
    priority: str = Field(..., description="'High', 'Medium', or 'Low'")
    is_required: bool = Field(default=True, description="True if required, False if preferred")
    reason: str = Field(..., description="Why this skill is important for the position")
    suggested_learning_direction: str = Field(..., description="Actionable direction for learning")


class JobMatchCategoryScore(BaseModel):
    score: float = Field(..., ge=0, le=100, description="Raw category score out of 100")
    weighted_score: float = Field(..., ge=0, le=100, description="Weighted contribution to overall score")
    weight_percentage: float = Field(..., description="Category weight percentage (e.g. 35)")
    feedback: str = Field(..., description="Category evaluation summary")


class JobMatchCategoryScores(BaseModel):
    technical_skills: JobMatchCategoryScore = Field(..., description="35% weight")
    projects_relevance: JobMatchCategoryScore = Field(..., description="25% weight")
    education_compatibility: JobMatchCategoryScore = Field(..., description="15% weight")
    experience_internships: JobMatchCategoryScore = Field(..., description="15% weight")
    preferred_skills: JobMatchCategoryScore = Field(..., description="10% weight")


class ProjectEvaluation(BaseModel):
    relevance_score: float = Field(..., ge=0, le=100)
    feedback: str
    suggestions: str


class EducationEvaluation(BaseModel):
    compatibility_score: float = Field(..., ge=0, le=100)
    feedback: str


class ExperienceEvaluation(BaseModel):
    compatibility_score: float = Field(..., ge=0, le=100)
    feedback: str
    student_perspective: str


class JobMatchResponse(BaseModel):
    overall_score: float = Field(..., ge=0, le=100, description="Job Compatibility Score (0-100)")
    match_classification: str = Field(..., description="Excellent Match (85-100), Strong Match (70-84), Moderate Match (50-69), Low Match (0-49)")
    category_scores: JobMatchCategoryScores
    matched_skills: List[SkillMatchItem] = Field(default_factory=list)
    missing_required_skills: List[MissingSkillDetail] = Field(default_factory=list)
    missing_preferred_skills: List[MissingSkillDetail] = Field(default_factory=list)
    project_evaluation: ProjectEvaluation
    education_evaluation: EducationEvaluation
    experience_evaluation: ExperienceEvaluation
    matching_explanation: str
    key_observations: List[str] = Field(default_factory=list)
    analysis_provider: str = Field(default="fastapi-nlp-engine")


# -------------------------------------------------------------
# Career Path Recommendations Schemas
# -------------------------------------------------------------
class CareerRecommendationRequest(BaseModel):
    resume_data: Dict[str, Any] = Field(..., description="Parsed resume data object")
    job_description: Optional[str] = Field(default=None, max_length=20000)
    target_role: Optional[str] = Field(default=None, max_length=150)


class CareerPathItem(BaseModel):
    role: str
    recommendation_score: float = Field(..., ge=0, le=100)
    why_recommended: str
    relevant_existing_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    suggested_projects: List[str] = Field(default_factory=list)
    preparation_priorities: List[str] = Field(default_factory=list)
    is_primary: bool = Field(default=False)


class CareerRecommendationResponse(BaseModel):
    primary_recommendations: List[CareerPathItem] = Field(default_factory=list)
    alternative_recommendations: List[CareerPathItem] = Field(default_factory=list)
    student_advice: str
    analysis_provider: str = Field(default="fastapi-nlp-engine")


# -------------------------------------------------------------
# Personalized Learning Roadmap Schemas
# -------------------------------------------------------------
class RoadmapRequest(BaseModel):
    resume_data: Dict[str, Any] = Field(..., description="Parsed resume data")
    job_description: str = Field(..., min_length=10, max_length=20000)
    job_title: Optional[str] = Field(default="Software Engineer")
    company_name: Optional[str] = Field(default=None)
    missing_skills: Optional[List[Dict[str, Any]]] = Field(default=None)
    duration_weeks: Optional[int] = Field(default=4, ge=2, le=12)


class RoadmapItem(BaseModel):
    week_number: int
    title: str
    learning_objective: str
    skill_to_learn: str
    priority: str = Field(default="High")
    estimated_duration: str = Field(default="1 Week (8-10 hours)")
    learning_sequence: List[str] = Field(default_factory=list)
    practical_exercises: List[str] = Field(default_factory=list)
    suggested_mini_projects: List[str] = Field(default_factory=list)
    expected_outcome: str


class RoadmapResponse(BaseModel):
    title: str
    target_role: str
    company_name: Optional[str] = None
    summary: str
    total_weeks: int
    items: List[RoadmapItem] = Field(default_factory=list)
    analysis_provider: str = Field(default="fastapi-nlp-engine")
