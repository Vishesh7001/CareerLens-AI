from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CategoryScoreItem(BaseModel):
    score: float = Field(..., description="Score awarded in this category")
    max_score: float = Field(..., description="Maximum possible score in this category")
    feedback: str = Field(..., description="Detailed feedback on this category")


class CategoryScores(BaseModel):
    technical_skills: CategoryScoreItem
    projects: CategoryScoreItem
    experience: CategoryScoreItem
    education: CategoryScoreItem
    certifications: CategoryScoreItem
    completeness: CategoryScoreItem


class MissingSkillItem(BaseModel):
    skill: str = Field(..., description="Name of the missing skill")
    priority: str = Field(..., description="Priority: High, Medium, or Low")
    reason: str = Field(..., description="Explanation of why this skill is important for the role")


class ProjectAnalysisItem(BaseModel):
    title: str = Field(..., description="Project title")
    technologies: List[str] = Field(default_factory=list, description="Technologies identified in this project")
    relevance: str = Field(..., description="Relevance to target role: High, Medium, or Low")
    feedback: str = Field(..., description="Evaluation of implementation and clarity")
    suggestions: str = Field(..., description="Specific suggestions for improvement")


class ExperienceAnalysis(BaseModel):
    has_experience: bool = Field(..., description="Whether professional or internship experience was found")
    level: str = Field(..., description="Estimated experience level: Entry, Junior, Mid, Senior, or Academic/Student")
    summary: str = Field(..., description="Summary of candidate's background")
    feedback: str = Field(..., description="Feedback on responsibilities and achievements")
    suggestions: str = Field(..., description="Suggestions to elevate professional narrative")


class CategorizedSkills(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    other: List[str] = Field(default_factory=list)


class TechnicalSkillsAnalysis(BaseModel):
    existing_skills: List[str] = Field(default_factory=list)
    categorized: CategorizedSkills
    role_relevance_score: float = Field(..., description="Relevance percentage of candidate skills to role")
    summary: str = Field(..., description="Summary analysis of candidate technical skills")


class AIFeedback(BaseModel):
    summary: str = Field(..., description="Concise overall resume quality review")
    role_suitability: str = Field(..., description="Suitability evaluation for target career role")
    main_improvements: str = Field(..., description="Key areas needing immediate enhancement")
    next_steps: str = Field(..., description="Recommended actionable next steps")


class AnalysisRequest(BaseModel):
    resume_data: Dict[str, Any] = Field(..., description="Parsed resume data from MongoDB record")
    target_role: str = Field(..., min_length=2, max_length=100, description="Target career role")
    job_description: Optional[str] = Field(default=None, max_length=5000, description="Optional target job description")
    raw_text: Optional[str] = Field(default=None, description="Raw extracted resume text")


class AnalysisResponse(BaseModel):
    target_role: str
    job_description: Optional[str] = None
    overall_score: int = Field(..., ge=0, le=100, description="Overall resume score between 0 and 100")
    category_scores: CategoryScores
    strengths: List[str]
    weaknesses: List[str]
    technical_skills_analysis: TechnicalSkillsAnalysis
    missing_skills: List[MissingSkillItem]
    project_analysis: List[ProjectAnalysisItem]
    experience_analysis: ExperienceAnalysis
    improvement_suggestions: List[str]
    ai_feedback: AIFeedback
    analysis_provider: str = Field(..., description="Identifies the generation model/engine")
