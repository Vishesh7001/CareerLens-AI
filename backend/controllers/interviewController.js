const mongoose = require('mongoose');
const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateInterviewReport,
} = require('../services/aiService');

/**
 * Sanitizes questions for client delivery (hides expectedConcepts & evaluationCriteria on pending questions)
 */
const sanitizeQuestionsForClient = (questions) => {
  return (questions || []).map((q) => {
    const raw = q.toObject ? q.toObject() : { ...q };
    if (raw.status === 'pending') {
      delete raw.expectedConcepts;
      delete raw.evaluationCriteria;
      delete raw.sampleAnswer;
    }
    return raw;
  });
};

/**
 * @desc    Create new mock interview session and generate questions
 * @route   POST /api/interviews
 * @access  Private
 */
const createInterview = async (req, res, next) => {
  try {
    const {
      role,
      customRole,
      interviewType = 'Technical Interview',
      difficulty = 'Intermediate',
      totalQuestions = 5,
      resumeId,
      jobId,
    } = req.body;

    // 1. Role validation
    if (!role || typeof role !== 'string' || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required to start a mock interview.',
      });
    }

    if (role === 'Custom Role' && (!customRole || !customRole.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the custom role name.',
      });
    }

    // 2. Type validation
    const validTypes = ['Technical Interview', 'HR Interview', 'Mixed Interview'];
    if (!validTypes.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid interview type. Allowed: ${validTypes.join(', ')}`,
      });
    }

    // 3. Difficulty validation
    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty. Allowed: ${validDifficulties.join(', ')}`,
      });
    }

    // 4. Total questions validation
    const numQuestions = Number(totalQuestions);
    if (![5, 10, 15].includes(numQuestions)) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be 5, 10, or 15.',
      });
    }

    // 5. Validate Resume Ownership if provided
    let resumeDoc = null;
    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resume ID format.',
        });
      }
      resumeDoc = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (!resumeDoc) {
        return res.status(404).json({
          success: false,
          message: 'Selected resume not found or not owned by authenticated user.',
        });
      }
    }

    // 6. Validate Job Description Ownership if provided
    let jobDoc = null;
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID format.',
        });
      }
      jobDoc = await JobDescription.findOne({ _id: jobId, user: req.user._id });
      if (!jobDoc) {
        return res.status(404).json({
          success: false,
          message: 'Selected job description not found or not owned by authenticated user.',
        });
      }
    }

    // 7. Generate questions via AI Service (with transparent fallback)
    const aiResult = await generateInterviewQuestions({
      role: role.trim(),
      customRole: customRole ? customRole.trim() : null,
      interviewType,
      difficulty,
      totalQuestions: numQuestions,
      resumeData: resumeDoc ? resumeDoc.parsedData : null,
      jobDescription: jobDoc ? jobDoc.jobDescription : null,
      jobTitle: jobDoc ? jobDoc.jobTitle : null,
      companyName: jobDoc ? jobDoc.companyName : null,
    });

    const generatedQuestions = (aiResult?.questions || []).map((q, idx) => ({
      questionId: q.questionId || `q_${idx + 1}`,
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty || difficulty.toLowerCase(),
      topic: q.topic || 'General',
      order: q.order || idx + 1,
      expectedConcepts: q.expectedConcepts || [],
      evaluationCriteria: q.evaluationCriteria || [],
      sampleAnswer: q.sampleAnswer || '',
      draftAnswer: '',
      answer: '',
      wordCount: 0,
      answerSubmittedAt: null,
      status: 'pending',
      evaluation: null,
    }));

    // 8. Create and persist session in MongoDB
    const session = await InterviewSession.create({
      user: req.user._id,
      resume: resumeDoc ? resumeDoc._id : null,
      job: jobDoc ? jobDoc._id : null,
      role: role.trim(),
      customRole: customRole ? customRole.trim() : null,
      interviewType,
      difficulty,
      totalQuestions: generatedQuestions.length,
      currentQuestionIndex: 0,
      status: 'in-progress',
      questions: generatedQuestions,
      overallScore: null,
      performanceLabel: null,
      completionPercentage: 0,
      provider: aiResult.provider || 'fastapi-ai-engine',
      startedAt: new Date(),
    });

    const sessionObj = session.toObject();
    sessionObj.questions = sanitizeQuestionsForClient(sessionObj.questions);

    return res.status(201).json({
      success: true,
      message: 'Interview session created successfully.',
      interview: sessionObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's mock interview history
 * @route   GET /api/interviews
 * @access  Private
 */
const getUserInterviews = async (req, res, next) => {
  try {
    const interviews = await InterviewSession.find({ user: req.user._id })
      .select('-questions.expectedConcepts -questions.evaluationCriteria -questions.sampleAnswer')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single interview session by ID
 * @route   GET /api/interviews/:interviewId
 * @access  Private
 */
const getInterviewById = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const sessionObj = interview.toObject();
    sessionObj.questions = sanitizeQuestionsForClient(sessionObj.questions);

    return res.status(200).json({
      success: true,
      interview: sessionObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete single interview session
 * @route   DELETE /api/interviews/:interviewId
 * @access  Private
 */
const deleteInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOneAndDelete({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or not owned by you.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview session deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current question for active interview
 * @route   GET /api/interviews/:interviewId/current-question
 * @access  Private
 */
const getCurrentQuestion = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const idx = interview.currentQuestionIndex || 0;
    if (idx >= interview.questions.length) {
      return res.status(200).json({
        success: true,
        completed: true,
        message: 'All questions have been completed.',
        totalQuestions: interview.questions.length,
      });
    }

    const question = interview.questions[idx].toObject();
    if (question.status === 'pending') {
      delete question.expectedConcepts;
      delete question.evaluationCriteria;
      delete question.sampleAnswer;
    }

    return res.status(200).json({
      success: true,
      questionIndex: idx,
      totalQuestions: interview.questions.length,
      question,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save draft answer for question
 * @route   PATCH /api/interviews/:interviewId/draft
 * @access  Private
 */
const saveDraftAnswer = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { draftAnswer = '', questionIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const targetIdx = typeof questionIndex === 'number' ? questionIndex : interview.currentQuestionIndex;
    if (targetIdx < 0 || targetIdx >= interview.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index.',
      });
    }

    interview.questions[targetIdx].draftAnswer = String(draftAnswer);
    interview.markModified('questions');
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Draft saved successfully.',
      questionIndex: targetIdx,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answer for question and trigger AI evaluation
 * @route   POST /api/interviews/:interviewId/answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { answer, questionIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    // Answer validation (prevent empty submission)
    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer cannot be empty.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This interview session has already been completed.',
      });
    }

    const targetIdx = typeof questionIndex === 'number' ? questionIndex : interview.currentQuestionIndex;
    if (targetIdx < 0 || targetIdx >= interview.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index.',
      });
    }

    const targetQ = interview.questions[targetIdx];

    // Prevent duplicate answer submission
    if (targetQ.status === 'answered' && targetQ.evaluation) {
      return res.status(400).json({
        success: false,
        message: 'This question has already been answered and evaluated.',
        evaluation: targetQ.evaluation,
      });
    }

    // Step 1: Save submitted answer first to guarantee persistence before evaluation
    const cleanAnswer = answer.trim();
    targetQ.answer = cleanAnswer;
    targetQ.wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;
    targetQ.answerSubmittedAt = new Date();
    targetQ.status = 'answered';
    targetQ.draftAnswer = '';

    interview.markModified('questions');
    await interview.save();

    // Step 2: Trigger AI evaluation (FastAPI with automatic transparent fallback)
    try {
      const evalResult = await evaluateInterviewAnswer({
        questionId: targetQ.questionId,
        questionText: targetQ.questionText,
        category: targetQ.category,
        difficulty: targetQ.difficulty,
        topic: targetQ.topic,
        expectedConcepts: targetQ.expectedConcepts || [],
        evaluationCriteria: targetQ.evaluationCriteria || [],
        sampleAnswer: targetQ.sampleAnswer,
        answer: cleanAnswer,
        role: interview.role,
      });

      targetQ.evaluation = evalResult;

      // Update session completion percentage
      const answeredCount = interview.questions.filter((q) => q.status === 'answered').length;
      interview.completionPercentage = Math.round((answeredCount / interview.totalQuestions) * 100);

      interview.markModified('questions');
      await interview.save();

      return res.status(200).json({
        success: true,
        message: 'Answer evaluated successfully.',
        questionIndex: targetIdx,
        evaluation: evalResult,
        question: targetQ,
        completionPercentage: interview.completionPercentage,
      });
    } catch (evalError) {
      // Answer remains saved even if evaluation encountered temporary error
      return res.status(500).json({
        success: false,
        message: 'Answer saved, but evaluation failed. Please retry evaluation.',
        canRetry: true,
        questionIndex: targetIdx,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retry answer evaluation for an already saved answer
 * @route   POST /api/interviews/:interviewId/retry-evaluation
 * @access  Private
 */
const retryEvaluation = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { questionIndex } = req.body;

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const targetIdx = typeof questionIndex === 'number' ? questionIndex : interview.currentQuestionIndex;
    const targetQ = interview.questions[targetIdx];

    if (!targetQ || !targetQ.answer) {
      return res.status(400).json({ success: false, message: 'No answer available to evaluate.' });
    }

    const evalResult = await evaluateInterviewAnswer({
      questionId: targetQ.questionId,
      questionText: targetQ.questionText,
      category: targetQ.category,
      difficulty: targetQ.difficulty,
      topic: targetQ.topic,
      expectedConcepts: targetQ.expectedConcepts || [],
      evaluationCriteria: targetQ.evaluationCriteria || [],
      sampleAnswer: targetQ.sampleAnswer,
      answer: targetQ.answer,
      role: interview.role,
    });

    targetQ.evaluation = evalResult;
    interview.markModified('questions');
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully.',
      evaluation: evalResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Advance to next question
 * @route   POST /api/interviews/:interviewId/next
 * @access  Private
 */
const nextQuestion = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const nextIdx = (interview.currentQuestionIndex || 0) + 1;
    if (nextIdx < interview.questions.length) {
      interview.currentQuestionIndex = nextIdx;
      await interview.save();
    }

    return res.status(200).json({
      success: true,
      currentQuestionIndex: interview.currentQuestionIndex,
      isLastQuestion: interview.currentQuestionIndex >= interview.questions.length - 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Safely aggregates rubric scores across all answered questions with evaluations.
 * Computes the exact average score for each rubric dimension present.
 * Uses actual evaluation data and handles missing dimensions safely.
 *
 * @param {Array} questions - Array of questions from InterviewSession
 * @returns {Record<string, number>} Aggregated performance breakdown { criterion: averageScore }
 */
const calculatePerformanceBreakdown = (questions = []) => {
  if (!Array.isArray(questions)) return {};

  const sums = {};
  const counts = {};

  const normalizeKey = (key) => {
    const k = String(key || '').trim();
    const map = {
      technical_accuracy: 'technicalAccuracy',
      technicalAccuracy: 'technicalAccuracy',
      'technical accuracy': 'technicalAccuracy',
      relevance: 'relevance',
      completeness: 'completeness',
      clarity: 'clarity',
      structure_and_communication: 'structureAndCommunication',
      structureAndCommunication: 'structureAndCommunication',
      structure: 'structureAndCommunication',
      examples_and_specificity: 'examplesAndSpecificity',
      examplesAndSpecificity: 'examplesAndSpecificity',
      examples: 'examplesAndSpecificity',
    };
    return map[k] || k;
  };

  for (const q of questions) {
    if (!q || q.status !== 'answered' || !q.evaluation) continue;

    const evalObj = q.evaluation;
    const cs = evalObj.criterionScores || evalObj.criterion_scores;
    if (!cs) continue;

    const entries = cs instanceof Map
      ? Array.from(cs.entries())
      : typeof cs === 'object' && cs !== null
        ? Object.entries(cs)
        : [];

    for (const [rawKey, val] of entries) {
      if (val === null || val === undefined || isNaN(val)) continue;
      const num = Number(val);
      if (num < 0 || num > 100) continue;

      const canonicalKey = normalizeKey(rawKey);
      sums[canonicalKey] = (sums[canonicalKey] || 0) + num;
      counts[canonicalKey] = (counts[canonicalKey] || 0) + 1;
    }
  }

  const breakdown = {};
  for (const key of Object.keys(sums)) {
    const count = counts[key] || 1;
    breakdown[key] = Math.round(sums[key] / count);
  }

  return breakdown;
};

/**
 * @desc    Complete interview session and generate final performance report
 * @route   POST /api/interviews/:interviewId/complete
 * @access  Private
 */
const completeInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Generate report via AI service (with flattened maps)
    const sanitizedQuestions = interview.questions.map((q) =>
      q.toObject ? q.toObject({ flattenMaps: true }) : q
    );

    const reportData = await generateInterviewReport({
      role: interview.role,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      questions: sanitizedQuestions,
    });

    // Check if reportData.performanceBreakdown has non-empty keys
    const reportBreakdownEntries = reportData.performanceBreakdown
      ? (reportData.performanceBreakdown instanceof Map
          ? Array.from(reportData.performanceBreakdown.entries())
          : Object.entries(reportData.performanceBreakdown))
      : [];

    let finalBreakdown = {};
    if (reportBreakdownEntries.length > 0) {
      for (const [k, v] of reportBreakdownEntries) {
        if (v !== null && v !== undefined && !isNaN(v)) {
          finalBreakdown[k] = Math.round(Number(v));
        }
      }
    } else {
      // Fallback to direct calculation from stored evaluations on questions
      finalBreakdown = calculatePerformanceBreakdown(interview.questions);
    }

    interview.overallScore = reportData.overallScore;
    interview.performanceLabel = reportData.performanceLabel;
    interview.completionPercentage = reportData.completionPercentage;
    interview.performanceBreakdown = finalBreakdown;
    interview.summaryFeedback = {
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      readinessAssessment: reportData.readinessAssessment,
    };
    interview.status = 'completed';
    interview.completedAt = new Date();

    interview.markModified('performanceBreakdown');
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Interview completed successfully.',
      report: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get final performance report
 * @route   GET /api/interviews/:interviewId/report
 * @access  Private
 */
const getInterviewReport = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview session ID.',
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const hasExistingBreakdown = () => {
      if (!interview.performanceBreakdown) return false;
      if (interview.performanceBreakdown instanceof Map) {
        return interview.performanceBreakdown.size > 0;
      }
      return Object.keys(interview.performanceBreakdown).length > 0;
    };

    // If not completed yet, calculate interim report
    if (interview.status !== 'completed') {
      const sanitizedQuestions = interview.questions.map((q) =>
        q.toObject ? q.toObject({ flattenMaps: true }) : q
      );

      const reportData = await generateInterviewReport({
        role: interview.role,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
        questions: sanitizedQuestions,
      });

      let finalBreakdown = reportData.performanceBreakdown || {};
      const entries = finalBreakdown instanceof Map
        ? Array.from(finalBreakdown.entries())
        : Object.entries(finalBreakdown);

      if (entries.length === 0) {
        finalBreakdown = calculatePerformanceBreakdown(interview.questions);
      }

      interview.overallScore = reportData.overallScore;
      interview.performanceLabel = reportData.performanceLabel;
      interview.completionPercentage = reportData.completionPercentage;
      interview.performanceBreakdown = finalBreakdown;
      interview.summaryFeedback = {
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        readinessAssessment: reportData.readinessAssessment,
      };
    } else if (!hasExistingBreakdown()) {
      // Self-heal already completed sessions that had missing performanceBreakdown
      const healedBreakdown = calculatePerformanceBreakdown(interview.questions);
      if (Object.keys(healedBreakdown).length > 0) {
        interview.performanceBreakdown = healedBreakdown;
        interview.markModified('performanceBreakdown');
        await interview.save();
      }
    }

    return res.status(200).json({
      success: true,
      report: interview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getUserInterviews,
  getInterviewById,
  deleteInterview,
  getCurrentQuestion,
  saveDraftAnswer,
  submitAnswer,
  retryEvaluation,
  nextQuestion,
  completeInterview,
  getInterviewReport,
};
