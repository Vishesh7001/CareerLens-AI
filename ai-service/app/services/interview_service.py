"""
AI Interview Service
Generates role-specific questions and performs rubric-based answer evaluations.
"""

import re
import math
from typing import Dict, List, Any, Optional
from app.services.question_bank import get_role_questions, get_hr_questions, ROLE_QUESTION_BANK, HR_QUESTION_BANK
from app.schemas.interview import (
    QuestionItem,
    QuestionGenerateResponse,
    AnswerEvaluationResponse,
    ReportGenerateResponse,
)


def _extract_keywords(text: str) -> List[str]:
    """Extract lowercase alphanumeric tokens of length >= 3."""
    if not text:
        return []
    words = re.findall(r"\b[a-zA-Z0-9_\-\.\#\+]{2,}\b", text.lower())
    # Filter common stopwords
    stopwords = {
        "the", "and", "for", "with", "this", "that", "from", "are", "was", "were",
        "will", "can", "has", "have", "had", "which", "what", "when", "where", "how",
        "about", "into", "through", "during", "before", "after", "above", "below", "to",
        "of", "in", "on", "at", "by", "an", "as", "is", "it", "or", "be", "so"
    }
    return [w for w in words if w not in stopwords]


def _match_concept(concept: str, text_lower: str) -> bool:
    """Check if expected concept appears in text via token or phrase matching."""
    c_lower = concept.lower()
    if c_lower in text_lower:
        return True

    # Check individual significant tokens of the concept
    c_tokens = _extract_keywords(c_lower)
    if not c_tokens:
        return False

    matches = sum(1 for tok in c_tokens if tok in text_lower)
    # If more than 60% of significant tokens matched
    return (matches / len(c_tokens)) >= 0.6


def generate_interview_questions(
    role: str,
    custom_role: Optional[str] = None,
    interview_type: str = "Technical Interview",
    difficulty: str = "Intermediate",
    total_questions: int = 5,
    resume_data: Optional[Dict[str, Any]] = None,
    job_description: Optional[str] = None,
    job_title: Optional[str] = None,
    company_name: Optional[str] = None,
) -> QuestionGenerateResponse:
    """
    Generate non-duplicate, role-appropriate interview questions with personalization.
    """
    effective_role = custom_role if (role == "Custom Role" and custom_role) else role
    total_q = min(max(total_questions, 1), 15)

    # 1. Determine Technical vs HR ratio based on interview_type
    if interview_type == "HR Interview":
        tech_count = 0
        hr_count = total_q
    elif interview_type == "Mixed Interview":
        tech_count = math.ceil(total_q * 0.6)
        hr_count = total_q - tech_count
    else:  # Technical Interview
        tech_count = total_q
        hr_count = 0

    selected_questions: List[Dict[str, Any]] = []
    used_questions_text = set()

    # 2. Extract context from resume and job for prioritization
    context_tokens = set()
    if resume_data:
        skills = resume_data.get("skills", {})
        if isinstance(skills, dict):
            for cat, skl_list in skills.items():
                if isinstance(skl_list, list):
                    for s in skl_list:
                        context_tokens.update(_extract_keywords(str(s)))
        projects = resume_data.get("projects", [])
        if isinstance(projects, list):
            for p in projects:
                if isinstance(p, dict):
                    context_tokens.update(_extract_keywords(p.get("title", "")))
                    context_tokens.update(_extract_keywords(p.get("description", "")))

    if job_description:
        context_tokens.update(_extract_keywords(job_description[:1000]))

    # 3. Gather and score Technical Questions
    if tech_count > 0:
        pool = get_role_questions(effective_role, difficulty)
        # Also grab adjacent difficulties if pool is smaller than needed
        if len(pool) < tech_count:
            all_diffs = ["Beginner", "Intermediate", "Advanced"]
            for d in all_diffs:
                if d != difficulty:
                    extra = get_role_questions(effective_role, d)
                    for item in extra:
                        if item["question"] not in [p["question"] for p in pool]:
                            pool.append(item)

        # Score questions by relevance to context
        def score_q(q):
            q_text = q["question"] + " " + q.get("topic", "")
            q_tokens = _extract_keywords(q_text)
            relevance = sum(2 for t in q_tokens if t in context_tokens)
            return relevance

        # Sort pool by relevance score descending
        pool.sort(key=score_q, reverse=True)

        for q in pool:
            if len([x for x in selected_questions if x["category"] == "technical"]) >= tech_count:
                break
            if q["question"] not in used_questions_text:
                used_questions_text.add(q["question"])
                selected_questions.append({
                    "question_text": q["question"],
                    "category": "technical",
                    "difficulty": difficulty.lower(),
                    "topic": q.get("topic", "Technical"),
                    "expected_concepts": q.get("expected_concepts", []),
                    "evaluation_criteria": q.get("evaluation_criteria", []),
                    "sample_answer": q.get("sample_answer", "")
                })

    # 4. Gather and score HR Questions
    if hr_count > 0:
        hr_pool = get_hr_questions()

        for q in hr_pool:
            if len([x for x in selected_questions if x["category"] == "hr"]) >= hr_count:
                break
            if q["question"] not in used_questions_text:
                used_questions_text.add(q["question"])
                selected_questions.append({
                    "question_text": q["question"],
                    "category": "hr",
                    "difficulty": difficulty.lower(),
                    "topic": q.get("topic", "HR / Behavioral"),
                    "expected_concepts": q.get("expected_concepts", []),
                    "evaluation_criteria": q.get("evaluation_criteria", []),
                    "sample_answer": q.get("sample_answer", "")
                })

    # 5. If we still need more questions to reach total_q, fill from Software Developer or HR pool
    if len(selected_questions) < total_q:
        fallback_pool = get_role_questions("Software Developer", "Intermediate") + get_hr_questions()
        for q in fallback_pool:
            if len(selected_questions) >= total_q:
                break
            if q["question"] not in used_questions_text:
                used_questions_text.add(q["question"])
                category = "hr" if "Tell me" in q["question"] or "Describe" in q["question"] else "technical"
                selected_questions.append({
                    "question_text": q["question"],
                    "category": category,
                    "difficulty": difficulty.lower(),
                    "topic": q.get("topic", "General"),
                    "expected_concepts": q.get("expected_concepts", []),
                    "evaluation_criteria": q.get("evaluation_criteria", []),
                    "sample_answer": q.get("sample_answer", "")
                })

    # 6. Format into QuestionItem with sequential order and clean IDs
    formatted_items: List[QuestionItem] = []
    for idx, item in enumerate(selected_questions[:total_q], start=1):
        formatted_items.append(QuestionItem(
            question_id=f"q_{idx}",
            question_text=item["question_text"],
            category=item["category"],
            difficulty=item["difficulty"],
            topic=item["topic"],
            order=idx,
            expected_concepts=item["expected_concepts"],
            evaluation_criteria=item["evaluation_criteria"],
            sample_answer=item.get("sample_answer")
        ))

    return QuestionGenerateResponse(
        success=True,
        role=effective_role,
        interview_type=interview_type,
        difficulty=difficulty,
        total_questions=len(formatted_items),
        questions=formatted_items,
        provider="fastapi-ai-engine"
    )


def evaluate_answer(
    question_id: str,
    question_text: str,
    category: str,
    difficulty: str,
    topic: Optional[str],
    expected_concepts: List[str],
    evaluation_criteria: List[str],
    sample_answer: Optional[str],
    answer: str,
    role: Optional[str] = "Software Developer",
    resume_data: Optional[Dict[str, Any]] = None,
    job_description: Optional[str] = None,
) -> AnswerEvaluationResponse:
    """
    Evaluate student's answer using weighted multi-criteria rubric and concept matching.
    """
    clean_answer = (answer or "").strip()
    words = clean_answer.split()
    word_count = len(words)
    answer_lower = clean_answer.lower()

    # 1. Handle empty or virtually empty answers
    if word_count < 3:
        return AnswerEvaluationResponse(
            success=True,
            overall_score=0,
            performance_label="Needs Improvement",
            criterion_scores={
                "technical_accuracy" if category == "technical" else "relevance": 0,
                "relevance": 0,
                "completeness": 0,
                "clarity": 0,
                "structure_and_communication": 0 if category == "hr" else 0,
                "examples_and_specificity": 0 if category == "hr" else 0,
            },
            strengths=[],
            weaknesses=["No answer was provided or the answer was too brief to evaluate."],
            missing_concepts=expected_concepts or ["Core explanation"],
            incorrect_concepts=[],
            improvement_suggestions=[
                "Review the core technical concepts of this topic.",
                "Take time to structure your response with definitions and real-world examples.",
                "Aim for at least 3-4 complete sentences to thoroughly explain your thought process."
            ],
            improved_sample_answer=sample_answer or "Provide a structured, comprehensive explanation covering the core concepts.",
            explanation="The answer submitted was empty or insufficient to demonstrate understanding.",
            provider="fastapi-ai-engine"
        )

    # 2. Check concept coverage
    matched_concepts: List[str] = []
    missing_concepts: List[str] = []

    for concept in expected_concepts:
        if _match_concept(concept, answer_lower):
            matched_concepts.append(concept)
        else:
            missing_concepts.append(concept)

    total_expected = max(1, len(expected_concepts))
    concept_ratio = len(matched_concepts) / total_expected

    # 3. Assess criteria based on category
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvement_suggestions: List[str] = []
    incorrect_concepts: List[str] = []

    if category.lower() == "technical":
        # Technical rubric: Accuracy 40%, Relevance 25%, Completeness 20%, Clarity 15%
        # Accuracy: concept matching + depth
        base_accuracy = int(concept_ratio * 70)
        if word_count >= 40:
            base_accuracy += 20
        elif word_count >= 20:
            base_accuracy += 10
        accuracy_score = min(100, max(20, base_accuracy))

        # Relevance: prompt keyword density
        q_tokens = _extract_keywords(question_text)
        q_matches = sum(1 for tok in q_tokens if tok in answer_lower)
        relevance_score = min(100, max(30, int((q_matches / max(1, len(q_tokens))) * 60) + 40))

        # Completeness: word count + concept coverage
        completeness_score = min(100, max(25, int(concept_ratio * 50) + min(50, word_count * 2)))

        # Clarity: punctuation, paragraphing, average sentence length
        sentences = [s for s in re.split(r"[.!?]", clean_answer) if s.strip()]
        avg_sentence_len = word_count / max(1, len(sentences))
        clarity_score = 85
        if avg_sentence_len > 40:  # Run-on sentences
            clarity_score -= 20
        elif avg_sentence_len < 4:  # Too choppy
            clarity_score -= 15
        if word_count >= 25 and len(sentences) >= 2:
            clarity_score = min(100, clarity_score + 10)

        # Weighted calculation
        overall_score = round(
            (accuracy_score * 0.40) +
            (relevance_score * 0.25) +
            (completeness_score * 0.20) +
            (clarity_score * 0.15)
        )
        overall_score = min(100, max(10, overall_score))

        criterion_scores = {
            "technical_accuracy": accuracy_score,
            "relevance": relevance_score,
            "completeness": completeness_score,
            "clarity": clarity_score
        }

        # Feedback generation
        if matched_concepts:
            strengths.append(f"Demonstrated solid familiarity with: {', '.join(matched_concepts[:3])}.")
        if word_count >= 35:
            strengths.append("Provided detailed context rather than just a one-line definition.")

        if missing_concepts:
            weaknesses.append(f"Omitted key technical concepts: {', '.join(missing_concepts[:3])}.")
            improvement_suggestions.append(f"Incorporate discussions around {missing_concepts[0]} to showcase deeper architectural understanding.")
        if word_count < 25:
            weaknesses.append("Response is somewhat brief; flesh out technical reasoning with examples.")
            improvement_suggestions.append("Illustrate your answer with a concrete code snippet or system design scenario.")

        improvement_suggestions.append("Structure answers with: 1) High-level definition, 2) Mechanism/Workflow, 3) Real-world use case or trade-off.")

    else:
        # HR Rubric: Relevance 25%, Clarity 25%, Completeness 20%, Structure & Communication 15%, Examples & Specificity 15%
        # Relevance
        relevance_score = min(100, max(40, 50 + int(concept_ratio * 50)))

        # Clarity
        clarity_score = min(100, max(45, 60 + min(40, word_count)))

        # Completeness
        completeness_score = min(100, max(30, int(concept_ratio * 40) + min(60, word_count)))

        # Structure & Communication (STAR presence)
        has_star = any(w in answer_lower for w in ["situation", "task", "action", "result", "when i", "during my", "we decided", "outcome"])
        structure_score = 90 if has_star else 65

        # Examples & Specificity
        has_example = any(w in answer_lower for w in ["for example", "for instance", "such as", "project", "team", "colleague"])
        examples_score = 90 if has_example else 60

        overall_score = round(
            (relevance_score * 0.25) +
            (clarity_score * 0.25) +
            (completeness_score * 0.20) +
            (structure_score * 0.15) +
            (examples_score * 0.15)
        )
        overall_score = min(100, max(15, overall_score))

        criterion_scores = {
            "relevance": relevance_score,
            "clarity": clarity_score,
            "completeness": completeness_score,
            "structure_and_communication": structure_score,
            "examples_and_specificity": examples_score
        }

        if has_star:
            strengths.append("Structured the behavioral scenario effectively following a logical progression.")
        if has_example:
            strengths.append("Grounded the response in a concrete real-world team or project experience.")
        if not strengths:
            strengths.append("Addressed the question promptly and maintained a professional tone.")

        if not has_star:
            weaknesses.append("Did not explicitly use the STAR framework (Situation, Task, Action, Result).")
            improvement_suggestions.append("Adopt the STAR method: state the Situation & Task, detail your personal Actions, and highlight measurable Results.")
        if missing_concepts:
            weaknesses.append(f"Could more directly touch upon: {', '.join(missing_concepts[:2])}.")

        improvement_suggestions.append("Quantify outcomes where possible (e.g., 'reduced load time by 30%', 'completed 2 weeks early').")

    # Determine Performance Label
    if overall_score >= 85:
        performance_label = "Excellent"
        explanation = "Outstanding answer showing strong conceptual grasp and clear articulation."
    elif overall_score >= 70:
        performance_label = "Good"
        explanation = "Good answer covering the main principles; minor additions will make it exceptional."
    elif overall_score >= 50:
        performance_label = "Average"
        explanation = "Adequate response, but lacks important technical depth or structured examples."
    else:
        performance_label = "Needs Improvement"
        explanation = "Response lacks key concepts or detail needed for a competitive interview."

    # Use provided sample answer or fallback
    improved_sample = sample_answer or "Provide a structured, comprehensive answer with clear definitions, practical mechanisms, and specific trade-offs."

    return AnswerEvaluationResponse(
        success=True,
        overall_score=overall_score,
        performance_label=performance_label,
        criterion_scores=criterion_scores,
        strengths=strengths,
        weaknesses=weaknesses,
        missing_concepts=missing_concepts,
        incorrect_concepts=incorrect_concepts,
        improvement_suggestions=improvement_suggestions,
        improved_sample_answer=improved_sample,
        explanation=explanation,
        provider="fastapi-ai-engine"
    )


def generate_interview_report(
    role: str,
    interview_type: str,
    difficulty: str,
    questions: List[Dict[str, Any]]
) -> ReportGenerateResponse:
    """
    Generate comprehensive final interview performance report from evaluated questions.
    """
    total_q = len(questions)
    answered_q = [q for q in questions if q.get("status") == "answered" and q.get("evaluation")]
    answered_count = len(answered_q)
    skipped_count = total_q - answered_count

    if answered_count == 0:
        return ReportGenerateResponse(
            success=True,
            overall_score=0,
            performance_label="Needs Improvement",
            completion_percentage=0,
            total_questions=total_q,
            answered_questions=0,
            skipped_questions=skipped_count,
            performance_breakdown={},
            strengths=["Session initiated."],
            weaknesses=["No questions were answered during this session."],
            recommendations=["Dedicate 20-30 minutes of uninterrupted time to complete a full mock interview session."],
            readiness_assessment="Incomplete session. To assess interview readiness, complete all questions in the mock interview.",
            provider="fastapi-ai-engine"
        )

    # Compute overall score (average of answered question scores)
    scores = [q["evaluation"].get("overall_score", q["evaluation"].get("overallScore", 0)) for q in answered_q]
    overall_score = round(sum(scores) / len(scores))
    completion_percentage = round((answered_count / total_q) * 100)

    # Compute criterion breakdowns across all evaluated questions
    breakdown_sums: Dict[str, float] = {}
    breakdown_counts: Dict[str, int] = {}

    def _normalize_criterion_key(key_name: str) -> str:
        k = str(key_name).strip()
        key_map = {
            "technicalAccuracy": "technical_accuracy",
            "technical accuracy": "technical_accuracy",
            "technical_accuracy": "technical_accuracy",
            "relevance": "relevance",
            "completeness": "completeness",
            "clarity": "clarity",
            "structureAndCommunication": "structure_and_communication",
            "structure_and_communication": "structure_and_communication",
            "structure": "structure_and_communication",
            "examplesAndSpecificity": "examples_and_specificity",
            "examples_and_specificity": "examples_and_specificity",
            "examples": "examples_and_specificity",
        }
        return key_map.get(k, k)

    for q in answered_q:
        eval_data = q.get("evaluation") or {}
        c_scores = eval_data.get("criterion_scores")
        if c_scores is None:
            c_scores = eval_data.get("criterionScores")
        if isinstance(c_scores, dict):
            for criterion, val in c_scores.items():
                if val is not None:
                    try:
                        numeric_val = float(val)
                    except (ValueError, TypeError):
                        continue
                    norm_key = _normalize_criterion_key(criterion)
                    breakdown_sums[norm_key] = breakdown_sums.get(norm_key, 0.0) + numeric_val
                    breakdown_counts[norm_key] = breakdown_counts.get(norm_key, 0) + 1

    performance_breakdown: Dict[str, int] = {
        crit: round(breakdown_sums[crit] / max(1, breakdown_counts[crit]))
        for crit in breakdown_sums
    }

    # Gather all strengths and weaknesses
    all_strengths: List[str] = []
    all_weaknesses: List[str] = []
    for q in answered_q:
        st = q["evaluation"].get("strengths", [])
        if isinstance(st, list):
            all_strengths.extend(st)
        wk = q["evaluation"].get("weaknesses", [])
        if isinstance(wk, list):
            all_weaknesses.extend(wk)

    # Deduplicate and pick top 4-5
    unique_strengths = list(dict.fromkeys(all_strengths))[:4]
    unique_weaknesses = list(dict.fromkeys(all_weaknesses))[:4]

    if not unique_strengths:
        unique_strengths = ["Consistently attempted questions across multiple modules."]
    if not unique_weaknesses:
        unique_weaknesses = ["Review edge cases and system scalability trade-offs."]

    # Performance Label
    if overall_score >= 85:
        performance_label = "Excellent"
        readiness_assessment = f"Outstanding performance! You demonstrated impressive technical depth and clear articulation for a {difficulty} {role} level. You are well-positioned for real-world interviews."
    elif overall_score >= 70:
        performance_label = "Good"
        readiness_assessment = f"Solid foundation! You showed strong understanding of key concepts for a {role} role. Focus on deepening explanations of system trade-offs and structuring answers to reach top-tier interview readiness."
    elif overall_score >= 50:
        performance_label = "Average"
        readiness_assessment = f"Promising potential, but gaps in technical specificity and structure were noted. Revise missing concepts and practice answering out loud using structured frameworks before live technical screens."
    else:
        performance_label = "Needs Improvement"
        readiness_assessment = f"Foundational review recommended. Dedicate focused time to study the fundamental concepts and review the sample answers before your next mock attempt."

    # Personalized Recommendations
    recommendations: List[str] = [
        f"Review core technical concepts and trade-offs for {role}.",
        "Practice using the STAR methodology (Situation, Task, Action, Result) for all scenario and HR questions.",
        "Aim to structure technical explanations into: Definition, Mechanism, and Practical Example.",
        "Review the personalized learning roadmap to address flagged concept gaps."
    ]

    return ReportGenerateResponse(
        success=True,
        overall_score=overall_score,
        performance_label=performance_label,
        completion_percentage=completion_percentage,
        total_questions=total_q,
        answered_questions=answered_count,
        skipped_questions=skipped_count,
        performance_breakdown=performance_breakdown,
        strengths=unique_strengths,
        weaknesses=unique_weaknesses,
        recommendations=recommendations,
        readiness_assessment=readiness_assessment,
        provider="fastapi-ai-engine"
    )
