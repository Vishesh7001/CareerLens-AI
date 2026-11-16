/**
 * AI Service Communication Layer
 * Connects Node.js Express backend to Python FastAPI AI microservice
 */

const { runFallbackAnalysis } = require('./fallbackAnalysisService');
const {
  runFallbackJobParse,
  runFallbackJobMatch,
  runFallbackCareerRecommendations,
  runFallbackLearningRoadmap,
} = require('./fallbackJobMatcher');

const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8000';
const DEFAULT_TIMEOUT_MS = 5000;
const ANALYSIS_TIMEOUT_MS = 10000;

/**
 * Normalizes FastAPI snake_case response into clean camelCase schema
 */
const normalizeAnalysisResponse = (data) => {
  if (!data || typeof data !== 'object') return null;

  const cat = data.category_scores || data.categoryScores || {};
  const techScore = cat.technical_skills || cat.technicalSkills || {};
  const projScore = cat.projects || {};
  const expScore = cat.experience || {};
  const eduScore = cat.education || {};
  const certScore = cat.certifications || {};
  const compScore = cat.completeness || {};

  const techAnalysis = data.technical_skills_analysis || data.technicalSkillsAnalysis || {};
  const categorized = techAnalysis.categorized || {};

  const expAnalysis = data.experience_analysis || data.experienceAnalysis || {};
  const feedback = data.ai_feedback || data.aiFeedback || {};

  return {
    targetRole: data.target_role || data.targetRole,
    jobDescription: data.job_description || data.jobDescription || null,
    overallScore: typeof data.overall_score === 'number' ? data.overall_score : data.overallScore,
    categoryScores: {
      technicalSkills: {
        score: techScore.score || 0,
        maxScore: techScore.max_score || techScore.maxScore || 25,
        feedback: techScore.feedback || '',
      },
      projects: {
        score: projScore.score || 0,
        maxScore: projScore.max_score || projScore.maxScore || 20,
        feedback: projScore.feedback || '',
      },
      experience: {
        score: expScore.score || 0,
        maxScore: expScore.max_score || expScore.maxScore || 20,
        feedback: expScore.feedback || '',
      },
      education: {
        score: eduScore.score || 0,
        maxScore: eduScore.max_score || eduScore.maxScore || 10,
        feedback: eduScore.feedback || '',
      },
      certifications: {
        score: certScore.score || 0,
        maxScore: certScore.max_score || certScore.maxScore || 10,
        feedback: certScore.feedback || '',
      },
      completeness: {
        score: compScore.score || 0,
        maxScore: compScore.max_score || compScore.maxScore || 15,
        feedback: compScore.feedback || '',
      },
    },
    strengths: data.strengths || [],
    weaknesses: data.weaknesses || [],
    technicalSkillsAnalysis: {
      existingSkills: techAnalysis.existing_skills || techAnalysis.existingSkills || [],
      categorized: {
        programmingLanguages: categorized.programming_languages || categorized.programmingLanguages || [],
        frameworks: categorized.frameworks || [],
        databases: categorized.databases || [],
        tools: categorized.tools || [],
        other: categorized.other || [],
      },
      roleRelevanceScore: techAnalysis.role_relevance_score || techAnalysis.roleRelevanceScore || 0,
      summary: techAnalysis.summary || '',
    },
    missingSkills: data.missing_skills || data.missingSkills || [],
    projectAnalysis: data.project_analysis || data.projectAnalysis || [],
    experienceAnalysis: {
      hasExperience: typeof expAnalysis.has_experience === 'boolean' ? expAnalysis.has_experience : (expAnalysis.hasExperience || false),
      level: expAnalysis.level || 'Entry',
      summary: expAnalysis.summary || '',
      feedback: expAnalysis.feedback || '',
      suggestions: expAnalysis.suggestions || '',
    },
    improvementSuggestions: data.improvement_suggestions || data.improvementSuggestions || [],
    aiFeedback: {
      summary: feedback.summary || '',
      roleSuitability: feedback.role_suitability || feedback.roleSuitability || '',
      mainImprovements: feedback.main_improvements || feedback.mainImprovements || '',
      nextSteps: feedback.next_steps || feedback.nextSteps || '',
    },
    analysisProvider: data.analysis_provider || data.analysisProvider || 'fastapi-nlp-engine',
  };
};

/**
 * Execute resume analysis by calling the Python FastAPI service,
 * gracefully falling back to transparent rule-based analysis if unavailable.
 *
 * @param {object} resumeData - Parsed resume data
 * @param {string} targetRole - Selected career role
 * @param {string} [jobDescription] - Optional target job description
 * @param {string} [rawText] - Raw extracted resume text
 * @param {object} [options] - Optional overrides for testing
 * @returns {Promise<object>} Structured analysis response
 */
const analyzeResume = async (resumeData, targetRole, jobDescription, rawText = '', options = {}) => {
  const timeoutMs = options.timeoutMs || ANALYSIS_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/analysis`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const payload = {
      resume_data: resumeData,
      target_role: targetRole,
      job_description: jobDescription || null,
      raw_text: rawText || '',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return normalizeAnalysisResponse(data);
    }

    console.warn(`[AI Service] FastAPI returned HTTP ${response.status}. Using transparent fallback engine.`);
    return runFallbackAnalysis(resumeData, targetRole, jobDescription, rawText);
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[AI Service] FastAPI service unreachable (${error.message}). Using transparent fallback engine.`);
    return runFallbackAnalysis(resumeData, targetRole, jobDescription, rawText);
  }
};

/**
 * Normalizes JobMatch response from FastAPI snake_case to camelCase
 */
const normalizeJobMatchResponse = (data) => {
  if (!data || typeof data !== 'object') return null;
  const cat = data.category_scores || data.categoryScores || {};
  const tech = cat.technical_skills || cat.technicalSkills || {};
  const proj = cat.projects_relevance || cat.projectsRelevance || {};
  const edu = cat.education_compatibility || cat.educationCompatibility || {};
  const exp = cat.experience_internships || cat.experienceInternships || {};
  const pref = cat.preferred_skills || cat.preferredSkills || {};

  const projEval = data.project_evaluation || data.projectEvaluation || {};
  const eduEval = data.education_evaluation || data.educationEvaluation || {};
  const expEval = data.experience_evaluation || data.experienceEvaluation || {};

  return {
    overallScore: typeof data.overall_score === 'number' ? data.overall_score : data.overallScore,
    matchClassification: data.match_classification || data.matchClassification,
    categoryScores: {
      technicalSkills: {
        score: tech.score || 0,
        weightedScore: tech.weighted_score ?? tech.weightedScore ?? 0,
        weightPercentage: tech.weight_percentage ?? tech.weightPercentage ?? 35,
        feedback: tech.feedback || '',
      },
      projectsRelevance: {
        score: proj.score || 0,
        weightedScore: proj.weighted_score ?? proj.weightedScore ?? 0,
        weightPercentage: proj.weight_percentage ?? proj.weightPercentage ?? 25,
        feedback: proj.feedback || '',
      },
      educationCompatibility: {
        score: edu.score || 0,
        weightedScore: edu.weighted_score ?? edu.weightedScore ?? 0,
        weightPercentage: edu.weight_percentage ?? edu.weightPercentage ?? 15,
        feedback: edu.feedback || '',
      },
      experienceInternships: {
        score: exp.score || 0,
        weightedScore: exp.weighted_score ?? exp.weightedScore ?? 0,
        weightPercentage: exp.weight_percentage ?? exp.weightPercentage ?? 15,
        feedback: exp.feedback || '',
      },
      preferredSkills: {
        score: pref.score || 0,
        weightedScore: pref.weighted_score ?? pref.weightedScore ?? 0,
        weightPercentage: pref.weight_percentage ?? pref.weightPercentage ?? 10,
        feedback: pref.feedback || '',
      },
    },
    matchedSkills: (data.matched_skills || data.matchedSkills || []).map((m) => ({
      skill: m.skill,
      matchType: m.match_type || m.matchType,
      matchedWith: m.matched_with || m.matchedWith || null,
      isRequired: m.is_required !== undefined ? m.is_required : (m.isRequired !== undefined ? m.isRequired : true),
    })),
    missingRequiredSkills: (data.missing_required_skills || data.missingRequiredSkills || []).map((m) => ({
      skill: m.skill,
      priority: m.priority,
      isRequired: m.is_required !== undefined ? m.is_required : (m.isRequired !== undefined ? m.isRequired : true),
      reason: m.reason,
      suggestedLearningDirection: m.suggested_learning_direction || m.suggestedLearningDirection,
    })),
    missingPreferredSkills: (data.missing_preferred_skills || data.missingPreferredSkills || []).map((m) => ({
      skill: m.skill,
      priority: m.priority,
      isRequired: m.is_required !== undefined ? m.is_required : (m.isRequired !== undefined ? m.isRequired : false),
      reason: m.reason,
      suggestedLearningDirection: m.suggested_learning_direction || m.suggestedLearningDirection,
    })),
    projectEvaluation: {
      relevanceScore: projEval.relevance_score ?? projEval.relevanceScore ?? 0,
      feedback: projEval.feedback || '',
      suggestions: projEval.suggestions || '',
    },
    educationEvaluation: {
      compatibilityScore: eduEval.compatibility_score ?? eduEval.compatibilityScore ?? 0,
      feedback: eduEval.feedback || '',
    },
    experienceEvaluation: {
      compatibilityScore: expEval.compatibility_score ?? expEval.compatibilityScore ?? 0,
      feedback: expEval.feedback || '',
      studentPerspective: expEval.student_perspective || expEval.studentPerspective || '',
    },
    matchingExplanation: data.matching_explanation || data.matchingExplanation || '',
    keyObservations: data.key_observations || data.keyObservations || [],
    analysisProvider: data.analysis_provider || data.analysisProvider || 'fastapi-nlp-engine',
  };
};

/**
 * Normalizes Career Recommendations response
 */
const normalizeCareerRecommendationsResponse = (data) => {
  if (!data || typeof data !== 'object') return null;

  const mapPath = (p) => ({
    role: p.role,
    recommendationScore: p.recommendation_score ?? p.recommendationScore ?? 0,
    whyRecommended: p.why_recommended || p.whyRecommended || '',
    relevantExistingSkills: p.relevant_existing_skills || p.relevantExistingSkills || [],
    missingSkills: p.missing_skills || p.missingSkills || [],
    suggestedProjects: p.suggested_projects || p.suggestedProjects || [],
    preparationPriorities: p.preparation_priorities || p.preparationPriorities || [],
    isPrimary: Boolean(p.is_primary ?? p.isPrimary),
  });

  return {
    primaryRecommendations: (data.primary_recommendations || data.primaryRecommendations || []).map(mapPath),
    alternativeRecommendations: (data.alternative_recommendations || data.alternativeRecommendations || []).map(mapPath),
    studentAdvice: data.student_advice || data.studentAdvice || '',
    analysisProvider: data.analysis_provider || data.analysisProvider || 'fastapi-nlp-engine',
  };
};

/**
 * Normalizes Roadmap response
 */
const normalizeRoadmapResponse = (data) => {
  if (!data || typeof data !== 'object') return null;

  return {
    title: data.title || 'Personalized Learning Roadmap',
    targetRole: data.target_role || data.targetRole || 'Software Engineer',
    companyName: data.company_name || data.companyName || null,
    summary: data.summary || '',
    totalWeeks: data.total_weeks ?? data.totalWeeks ?? 4,
    items: (data.items || []).map((item) => ({
      weekNumber: item.week_number ?? item.weekNumber,
      title: item.title,
      learningObjective: item.learning_objective || item.learningObjective,
      skillToLearn: item.skill_to_learn || item.skillToLearn,
      priority: item.priority || 'High',
      estimatedDuration: item.estimated_duration || item.estimatedDuration || '1 Week',
      learningSequence: item.learning_sequence || item.learningSequence || [],
      practicalExercises: item.practical_exercises || item.practicalExercises || [],
      suggestedMiniProjects: item.suggested_mini_projects || item.suggestedMiniProjects || [],
      expectedOutcome: item.expected_outcome || item.expectedOutcome || '',
      completed: Boolean(item.completed),
      completedAt: item.completedAt || null,
    })),
    progressPercentage: data.progressPercentage || 0,
    analysisProvider: data.analysis_provider || data.analysisProvider || 'fastapi-nlp-engine',
  };
};

/**
 * Parse job description using FastAPI with fallback
 */
const parseJobDescription = async (jobDescription, jobTitle, companyName, options = {}) => {
  const timeoutMs = options.timeoutMs || ANALYSIS_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/job/parse`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      job_description: jobDescription,
      job_title: jobTitle || null,
      company_name: companyName || null,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const reqs = data.extracted_requirements || data.extractedRequirements || {};
      return {
        requiredSkills: reqs.required_skills || reqs.requiredSkills || [],
        preferredSkills: reqs.preferred_skills || reqs.preferredSkills || [],
        requiredQualifications: reqs.required_qualifications || reqs.requiredQualifications || [],
        experienceRequirements: reqs.experience_requirements || reqs.experienceRequirements || '',
        projectRequirements: reqs.project_requirements || reqs.projectRequirements || [],
        responsibilities: reqs.responsibilities || [],
        softSkills: reqs.soft_skills || reqs.softSkills || [],
      };
    }

    return runFallbackJobParse(jobDescription, jobTitle, companyName);
  } catch (error) {
    clearTimeout(timeoutId);
    return runFallbackJobParse(jobDescription, jobTitle, companyName);
  }
};

/**
 * Match resume against job description using FastAPI with fallback
 */
const matchResumeToJob = async (resumeData, jobDescription, jobTitle, companyName, extractedRequirements, options = {}) => {
  const timeoutMs = options.timeoutMs || ANALYSIS_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/job/match`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let reqsPayload = null;
  if (extractedRequirements && typeof extractedRequirements === 'object') {
    const reqObj = typeof extractedRequirements.toObject === 'function'
      ? extractedRequirements.toObject()
      : extractedRequirements;

    const reqSkills = reqObj.required_skills || reqObj.requiredSkills || [];
    const prefSkills = reqObj.preferred_skills || reqObj.preferredSkills || [];
    const reqQuals = reqObj.required_qualifications || reqObj.requiredQualifications || [];
    const expReq = reqObj.experience_requirements || reqObj.experienceRequirements || '';
    const projReq = reqObj.project_requirements || reqObj.projectRequirements || [];
    const resps = reqObj.responsibilities || [];
    const softSkills = reqObj.soft_skills || reqObj.softSkills || [];

    reqsPayload = {
      required_skills: reqSkills,
      requiredSkills: reqSkills,
      preferred_skills: prefSkills,
      preferredSkills: prefSkills,
      required_qualifications: reqQuals,
      requiredQualifications: reqQuals,
      experience_requirements: expReq,
      experienceRequirements: expReq,
      project_requirements: projReq,
      projectRequirements: projReq,
      responsibilities: resps,
      soft_skills: softSkills,
      softSkills: softSkills,
    };
  }

  try {
    const payload = {
      resume_data: resumeData,
      job_description: jobDescription,
      job_title: jobTitle,
      company_name: companyName,
      extracted_requirements: reqsPayload,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return normalizeJobMatchResponse(data);
    }

    return runFallbackJobMatch(resumeData, jobDescription, jobTitle, companyName, reqsPayload || extractedRequirements);
  } catch (error) {
    clearTimeout(timeoutId);
    return runFallbackJobMatch(resumeData, jobDescription, jobTitle, companyName, reqsPayload || extractedRequirements);
  }
};

/**
 * Get career path recommendations using FastAPI with fallback
 */
const getCareerRecommendations = async (resumeData, jobDescription, targetRole, options = {}) => {
  const timeoutMs = options.timeoutMs || ANALYSIS_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/job/recommendations`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      resume_data: resumeData,
      job_description: jobDescription || null,
      target_role: targetRole || null,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return normalizeCareerRecommendationsResponse(data);
    }

    return runFallbackCareerRecommendations(resumeData, jobDescription, targetRole);
  } catch (error) {
    clearTimeout(timeoutId);
    return runFallbackCareerRecommendations(resumeData, jobDescription, targetRole);
  }
};

/**
 * Generate personalized learning roadmap using FastAPI with fallback
 */
const generateLearningRoadmap = async (resumeData, jobDescription, jobTitle, companyName, missingSkills, durationWeeks = 4, options = {}) => {
  const timeoutMs = options.timeoutMs || ANALYSIS_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/job/roadmap`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      resume_data: resumeData,
      job_description: jobDescription,
      job_title: jobTitle,
      company_name: companyName || null,
      missing_skills: missingSkills || null,
      duration_weeks: durationWeeks,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return normalizeRoadmapResponse(data);
    }

    return runFallbackLearningRoadmap(resumeData, jobDescription, jobTitle, companyName, missingSkills, durationWeeks);
  } catch (error) {
    clearTimeout(timeoutId);
    return runFallbackLearningRoadmap(resumeData, jobDescription, jobTitle, companyName, missingSkills, durationWeeks);
  }
};

/**
 * Get normalized base URL for the FastAPI AI microservice
 * @returns {string} Clean base URL without trailing slashes
 */
const getAiServiceBaseUrl = () => {
  const url = process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL;
  return url.trim().replace(/\/+$/, '');
};

/**
 * Check health status of Python FastAPI microservice
 * @param {object} [options]
 * @param {number} [options.timeoutMs=5000] - Request timeout in milliseconds
 * @param {string} [options.overrideUrl] - Optional URL override for testing unreachable endpoints
 * @returns {Promise<{isHealthy: boolean, statusCode: number, data?: object, message?: string}>}
 */
const checkAiServiceHealth = async (options = {}) => {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/health`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-2xx HTTP responses from FastAPI
    if (!response.ok) {
      return {
        isHealthy: false,
        statusCode: 502, // Bad Gateway (upstream service returned error)
        message: `AI microservice returned an error status (${response.status})`,
      };
    }

    // Parse and validate JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      return {
        isHealthy: false,
        statusCode: 502,
        message: 'Invalid JSON response received from AI microservice',
      };
    }

    // Verify expected payload schema
    if (!data || typeof data !== 'object' || data.status !== 'healthy') {
      return {
        isHealthy: false,
        statusCode: 502,
        message: 'AI microservice reported an unhealthy status',
        data,
      };
    }

    return {
      isHealthy: true,
      statusCode: 200,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Timeout triggered by AbortController
    if (error.name === 'AbortError' || error.type === 'aborted') {
      return {
        isHealthy: false,
        statusCode: 504, // Gateway Timeout
        message: `AI microservice request timed out after ${timeoutMs}ms`,
      };
    }

    // Connection refused, unreachable host, or general network error
    return {
      isHealthy: false,
      statusCode: 503, // Service Unavailable
      message: 'AI microservice is unavailable or unreachable',
    };
  }
};

module.exports = {
  checkAiServiceHealth,
  getAiServiceBaseUrl,
  analyzeResume,
  normalizeAnalysisResponse,
  parseJobDescription,
  matchResumeToJob,
  getCareerRecommendations,
  generateLearningRoadmap,
  normalizeJobMatchResponse,
  normalizeCareerRecommendationsResponse,
  normalizeRoadmapResponse,
};

