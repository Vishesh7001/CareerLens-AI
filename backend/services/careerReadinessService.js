/**
 * Career Readiness Score Engine for CareerLens AI
 *
 * Weighted Categories:
 * 1. Resume Quality: 20% (Latest valid Phase 3 ResumeAnalysis overallScore)
 * 2. Job Compatibility: 25% (Average of latest valid Phase 4 JobMatch scores)
 * 3. Technical Skills: 20% (Skill coverage, matched vs missing skills, role relevance)
 * 4. Learning Progress: 15% (Roadmap modules completed / total available modules)
 * 5. Interview Performance: 20% (Average overallScore across completed Phase 5 interviews)
 *
 * Total Base Weight: 100%
 *
 * CRITICAL MISSING DATA HANDLING:
 * If a category is unavailable, it is marked as available: false.
 * Missing categories are NEVER treated as zero.
 * Weights are dynamically renormalized across available categories:
 *   normalizedWeight = (defaultWeight / sumOfAvailableWeights) * 100
 *
 * If no category has data, overallScore is null with a guiding message.
 */

const DEFAULT_WEIGHTS = {
  resumeQuality: 20,
  jobCompatibility: 25,
  technicalSkills: 20,
  learningProgress: 15,
  interviewPerformance: 20,
};

const READINESS_CLASSIFICATIONS = [
  { min: 80, label: 'Highly Prepared', color: 'emerald', description: 'Strong technical mastery, resume alignment, and interview readiness.' },
  { min: 65, label: 'Progressing Well', color: 'sky', description: 'Solid foundation with clear pathways identified for remaining skill gaps.' },
  { min: 40, label: 'Developing Skills', color: 'amber', description: 'Active skill development underway; focus on completing roadmap milestones.' },
  { min: 0, label: 'Getting Started', color: 'slate', description: 'Beginning career preparation; complete key activities to build your profile.' },
];

/**
 * Calculates Career Readiness Score and category contributions
 *
 * @param {object} params
 * @param {object|null} params.latestResumeAnalysis - ResumeAnalysis doc
 * @param {Array} params.jobMatches - Array of JobMatch docs
 * @param {object|null} params.resume - Resume doc
 * @param {Array} params.roadmaps - Array of LearningRoadmap docs
 * @param {Array} params.interviews - Array of completed InterviewSession docs
 * @returns {object} Career readiness report
 */
const calculateCareerReadiness = ({
  latestResumeAnalysis = null,
  jobMatches = [],
  resume = null,
  roadmaps = [],
  interviews = [],
}) => {
  const categoryScores = {};
  const missingCategories = [];

  // 1. Resume Quality (20%)
  if (latestResumeAnalysis && typeof latestResumeAnalysis.overallScore === 'number') {
    categoryScores.resumeQuality = {
      score: Math.min(100, Math.max(0, Math.round(latestResumeAnalysis.overallScore))),
      defaultWeight: DEFAULT_WEIGHTS.resumeQuality,
      available: true,
      label: 'Resume Quality',
      source: 'Latest AI Resume Analysis',
      detail: `Evaluated score for ${latestResumeAnalysis.targetRole || 'Target Role'}`,
    };
  } else {
    categoryScores.resumeQuality = {
      score: null,
      defaultWeight: DEFAULT_WEIGHTS.resumeQuality,
      available: false,
      label: 'Resume Quality',
      source: 'No resume analysis completed yet',
      detail: 'Analyze your resume to unlock this category',
    };
    missingCategories.push('Resume Quality');
  }

  // 2. Job Compatibility (25%)
  const validMatches = (jobMatches || []).filter((m) => typeof m.overallScore === 'number');
  if (validMatches.length > 0) {
    const avgMatchScore = Math.round(
      validMatches.reduce((acc, m) => acc + m.overallScore, 0) / validMatches.length
    );
    categoryScores.jobCompatibility = {
      score: Math.min(100, Math.max(0, avgMatchScore)),
      defaultWeight: DEFAULT_WEIGHTS.jobCompatibility,
      available: true,
      label: 'Job Compatibility',
      source: `Average of ${validMatches.length} Job Match${validMatches.length === 1 ? '' : 'es'}`,
      detail: `Latest role: ${validMatches[0].jobTitle || 'Target Job'}`,
    };
  } else {
    categoryScores.jobCompatibility = {
      score: null,
      defaultWeight: DEFAULT_WEIGHTS.jobCompatibility,
      available: false,
      label: 'Job Compatibility',
      source: 'No job descriptions matched yet',
      detail: 'Run job matching against target job descriptions',
    };
    missingCategories.push('Job Compatibility');
  }

  // 3. Technical Skills (20%)
  let techScore = null;
  let techSource = '';
  if (latestResumeAnalysis?.categoryScores?.technicalSkills?.score !== undefined) {
    // Phase 3 technicalSkills is scored out of maxScore (typically 30)
    const raw = latestResumeAnalysis.categoryScores.technicalSkills.score;
    const max = latestResumeAnalysis.categoryScores.technicalSkills.maxScore || 30;
    techScore = Math.min(100, Math.max(0, Math.round((raw / max) * 100)));
    techSource = 'Phase 3 Technical Skill Evaluation';
  } else if (validMatches.length > 0) {
    // Compute from matched skills percentage across matches
    const totalMatched = validMatches.reduce((acc, m) => acc + (m.matchedSkills?.length || 0), 0);
    const totalMissing = validMatches.reduce(
      (acc, m) => acc + (m.missingRequiredSkills?.length || 0),
      0
    );
    const total = totalMatched + totalMissing;
    if (total > 0) {
      techScore = Math.min(100, Math.max(0, Math.round((totalMatched / total) * 100)));
      techSource = 'Job Match Skill Alignment';
    }
  } else if (resume?.parsedData?.skills) {
    // Base score from skills count on resume
    const s = resume.parsedData.skills;
    const count =
      (s.programmingLanguages?.length || 0) +
      (s.frameworks?.length || 0) +
      (s.databases?.length || 0) +
      (s.tools?.length || 0);
    if (count > 0) {
      techScore = Math.min(85, Math.max(40, count * 6));
      techSource = 'Extracted Resume Technical Skills';
    }
  }

  if (techScore !== null) {
    categoryScores.technicalSkills = {
      score: techScore,
      defaultWeight: DEFAULT_WEIGHTS.technicalSkills,
      available: true,
      label: 'Technical Skills',
      source: techSource,
      detail: 'Coverage and accuracy across target technologies',
    };
  } else {
    categoryScores.technicalSkills = {
      score: null,
      defaultWeight: DEFAULT_WEIGHTS.technicalSkills,
      available: false,
      label: 'Technical Skills',
      source: 'No technical skill data available',
      detail: 'Upload resume or run skills analysis to unlock',
    };
    missingCategories.push('Technical Skills');
  }

  // 4. Learning Progress (15%)
  let totalRoadmapItems = 0;
  let completedRoadmapItems = 0;
  (roadmaps || []).forEach((rm) => {
    if (Array.isArray(rm.items)) {
      totalRoadmapItems += rm.items.length;
      completedRoadmapItems += rm.items.filter((item) => item.completed).length;
    }
  });

  if (totalRoadmapItems > 0) {
    const roadmapScore = Math.round((completedRoadmapItems / totalRoadmapItems) * 100);
    categoryScores.learningProgress = {
      score: Math.min(100, Math.max(0, roadmapScore)),
      defaultWeight: DEFAULT_WEIGHTS.learningProgress,
      available: true,
      label: 'Learning Progress',
      source: `${completedRoadmapItems} of ${totalRoadmapItems} modules completed`,
      detail: `${roadmaps.length} active roadmap${roadmaps.length === 1 ? '' : 's'}`,
    };
  } else {
    categoryScores.learningProgress = {
      score: null,
      defaultWeight: DEFAULT_WEIGHTS.learningProgress,
      available: false,
      label: 'Learning Progress',
      source: 'No learning roadmap generated yet',
      detail: 'Generate a personalized 4-week roadmap to track progress',
    };
    missingCategories.push('Learning Progress');
  }

  // 5. Interview Performance (20%)
  const completedInterviews = (interviews || []).filter(
    (i) => i.status === 'completed' && typeof i.overallScore === 'number'
  );

  if (completedInterviews.length > 0) {
    const avgInterviewScore = Math.round(
      completedInterviews.reduce((acc, i) => acc + i.overallScore, 0) / completedInterviews.length
    );
    categoryScores.interviewPerformance = {
      score: Math.min(100, Math.max(0, avgInterviewScore)),
      defaultWeight: DEFAULT_WEIGHTS.interviewPerformance,
      available: true,
      label: 'Interview Performance',
      source: `Average across ${completedInterviews.length} completed interview${completedInterviews.length === 1 ? '' : 's'}`,
      detail: `Latest role: ${completedInterviews[0].role || 'Technical Interview'}`,
    };
  } else {
    categoryScores.interviewPerformance = {
      score: null,
      defaultWeight: DEFAULT_WEIGHTS.interviewPerformance,
      available: false,
      label: 'Interview Performance',
      source: 'No completed mock interviews yet',
      detail: 'Complete a text-based mock interview to assess readiness',
    };
    missingCategories.push('Interview Performance');
  }

  // Weight Renormalization Calculation
  const availableKeys = Object.keys(categoryScores).filter((k) => categoryScores[k].available);
  const sumAvailableWeights = availableKeys.reduce(
    (acc, k) => acc + categoryScores[k].defaultWeight,
    0
  );

  let overallScore = null;
  const appliedWeights = {};

  if (availableKeys.length > 0 && sumAvailableWeights > 0) {
    let accumulatedContribution = 0;

    availableKeys.forEach((key) => {
      const cat = categoryScores[key];
      // Renormalize relative weight to 100% total
      const normalizedWeight = (cat.defaultWeight / sumAvailableWeights) * 100;
      appliedWeights[key] = Math.round(normalizedWeight);

      const contribution = (cat.score * normalizedWeight) / 100;
      cat.appliedWeight = Math.round(normalizedWeight);
      cat.contribution = Math.round(contribution);
      accumulatedContribution += contribution;
    });

    overallScore = Math.min(100, Math.max(0, Math.round(accumulatedContribution)));
  }

  // Determine readiness classification
  let classification = READINESS_CLASSIFICATIONS[READINESS_CLASSIFICATIONS.length - 1];
  if (overallScore !== null) {
    for (const item of READINESS_CLASSIFICATIONS) {
      if (overallScore >= item.min) {
        classification = item;
        break;
      }
    }
  }

  // Explain calculation transparently
  let calculationExplanation = '';
  if (overallScore === null) {
    calculationExplanation =
      'Complete more career activities (upload a resume, run a job match, or complete a mock interview) to calculate your Career Readiness Score.';
  } else {
    const availableNames = availableKeys.map((k) => `${categoryScores[k].label} (${appliedWeights[k]}%)`).join(', ');
    const missingNotice =
      missingCategories.length > 0
        ? ` Note: Weights were renormalized across available activities. Missing: ${missingCategories.join(', ')}.`
        : ' All 5 career pillars contributed to this score.';
    calculationExplanation = `Calculated as the normalized weighted average of: ${availableNames}.${missingNotice}`;
  }

  return {
    overallScore,
    classification: classification.label,
    classificationColor: classification.color,
    classificationDescription: classification.description,
    categoryScores,
    appliedWeights,
    missingCategories,
    availableCategoriesCount: availableKeys.length,
    totalCategoriesCount: Object.keys(DEFAULT_WEIGHTS).length,
    calculationExplanation,
    isFullyEvaluated: missingCategories.length === 0,
    disclaimer: 'This score is an internal readiness indicator for your skill preparation and does not constitute a guarantee of employment.',
    lastCalculatedAt: new Date(),
  };
};

module.exports = {
  calculateCareerReadiness,
  DEFAULT_WEIGHTS,
};
