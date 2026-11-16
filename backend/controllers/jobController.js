const mongoose = require('mongoose');
const JobDescription = require('../models/JobDescription');
const JobMatch = require('../models/JobMatch');
const Resume = require('../models/Resume');
const LearningRoadmap = require('../models/LearningRoadmap');
const { parseJobDescription, matchResumeToJob } = require('../services/aiService');

const VALID_JOB_TYPES = ['Internship', 'Full-time', 'Part-time', 'Entry-level'];

/**
 * @desc    Create a new job description
 * @route   POST /api/jobs
 * @access  Private
 */
const createJob = async (req, res, next) => {
  try {
    const {
      companyName,
      jobTitle,
      jobDescription,
      jobType = 'Full-time',
      location = 'Remote / Hybrid',
      applicationDeadline = null,
    } = req.body;

    // Validation
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
    }

    if (!jobTitle || typeof jobTitle !== 'string' || !jobTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required.',
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required.',
      });
    }

    const trimmedDesc = jobDescription.trim();
    if (trimmedDesc.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Job description must be at least 10 characters in length.',
      });
    }

    if (trimmedDesc.length > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Job description exceeds maximum allowable length of 20,000 characters.',
      });
    }

    const effectiveJobType = VALID_JOB_TYPES.includes(jobType) ? jobType : 'Full-time';

    // Parse extracted requirements via AI / fallback engine
    const extractedRequirements = await parseJobDescription(
      trimmedDesc,
      jobTitle.trim(),
      companyName.trim()
    );

    const newJob = await JobDescription.create({
      user: req.user._id,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: trimmedDesc,
      jobType: effectiveJobType,
      location: (location || 'Remote / Hybrid').trim(),
      applicationDeadline: applicationDeadline ? String(applicationDeadline).trim() : null,
      extractedRequirements,
    });

    return res.status(201).json({
      success: true,
      message: 'Job description saved successfully.',
      job: newJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all job descriptions belonging to the authenticated user
 * @route   GET /api/jobs
 * @access  Private
 */
const getJobs = async (req, res, next) => {
  try {
    const jobs = await JobDescription.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single job description by ID
 * @route   GET /api/jobs/:jobId
 * @access  Private
 */
const getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job identifier format.',
      });
    }

    const job = await JobDescription.findOne({
      _id: jobId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing job description
 * @route   PUT /api/jobs/:jobId
 * @access  Private
 */
const updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const {
      companyName,
      jobTitle,
      jobDescription,
      jobType,
      location,
      applicationDeadline,
    } = req.body;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job identifier format.',
      });
    }

    const job = await JobDescription.findOne({
      _id: jobId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }

    let shouldReparse = false;

    if (companyName && typeof companyName === 'string' && companyName.trim()) {
      job.companyName = companyName.trim();
    }

    if (jobTitle && typeof jobTitle === 'string' && jobTitle.trim()) {
      if (job.jobTitle !== jobTitle.trim()) shouldReparse = true;
      job.jobTitle = jobTitle.trim();
    }

    if (jobDescription && typeof jobDescription === 'string' && jobDescription.trim()) {
      const trimmed = jobDescription.trim();
      if (trimmed.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Job description must be at least 10 characters.',
        });
      }
      if (job.jobDescription !== trimmed) shouldReparse = true;
      job.jobDescription = trimmed;
    }

    if (jobType && VALID_JOB_TYPES.includes(jobType)) {
      job.jobType = jobType;
    }

    if (location !== undefined) {
      job.location = String(location).trim();
    }

    if (applicationDeadline !== undefined) {
      job.applicationDeadline = applicationDeadline ? String(applicationDeadline).trim() : null;
    }

    if (shouldReparse) {
      job.extractedRequirements = await parseJobDescription(
        job.jobDescription,
        job.jobTitle,
        job.companyName
      );
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job description updated successfully.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job description and associated matches
 * @route   DELETE /api/jobs/:jobId
 * @access  Private
 */
const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job identifier format.',
      });
    }

    const job = await JobDescription.findOneAndDelete({
      _id: jobId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }

    // Clean up associated matches and roadmaps without touching the user's resume
    await JobMatch.deleteMany({ job: jobId, user: req.user._id });
    await LearningRoadmap.deleteMany({ job: jobId, user: req.user._id });

    return res.status(200).json({
      success: true,
      message: 'Job description and related matching data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Match active resume with a target job description
 * @route   POST /api/jobs/:jobId/match
 * @access  Private
 */
const matchJobWithResume = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job identifier format.',
      });
    }

    // 1. Verify job exists and belongs to user
    const job = await JobDescription.findOne({
      _id: jobId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }

    // 2. Verify active resume exists and is parsed
    const resume = await Resume.findOne({
      user: req.user._id,
      parsingStatus: 'completed',
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'No parsed resume found. Please upload a resume first to run job matching.',
      });
    }

    // 3. Execute matching via AI service / fallback engine
    const resumeData = {
      ...(resume.parsedData?.toObject ? resume.parsedData.toObject() : (resume.parsedData || {})),
      rawText: resume.rawText || '',
    };
    const extractedRequirements = job.extractedRequirements?.toObject
      ? job.extractedRequirements.toObject()
      : job.extractedRequirements;

    const matchData = await matchResumeToJob(
      resumeData,
      job.jobDescription,
      job.jobTitle,
      job.companyName,
      extractedRequirements
    );

    // 4. Save or update match record
    const matchRecord = await JobMatch.findOneAndUpdate(
      {
        user: req.user._id,
        resume: resume._id,
        job: job._id,
      },
      {
        user: req.user._id,
        resume: resume._id,
        job: job._id,
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        overallScore: matchData.overallScore,
        matchClassification: matchData.matchClassification,
        categoryScores: matchData.categoryScores,
        matchedSkills: matchData.matchedSkills,
        missingRequiredSkills: matchData.missingRequiredSkills,
        missingPreferredSkills: matchData.missingPreferredSkills,
        projectEvaluation: matchData.projectEvaluation,
        educationEvaluation: matchData.educationEvaluation,
        experienceEvaluation: matchData.experienceEvaluation,
        matchingExplanation: matchData.matchingExplanation,
        keyObservations: matchData.keyObservations,
        analysisProvider: matchData.analysisProvider,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Job matching evaluated successfully.',
      match: matchRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get match records for a job
 * @route   GET /api/jobs/:jobId/matches
 * @access  Private
 */
const getJobMatches = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job identifier format.',
      });
    }

    const matches = await JobMatch.find({
      job: jobId,
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  matchJobWithResume,
  getJobMatches,
};
