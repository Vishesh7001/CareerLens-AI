const mongoose = require('mongoose');
const LearningRoadmap = require('../models/LearningRoadmap');
const JobDescription = require('../models/JobDescription');
const Resume = require('../models/Resume');
const { generateLearningRoadmap } = require('../services/aiService');

const escapeRegex = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Generate or update a personalized learning roadmap for a job or role
 * @route   POST /api/roadmaps
 * @access  Private
 */
const createRoadmap = async (req, res, next) => {
  try {
    const { jobId, targetRole, role, durationWeeks = 4, missingSkills } = req.body;

    const resume = await Resume.findOne({
      user: req.user._id,
      parsingStatus: 'completed',
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'No parsed resume found. Please upload a resume first.',
      });
    }

    let job = null;
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid job identifier is required to generate a learning roadmap.',
        });
      }
      job = await JobDescription.findOne({ _id: jobId, user: req.user._id });
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job description not found.',
        });
      }
    }

    const requestedRole = (targetRole || role || '').trim();

    if (!job && !requestedRole) {
      return res.status(400).json({
        success: false,
        message: 'Valid job identifier or target role is required to generate a learning roadmap.',
      });
    }

    const effectiveRole = requestedRole || job?.jobTitle || 'Software Engineer';

    // If job was not explicitly passed, see if user has an existing JobDescription for this role
    if (!job && effectiveRole) {
      job = await JobDescription.findOne({
        user: req.user._id,
        jobTitle: new RegExp(`^${escapeRegex(effectiveRole)}$`, 'i'),
      });
    }

    const jobTitle = effectiveRole;
    const companyName = job?.companyName || null;
    const jobDescription =
      job?.jobDescription ||
      `Standard professional curriculum, industry qualifications, and core engineering requirements for ${jobTitle}.`;

    const aiResult = await generateLearningRoadmap(
      resume.parsedData,
      jobDescription,
      jobTitle,
      companyName,
      missingSkills || null,
      Number(durationWeeks) || 4
    );

    // Upsert isolation query:
    // If effectiveRole is present, isolate by user + targetRole
    // Otherwise isolate by user + job
    const isolationQuery = {
      user: req.user._id,
      ...(effectiveRole
        ? { targetRole: new RegExp(`^${escapeRegex(effectiveRole)}$`, 'i') }
        : { job: job._id }),
    };

    const roadmap = await LearningRoadmap.findOneAndUpdate(
      isolationQuery,
      {
        user: req.user._id,
        resume: resume._id,
        job: job ? job._id : null,
        title: aiResult.title || `Personalized Learning Roadmap for ${jobTitle}`,
        targetRole: effectiveRole,
        companyName: companyName,
        summary: aiResult.summary || '',
        totalWeeks: aiResult.totalWeeks || 4,
        items: aiResult.items || [],
        progressPercentage: 0,
        analysisProvider: aiResult.analysisProvider || 'rule-based-fallback',
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Personalized learning roadmap generated successfully.',
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all roadmaps for current user, or filter by role
 * @route   GET /api/roadmaps
 * @access  Private
 */
const getUserRoadmaps = async (req, res, next) => {
  try {
    const { role, targetRole } = req.query;
    const filter = { user: req.user._id };

    const requestedRole = (role || targetRole || '').trim();
    if (requestedRole) {
      filter.targetRole = new RegExp(`^${escapeRegex(requestedRole)}$`, 'i');
    }

    const roadmaps = await LearningRoadmap.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: roadmaps.length,
      roadmaps,
      roadmap: roadmaps[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get roadmap by Target Role
 * @route   GET /api/roadmaps/role/:role
 * @access  Private
 */
const getRoadmapByRole = async (req, res, next) => {
  try {
    const { role } = req.params;

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid target role parameter is required.',
      });
    }

    const cleanRole = role.trim();
    const roadmap = await LearningRoadmap.findOne({
      user: req.user._id,
      targetRole: new RegExp(`^${escapeRegex(cleanRole)}$`, 'i'),
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: `No learning roadmap found for role ${cleanRole}.`,
      });
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get roadmap by its ID
 * @route   GET /api/roadmaps/:roadmapId
 * @access  Private
 */
const getRoadmapById = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;

    if (!roadmapId || !mongoose.Types.ObjectId.isValid(roadmapId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid roadmap identifier format.',
      });
    }

    const roadmap = await LearningRoadmap.findOne({
      _id: roadmapId,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Learning roadmap not found.',
      });
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get roadmap by Job ID
 * @route   GET /api/roadmaps/job/:jobId
 * @access  Private
 */
const getRoadmapByJobId = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job identifier format.',
      });
    }

    const roadmap = await LearningRoadmap.findOne({
      job: jobId,
      user: req.user._id,
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'No learning roadmap found for this job.',
      });
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update progress of a learning roadmap item
 * @route   PATCH /api/roadmaps/:roadmapId/progress
 * @access  Private
 */
const updateRoadmapProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const { weekNumber, completed } = req.body;

    if (!roadmapId || !mongoose.Types.ObjectId.isValid(roadmapId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid roadmap identifier format.',
      });
    }

    const weekNum = Number(weekNumber);
    if (weekNumber === undefined || isNaN(weekNum)) {
      return res.status(400).json({
        success: false,
        message: 'Valid weekNumber (number) is required.',
      });
    }

    // Authenticated user isolation
    const roadmap = await LearningRoadmap.findOne({
      _id: roadmapId,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Learning roadmap not found.',
      });
    }

    // Find and update item
    const targetItem = roadmap.items.find((it) => it.weekNumber === weekNum);
    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: `Roadmap week ${weekNum} not found.`,
      });
    }

    targetItem.completed = Boolean(completed);
    targetItem.completedAt = targetItem.completed ? new Date() : null;

    // Recalculate overall progress dynamically:
    // 0 completed = 0%, 1 completed = 25%, 2 completed = 50%, 3 completed = 75%, 4 completed = 100%
    const totalWeeks = roadmap.items.length || roadmap.totalWeeks || 4;
    const completedCount = roadmap.items.filter((it) => it.completed).length;
    roadmap.progressPercentage = Math.round((completedCount / Math.max(1, totalWeeks)) * 100);

    roadmap.markModified('items');
    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: 'Roadmap progress updated.',
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  getRoadmapByRole,
  getRoadmapByJobId,
  updateRoadmapProgress,
};
