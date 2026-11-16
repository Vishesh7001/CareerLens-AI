const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { analyzeResume } = require('../services/aiService');

const VALID_PREDEFINED_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
];

/**
 * @desc    Generate or update resume analysis for a target role
 * @route   POST /api/analysis/:resumeId
 * @access  Private (Authenticated User)
 */
const createOrRunAnalysis = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { targetRole, jobDescription } = req.body;

    // 1. Validate resumeId format
    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume identifier format.',
      });
    }

    // 2. Validate targetRole
    if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid target career role for analysis.',
      });
    }

    const trimmedRole = targetRole.trim();
    if (trimmedRole.length < 2 || trimmedRole.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Target career role must be between 2 and 100 characters in length.',
      });
    }

    // 3. Verify resume exists and belongs exclusively to authenticated user
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or does not belong to your account.',
      });
    }

    // 4. Validate jobDescription length if supplied
    const cleanJd = jobDescription && typeof jobDescription === 'string' ? jobDescription.trim().slice(0, 5000) : null;

    // 5. Execute analysis via Python FastAPI microservice (or graceful transparent fallback)
    const analysisResult = await analyzeResume(
      resume.parsedData || {},
      trimmedRole,
      cleanJd,
      resume.rawText || ''
    );

    // 6. Persist or update analysis in MongoDB
    // Check if an analysis for this user, resume, and role already exists
    let existingAnalysis = await ResumeAnalysis.findOne({
      user: req.user._id,
      resume: resume._id,
      targetRole: trimmedRole,
    });

    if (existingAnalysis) {
      existingAnalysis.jobDescription = cleanJd;
      existingAnalysis.overallScore = analysisResult.overallScore;
      existingAnalysis.categoryScores = analysisResult.categoryScores;
      existingAnalysis.strengths = analysisResult.strengths;
      existingAnalysis.weaknesses = analysisResult.weaknesses;
      existingAnalysis.technicalSkillsAnalysis = analysisResult.technicalSkillsAnalysis;
      existingAnalysis.missingSkills = analysisResult.missingSkills;
      existingAnalysis.projectAnalysis = analysisResult.projectAnalysis;
      existingAnalysis.experienceAnalysis = analysisResult.experienceAnalysis;
      existingAnalysis.improvementSuggestions = analysisResult.improvementSuggestions;
      existingAnalysis.aiFeedback = analysisResult.aiFeedback;
      existingAnalysis.analysisProvider = analysisResult.analysisProvider;

      await existingAnalysis.save();

      return res.status(200).json({
        success: true,
        message: 'Resume analysis updated successfully.',
        analysis: existingAnalysis,
      });
    }

    const newAnalysis = await ResumeAnalysis.create({
      user: req.user._id,
      resume: resume._id,
      ...analysisResult,
      jobDescription: cleanJd,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume analysis generated successfully.',
      analysis: newAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve saved analysis for a user's resume
 * @route   GET /api/analysis/:resumeId
 * @access  Private (Authenticated User)
 */
const getAnalysisByResumeId = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { role } = req.query;

    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume identifier format.',
      });
    }

    const query = {
      user: req.user._id,
      resume: resumeId,
    };

    if (role && typeof role === 'string' && role.trim()) {
      query.targetRole = role.trim();
    }

    // Retrieve most recent analysis for this resume
    const analysis = await ResumeAnalysis.findOne(query).sort({ updatedAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this resume.',
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete analysis for a user's resume
 * @route   DELETE /api/analysis/:resumeId
 * @access  Private (Authenticated User)
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { role } = req.query;

    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume identifier format.',
      });
    }

    const query = {
      user: req.user._id,
      resume: resumeId,
    };

    if (role && typeof role === 'string' && role.trim()) {
      query.targetRole = role.trim();
    }

    const deleteResult = await ResumeAnalysis.deleteMany(query);

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No analysis record found to delete.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analysis deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrRunAnalysis,
  getAnalysisByResumeId,
  deleteAnalysis,
  VALID_PREDEFINED_ROLES,
};
