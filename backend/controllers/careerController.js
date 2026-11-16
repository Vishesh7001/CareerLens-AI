const mongoose = require('mongoose');
const CareerRecommendation = require('../models/CareerRecommendation');
const JobDescription = require('../models/JobDescription');
const Resume = require('../models/Resume');
const { getCareerRecommendations } = require('../services/aiService');

/**
 * @desc    Generate or update career path recommendations
 * @route   POST /api/career/recommendations
 * @access  Private
 */
const generateCareerRecommendations = async (req, res, next) => {
  try {
    const { jobId, targetRole } = req.body;

    const resume = await Resume.findOne({
      user: req.user._id,
      parsingStatus: 'completed',
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'No active parsed resume found. Please upload a resume first.',
      });
    }

    let jobDescriptionText = null;
    let validJobId = null;

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job identifier format.',
        });
      }
      const job = await JobDescription.findOne({ _id: jobId, user: req.user._id });
      if (job) {
        jobDescriptionText = job.jobDescription;
        validJobId = job._id;
      }
    }

    const aiResult = await getCareerRecommendations(
      resume.parsedData,
      jobDescriptionText,
      targetRole || null
    );

    const recRecord = await CareerRecommendation.findOneAndUpdate(
      {
        user: req.user._id,
        resume: resume._id,
      },
      {
        user: req.user._id,
        resume: resume._id,
        job: validJobId,
        targetRole: targetRole || null,
        primaryRecommendations: aiResult.primaryRecommendations,
        alternativeRecommendations: aiResult.alternativeRecommendations,
        studentAdvice: aiResult.studentAdvice,
        analysisProvider: aiResult.analysisProvider,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Career path recommendations generated successfully.',
      recommendations: recRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get latest saved career path recommendations
 * @route   GET /api/career/recommendations
 * @access  Private
 */
const getSavedRecommendations = async (req, res, next) => {
  try {
    const record = await CareerRecommendation.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No career path recommendations found. Run an evaluation to generate recommendations.',
      });
    }

    return res.status(200).json({
      success: true,
      recommendations: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCareerRecommendations,
  getSavedRecommendations,
};
