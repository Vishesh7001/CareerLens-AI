/**
 * Unified Dashboard & Career Intelligence Service
 * Aggregates actual data from Phases 1–5 without hardcoded statistics or fake metrics.
 */

const normalizeSkill = (s) => (s || '').trim();

/**
 * Aggregates skill intelligence across Resume (Phase 2), Analysis (Phase 3),
 * Job Matching (Phase 4), and Mock Interviews (Phase 5).
 */
const aggregateSkillIntelligence = ({
  resume = null,
  latestResumeAnalysis = null,
  jobMatches = [],
  jobDescriptions = [],
  interviews = [],
  roadmaps = [],
}) => {
  const seenStrong = new Set();
  const seenImprove = new Set();
  const seenMissing = new Set();
  const seenImproved = new Set();

  const strongSkills = [];
  const skillsToImprove = [];
  const missingRequiredSkills = [];
  const recentlyImprovedSkills = [];

  // Helper to dedupe, normalize contract, and merge multi-source evidence
  const addSkill = (list, set, item) => {
    const skillTitle = item.skillName || item.name || '';
    const key = skillTitle.toLowerCase().trim();
    if (!key) return;

    const normalizedItem = {
      ...item,
      name: skillTitle,
      skillName: skillTitle,
      status: item.status || item.currentStatus,
      currentStatus: item.currentStatus || item.status,
      sources: item.source ? [item.source] : [],
    };

    if (set.has(key)) {
      const existing = list.find((s) => (s.skillName || s.name || '').toLowerCase().trim() === key);
      if (existing) {
        if (item.source && !existing.sources?.includes(item.source)) {
          existing.sources = existing.sources ? [...existing.sources, item.source] : [existing.source, item.source];
          existing.source = `${existing.source}, ${item.source}`;
        }
        if (item.evidence && existing.evidence && !existing.evidence.includes(item.evidence)) {
          existing.evidence = `${existing.evidence} · ${item.evidence}`;
        }
      }
      return;
    }

    set.add(key);
    list.push(normalizedItem);
  };

  // 1. Phase 4 Job Match Matched Skills -> Strong Skills
  (jobMatches || []).forEach((jm) => {
    (jm.matchedSkills || []).forEach((m) => {
      addSkill(strongSkills, seenStrong, {
        skillName: m.skill,
        source: 'Job Matching',
        relatedTargetRole: jm.jobTitle || 'Target Role',
        currentStatus: 'Job-Matched Skill',
        evidence: `Matched (${m.matchType || 'exact'}) for ${jm.companyName} (${jm.overallScore}%)`,
        recommendedAction: 'Continue applying this skill in complex projects to reinforce mastery.',
      });
    });

    // Phase 4 Missing Required Skills
    (jm.missingRequiredSkills || []).forEach((ms) => {
      addSkill(missingRequiredSkills, seenMissing, {
        skillName: ms.skill,
        source: 'Job Matching',
        relatedTargetRole: jm.jobTitle || 'Target Role',
        currentStatus: 'Required for Target Job',
        priority: ms.priority || 'High',
        evidence: `Flagged as required for ${jm.companyName}: ${ms.reason || 'Core requirement'}`,
        recommendedAction: ms.suggestedLearningDirection || 'Add to your learning roadmap.',
      });
    });

    // Phase 4 Missing Preferred Skills -> Skills to Improve
    (jm.missingPreferredSkills || []).forEach((ms) => {
      addSkill(skillsToImprove, seenImprove, {
        skillName: ms.skill,
        source: 'Job Matching',
        relatedTargetRole: jm.jobTitle || 'Target Role',
        currentStatus: 'Preferred Qualification',
        priority: ms.priority || 'Medium',
        evidence: `Preferred qualification for ${jm.companyName}`,
        recommendedAction: ms.suggestedLearningDirection || 'Study fundamentals to stand out among candidates.',
      });
    });
  });

  // 2. Phase 5 Interview Demonstrated Skills & Missing Concepts
  (interviews || []).forEach((inv) => {
    (inv.questions || []).forEach((q) => {
      if (q.status === 'answered' && q.evaluation) {
        const score = q.evaluation.overallScore || 0;
        const topic = q.topic || 'General';

        if (score >= 75) {
          addSkill(strongSkills, seenStrong, {
            skillName: topic,
            source: 'Mock Interview',
            relatedTargetRole: inv.role || 'Interview Role',
            currentStatus: 'Interview-Demonstrated Skill',
            evidence: `Scored ${score}/100 on ${inv.difficulty} question: "${q.questionText?.slice(0, 50)}..."`,
            recommendedAction: 'Demonstrated solid grasp under interview conditions.',
          });
        } else if (score < 65) {
          addSkill(skillsToImprove, seenImprove, {
            skillName: topic,
            source: 'Mock Interview',
            relatedTargetRole: inv.role || 'Interview Role',
            currentStatus: 'Concept Needs Review',
            priority: 'Medium',
            evidence: `Scored ${score}/100 in ${inv.role} interview. Weakness: ${q.evaluation.weaknesses?.[0] || 'Incomplete answer'}`,
            recommendedAction: q.evaluation.improvementSuggestions?.[0] || 'Practice answering with structured frameworks.',
          });
        }

        // Missing concepts from interview
        (q.evaluation.missingConcepts || []).forEach((concept) => {
          addSkill(skillsToImprove, seenImprove, {
            skillName: concept,
            source: 'Mock Interview Feedback',
            relatedTargetRole: inv.role,
            currentStatus: 'Missed in Answer',
            priority: 'Medium',
            evidence: `Omitted during explanation of "${q.questionText?.slice(0, 45)}..."`,
            recommendedAction: 'Review architectural trade-offs and code examples for this concept.',
          });
        });
      }
    });
  });

  // 3. Phase 3 Resume Analysis Skills
  if (latestResumeAnalysis) {
    (latestResumeAnalysis.missingSkills || []).forEach((ms) => {
      if (ms.priority === 'High') {
        addSkill(missingRequiredSkills, seenMissing, {
          skillName: ms.skill,
          source: 'AI Resume Analysis',
          relatedTargetRole: latestResumeAnalysis.targetRole,
          currentStatus: 'High-Priority Gap',
          priority: 'High',
          evidence: ms.reason || 'Identified as missing for this career profile.',
          recommendedAction: 'Build a focused portfolio project showcasing this technology.',
        });
      } else {
        addSkill(skillsToImprove, seenImprove, {
          skillName: ms.skill,
          source: 'AI Resume Analysis',
          relatedTargetRole: latestResumeAnalysis.targetRole,
          currentStatus: 'Secondary Gap',
          priority: ms.priority || 'Medium',
          evidence: ms.reason || 'Helpful skill to expand role versatility.',
          recommendedAction: 'Dedicate 1-2 study sessions to understand the basics.',
        });
      }
    });
  }

  // 4. Phase 2 Resume Extracted Skills (if not already listed in strong)
  if (resume?.parsedData?.skills) {
    const s = resume.parsedData.skills;
    const allParsed = [
      ...(s.programmingLanguages || []),
      ...(s.frameworks || []),
      ...(s.databases || []),
      ...(s.tools || []),
    ];

    allParsed.forEach((skill) => {
      addSkill(strongSkills, seenStrong, {
        skillName: skill,
        source: 'Resume Extraction',
        relatedTargetRole: latestResumeAnalysis?.targetRole || 'Current Profile',
        currentStatus: 'Verified on Resume',
        evidence: 'Extracted and validated from uploaded PDF resume.',
        recommendedAction: 'Ensure key accomplishments with this skill have measurable metrics.',
      });
    });
  }

  // 5. Frequently Required Skills across saved Job Descriptions
  const skillFreq = {};
  (jobDescriptions || []).forEach((jd) => {
    const reqs = jd.extractedRequirements?.requiredSkills || [];
    reqs.forEach((skill) => {
      const k = normalizeSkill(skill);
      if (k) skillFreq[k] = (skillFreq[k] || 0) + 1;
    });
  });

  const frequentlyRequiredSkills = Object.entries(skillFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({
      name: skill,
      skillName: skill,
      occurrenceCount: count,
      demandLevel: count >= 3 ? 'Very High' : count >= 2 ? 'High' : 'Moderate',
      status: count >= 3 ? 'Very High Demand' : count >= 2 ? 'High Demand' : 'In Demand',
      currentStatus: count >= 3 ? 'Very High Demand' : count >= 2 ? 'High Demand' : 'In Demand',
      isPossessed: seenStrong.has(skill.toLowerCase()),
      evidence: `Required in ${count} target job posting${count === 1 ? '' : 's'} across saved roles.`,
      recommendedAction: seenStrong.has(skill.toLowerCase())
        ? 'Already featured in your profile; highlight in interviews.'
        : 'Prioritize learning this widely required skill.',
    }));

  // 6. Recently Improved Skills (from completed roadmap items)
  (roadmaps || []).forEach((rm) => {
    (rm.items || []).forEach((item) => {
      if (item.completed) {
        addSkill(recentlyImprovedSkills, seenImproved, {
          skillName: item.skillToLearn || item.title,
          source: 'Learning Roadmap',
          relatedTargetRole: rm.targetRole,
          currentStatus: 'Roadmap Milestone Completed',
          evidence: `Completed in Week ${item.weekNumber}: "${item.title}"`,
          recommendedAction: 'Apply in a hands-on project or practice interview question.',
        });
      }
    });
  });

  return {
    strongSkills: strongSkills.slice(0, 10),
    skillsToImprove: skillsToImprove.slice(0, 8),
    missingRequiredSkills: missingRequiredSkills.slice(0, 8),
    frequentlyRequiredSkills,
    recentlyImprovedSkills: recentlyImprovedSkills.slice(0, 6),
    totalStrongSkills: strongSkills.length,
    totalSkillsToImprove: skillsToImprove.length,
    totalMissingSkills: missingRequiredSkills.length,
  };
};

/**
 * Synthesizes personalized, actionable recommendations from real student data
 */
const generatePersonalizedRecommendations = ({
  user,
  resume,
  latestResumeAnalysis,
  jobMatches = [],
  roadmaps = [],
  interviews = [],
}) => {
  const recommendations = [];

  // Recommendation 1: Missing Resume
  if (!resume) {
    recommendations.push({
      id: 'rec_upload_resume',
      type: 'Resume Improvement',
      title: 'Upload Your Resume',
      description: 'Upload your PDF resume to unlock automated parsing, AI-powered scoring, and tailored job matching.',
      reason: 'No resume has been uploaded yet for your account.',
      sourceData: 'Phase 2 Profile Verification',
      priority: 'High',
      suggestedAction: 'Upload a standard 1-2 page PDF resume.',
      actionUrl: '/dashboard#resume-section',
      actionText: 'Upload Resume',
    });
  }

  // Recommendation 2: Resume uploaded but no analysis yet
  if (resume && !latestResumeAnalysis) {
    recommendations.push({
      id: 'rec_run_analysis',
      type: 'Resume Improvement',
      title: 'Run AI Resume Analysis',
      description: 'Analyze your resume against your target role to evaluate your ATS compatibility score and uncover technical strengths.',
      reason: 'You have a resume uploaded but have not run an AI evaluation.',
      sourceData: 'Phase 3 Resume Analyzer',
      priority: 'High',
      suggestedAction: 'Select a target role and generate your detailed feedback report.',
      actionUrl: '/analysis',
      actionText: 'Run Analysis',
    });
  }

  // Recommendation 3: Low Resume Score (< 70)
  if (latestResumeAnalysis && latestResumeAnalysis.overallScore < 70) {
    recommendations.push({
      id: 'rec_improve_resume_score',
      type: 'Resume Improvement',
      title: 'Strengthen Resume Content',
      description: `Your resume scored ${latestResumeAnalysis.overallScore}/100. Address key weaknesses: ${latestResumeAnalysis.weaknesses?.[0] || 'Add quantifiable impact metrics to project descriptions'}.`,
      reason: 'Score is below the recommended 70% threshold for competitive screening.',
      sourceData: `Phase 3 Analysis: ${latestResumeAnalysis.targetRole}`,
      priority: 'High',
      suggestedAction: 'Update your resume file with quantifiable achievements and re-analyze.',
      actionUrl: '/analysis',
      actionText: 'View Suggestions',
    });
  }

  // Recommendation 4: Missing Required Skills from Job Matches
  const allMissingSkills = [];
  (jobMatches || []).forEach((m) => {
    (m.missingRequiredSkills || []).forEach((ms) => {
      if (ms.priority === 'High' && !allMissingSkills.includes(ms.skill)) {
        allMissingSkills.push(ms.skill);
      }
    });
  });

  if (allMissingSkills.length > 0) {
    const topMissing = allMissingSkills.slice(0, 3).join(', ');
    recommendations.push({
      id: 'rec_learn_missing_skills',
      type: 'Skill Development',
      title: `Learn Critical Skills: ${topMissing}`,
      description: `Target employers frequently require ${topMissing}, which were not detected on your current resume.`,
      reason: 'Closing core required skill gaps directly increases your job compatibility score.',
      sourceData: 'Phase 4 Job Matching Diagnostics',
      priority: 'High',
      suggestedAction: 'Create or update your personalized learning roadmap.',
      actionUrl: '/roadmaps',
      actionText: 'Update Roadmap',
    });
  }

  // Recommendation 5: Incomplete Roadmap Modules
  const pendingRoadmap = roadmaps.find((r) => r.progressPercentage < 100);
  if (pendingRoadmap) {
    const nextItem = pendingRoadmap.items?.find((i) => !i.completed);
    recommendations.push({
      id: 'rec_continue_roadmap',
      type: 'Learning Roadmap',
      title: `Complete Week ${nextItem?.weekNumber || 1}: ${nextItem?.title || 'Next Module'}`,
      description: `You are at ${pendingRoadmap.progressPercentage}% on your "${pendingRoadmap.title}" roadmap. Complete the next practical exercises.`,
      reason: 'Consistent weekly progression builds demonstrable skills for tech interviews.',
      sourceData: `Phase 4 Roadmap: ${pendingRoadmap.targetRole}`,
      priority: 'Medium',
      suggestedAction: 'Review resources and complete the week milestone checkbox.',
      actionUrl: '/roadmaps',
      actionText: 'Go to Roadmap',
    });
  }

  // Recommendation 6: Mock Interview Practice
  const completedInterviews = (interviews || []).filter((i) => i.status === 'completed');
  if (completedInterviews.length === 0) {
    recommendations.push({
      id: 'rec_take_first_interview',
      type: 'Interview Preparation',
      title: 'Practice with AI Mock Interview',
      description: 'Test your technical depth and articulation in a realistic, text-based mock interview session.',
      reason: 'No completed mock interview sessions found on your profile.',
      sourceData: 'Phase 5 Mock Interview Simulator',
      priority: 'High',
      suggestedAction: 'Start a 5-question Beginner or Intermediate technical interview.',
      actionUrl: '/mock-interview',
      actionText: 'Start Interview',
    });
  } else {
    // If interviews exist, check if latest had weaknesses or low score
    const latest = completedInterviews[0];
    if (latest.overallScore < 75) {
      recommendations.push({
        id: 'rec_retake_interview',
        type: 'Interview Preparation',
        title: `Retake ${latest.role} Interview`,
        description: `Your last interview scored ${latest.overallScore}/100. Review the benchmark sample answers and retake to improve clarity and accuracy.`,
        reason: 'Repeated practice solidifies technical articulation and concept recall.',
        sourceData: `Phase 5 Interview Session (${latest.difficulty})`,
        priority: 'Medium',
        suggestedAction: 'Review feedback report and launch a new session.',
        actionUrl: `/mock-interview/${latest._id}/report`,
        actionText: 'Review Report',
      });
    }
  }

  // Recommendation 7: Job Matching
  if (jobMatches.length === 0) {
    recommendations.push({
      id: 'rec_run_job_match',
      type: 'Job Preparation',
      title: 'Evaluate Job Compatibility',
      description: 'Create a target job posting and run our 5-pillar matching engine to identify exact skill gaps.',
      reason: 'No job descriptions have been matched against your profile yet.',
      sourceData: 'Phase 4 Job Matching Engine',
      priority: 'Medium',
      suggestedAction: 'Paste a target job description to see your match score.',
      actionUrl: '/job-matching',
      actionText: 'Match Jobs',
    });
  }

  // Sort by priority (High -> Medium -> Low)
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
};

/**
 * Aggregates historical analytics for charts
 */
const aggregateAnalyticsHistory = ({
  resumeAnalyses = [],
  jobMatches = [],
  interviews = [],
  roadmaps = [],
}) => {
  // 1. Resume Score History
  const resumeHistory = (resumeAnalyses || [])
    .filter((a) => typeof a.overallScore === 'number')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((a) => ({
      date: a.createdAt,
      score: a.overallScore,
      targetRole: a.targetRole || 'Software Developer',
      provider: a.analysisProvider || 'fastapi-nlp-engine',
    }));

  // 2. Job Compatibility History
  const jobMatchHistory = (jobMatches || [])
    .filter((m) => typeof m.overallScore === 'number')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((m) => ({
      date: m.createdAt,
      score: m.overallScore,
      company: m.companyName || 'Target Company',
      role: m.jobTitle || 'Target Role',
      matchClassification: m.matchClassification || 'Match',
    }));

  // 3. Interview Performance History
  const interviewHistory = (interviews || [])
    .filter((i) => i.status === 'completed' && typeof i.overallScore === 'number')
    .sort((a, b) => new Date(a.completedAt || a.createdAt) - new Date(b.completedAt || b.createdAt))
    .map((i) => ({
      date: i.completedAt || i.createdAt,
      score: i.overallScore,
      role: i.role || 'Software Developer',
      difficulty: i.difficulty || 'Intermediate',
      interviewType: i.interviewType || 'Technical Interview',
    }));

  // 4. Learning Roadmap Progress
  let totalModules = 0;
  let completedModules = 0;
  const roadmapModules = [];

  (roadmaps || []).forEach((rm) => {
    (rm.items || []).forEach((item) => {
      totalModules += 1;
      if (item.completed) completedModules += 1;
      roadmapModules.push({
        roadmapTitle: rm.title,
        weekNumber: item.weekNumber,
        title: item.title,
        completed: Boolean(item.completed),
        completedAt: item.completedAt,
      });
    });
  });

  const roadmapProgressPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return {
    resumeHistory,
    jobMatchHistory,
    interviewHistory,
    learningProgress: {
      totalModules,
      completedModules,
      progressPercentage: roadmapProgressPercentage,
      modules: roadmapModules,
    },
    counts: {
      totalAnalyses: resumeHistory.length,
      totalJobMatches: jobMatchHistory.length,
      totalInterviews: interviewHistory.length,
      totalRoadmapModules: totalModules,
    },
  };
};

/**
 * Combines recent user activities across all features
 */
const aggregateRecentActivities = ({
  resume = null,
  resumeAnalyses = [],
  jobMatches = [],
  roadmaps = [],
  interviews = [],
  notifications = [],
}) => {
  const activities = [];

  // Resume upload activity
  if (resume) {
    activities.push({
      id: `act_resume_${resume._id}`,
      type: 'resume_upload',
      title: 'Resume Uploaded & Parsed',
      description: `Uploaded "${resume.originalFileName}" (${(resume.fileSize / 1024).toFixed(1)} KB).`,
      timestamp: resume.createdAt,
      link: '/dashboard#resume-section',
      icon: 'file',
    });
  }

  // Resume analyses
  (resumeAnalyses || []).forEach((a) => {
    activities.push({
      id: `act_analysis_${a._id}`,
      type: 'resume_analysis',
      title: `Resume Analysis for ${a.targetRole}`,
      description: `Achieved an overall score of ${a.overallScore}/100.`,
      timestamp: a.createdAt,
      link: '/analysis',
      icon: 'sparkles',
    });
  });

  // Job matches
  (jobMatches || []).forEach((m) => {
    activities.push({
      id: `act_jobmatch_${m._id}`,
      type: 'job_match',
      title: `Job Match with ${m.companyName}`,
      description: `${m.matchClassification} (${m.overallScore}%) for ${m.jobTitle}.`,
      timestamp: m.createdAt,
      link: '/job-matching',
      icon: 'briefcase',
    });
  });

  // Roadmap milestones
  (roadmaps || []).forEach((rm) => {
    (rm.items || []).forEach((item) => {
      if (item.completed && item.completedAt) {
        activities.push({
          id: `act_roadmap_${rm._id}_w${item.weekNumber}`,
          type: 'roadmap_milestone',
          title: `Completed Week ${item.weekNumber} Module`,
          description: `"${item.title}" in ${rm.title}.`,
          timestamp: item.completedAt,
          link: '/roadmaps',
          icon: 'map',
        });
      }
    });
  });

  // Completed interviews
  (interviews || []).forEach((i) => {
    if (i.status === 'completed') {
      activities.push({
        id: `act_interview_${i._id}`,
        type: 'interview_completed',
        title: `Completed ${i.difficulty} ${i.role} Interview`,
        description: `Scored ${i.overallScore}/100 across ${i.questions?.length || 5} questions.`,
        timestamp: i.completedAt || i.createdAt,
        link: `/mock-interview/${i._id}/report`,
        icon: 'message',
      });
    }
  });

  // Sort strictly by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return activities;
};

module.exports = {
  aggregateSkillIntelligence,
  generatePersonalizedRecommendations,
  aggregateAnalyticsHistory,
  aggregateRecentActivities,
};
