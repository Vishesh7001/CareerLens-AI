/**
 * AI Service Communication Layer
 * Connects Node.js Express backend to Python FastAPI AI microservice
 */

const { runFallbackAnalysis } = require('./fallbackAnalysisService');

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
};

