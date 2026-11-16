const User = require('../models/User');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const JobDescription = require('../models/JobDescription');
const JobMatch = require('../models/JobMatch');
const LearningRoadmap = require('../models/LearningRoadmap');
const InterviewSession = require('../models/InterviewSession');
const Notification = require('../models/Notification');
const { calculateCareerReadiness } = require('../services/careerReadinessService');
const {
  aggregateSkillIntelligence,
  generatePersonalizedRecommendations,
  aggregateAnalyticsHistory,
  aggregateRecentActivities,
} = require('../services/dashboardService');

/**
 * Fetch all underlying data for a user in parallel
 */
const fetchUserDataSources = async (userId) => {
  const [
    user,
    resume,
    latestResumeAnalysis,
    resumeAnalyses,
    jobMatches,
    jobDescriptions,
    roadmaps,
    interviews,
    unreadNotificationsCount,
  ] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Resume.findOne({ user: userId }).lean(),
    ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    ResumeAnalysis.find({ user: userId }).sort({ createdAt: 1 }).lean(),
    JobMatch.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    JobDescription.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    LearningRoadmap.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    InterviewSession.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    user,
    resume,
    latestResumeAnalysis,
    resumeAnalyses,
    jobMatches,
    jobDescriptions,
    roadmaps,
    interviews,
    unreadNotificationsCount,
  };
};

/**
 * @desc    Get complete dashboard overview with KPIs, career readiness, and recommendations
 * @route   GET /api/dashboard/overview
 * @access  Private
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await fetchUserDataSources(req.user._id);

    // 1. Calculate Career Readiness Score
    const careerReadiness = calculateCareerReadiness({
      latestResumeAnalysis: data.latestResumeAnalysis,
      jobMatches: data.jobMatches,
      resume: data.resume,
      roadmaps: data.roadmaps,
      interviews: data.interviews,
    });

    // 2. High-level Statistics
    const completedInterviews = data.interviews.filter(
      (i) => i.status === 'completed' && typeof i.overallScore === 'number'
    );
    const avgInterviewScore =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce((acc, i) => acc + i.overallScore, 0) /
              completedInterviews.length
          )
        : null;

    let totalRoadmapItems = 0;
    let completedRoadmapItems = 0;
    data.roadmaps.forEach((rm) => {
      (rm.items || []).forEach((item) => {
        totalRoadmapItems += 1;
        if (item.completed) completedRoadmapItems += 1;
      });
    });
    const roadmapProgressPercentage =
      totalRoadmapItems > 0 ? Math.round((completedRoadmapItems / totalRoadmapItems) * 100) : 0;

    const stats = {
      totalResumes: data.resume ? 1 : 0,
      hasResume: Boolean(data.resume),
      resumeFileName: data.resume?.originalFileName || null,
      totalJobMatches: data.jobMatches.length,
      totalSavedJobs: data.jobDescriptions.length,
      totalInterviews: data.interviews.length,
      completedInterviews: completedInterviews.length,
      averageInterviewScore: avgInterviewScore,
      latestInterviewScore: completedInterviews[0]?.overallScore ?? null,
      latestInterviewRole: completedInterviews[0]?.role ?? null,
      roadmapProgress: roadmapProgressPercentage,
      totalRoadmapModules: totalRoadmapItems,
      completedRoadmapModules: completedRoadmapItems,
      latestResumeScore: data.latestResumeAnalysis?.overallScore ?? null,
      latestResumeTargetRole: data.latestResumeAnalysis?.targetRole ?? null,
    };

    // 3. Recent Activities & Recommendations
    const recentActivities = aggregateRecentActivities({
      resume: data.resume,
      resumeAnalyses: data.resumeAnalyses,
      jobMatches: data.jobMatches,
      roadmaps: data.roadmaps,
      interviews: data.interviews,
    }).slice(0, 6);

    const recommendations = generatePersonalizedRecommendations({
      user: data.user,
      resume: data.resume,
      latestResumeAnalysis: data.latestResumeAnalysis,
      jobMatches: data.jobMatches,
      roadmaps: data.roadmaps,
      interviews: data.interviews,
    }).slice(0, 4);

    return res.status(200).json({
      success: true,
      user: data.user,
      stats,
      careerReadiness,
      recentActivities,
      recommendations,
      unreadNotificationsCount: data.unreadNotificationsCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed Career Readiness calculation and weight breakdown
 * @route   GET /api/dashboard/career-readiness
 * @access  Private
 */
const getCareerReadiness = async (req, res, next) => {
  try {
    const data = await fetchUserDataSources(req.user._id);

    const readiness = calculateCareerReadiness({
      latestResumeAnalysis: data.latestResumeAnalysis,
      jobMatches: data.jobMatches,
      resume: data.resume,
      roadmaps: data.roadmaps,
      interviews: data.interviews,
    });

    return res.status(200).json({
      success: true,
      careerReadiness: readiness,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unified skill intelligence across all phases
 * @route   GET /api/dashboard/skill-intelligence
 * @access  Private
 */
const getSkillIntelligence = async (req, res, next) => {
  try {
    const data = await fetchUserDataSources(req.user._id);

    const skillsData = aggregateSkillIntelligence({
      resume: data.resume,
      latestResumeAnalysis: data.latestResumeAnalysis,
      jobMatches: data.jobMatches,
      jobDescriptions: data.jobDescriptions,
      interviews: data.interviews,
      roadmaps: data.roadmaps,
    });

    return res.status(200).json({
      success: true,
      skills: skillsData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get time-series historical analytics for progress charts
 * @route   GET /api/dashboard/analytics
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const data = await fetchUserDataSources(req.user._id);

    const analytics = aggregateAnalyticsHistory({
      resumeAnalyses: data.resumeAnalyses,
      jobMatches: data.jobMatches,
      interviews: data.interviews,
      roadmaps: data.roadmaps,
    });

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized career recommendations
 * @route   GET /api/dashboard/recommendations
 * @access  Private
 */
const getRecommendations = async (req, res, next) => {
  try {
    const data = await fetchUserDataSources(req.user._id);

    const recommendations = generatePersonalizedRecommendations({
      user: data.user,
      resume: data.resume,
      latestResumeAnalysis: data.latestResumeAnalysis,
      jobMatches: data.jobMatches,
      roadmaps: data.roadmaps,
      interviews: data.interviews,
    });

    return res.status(200).json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chronological user activity feed
 * @route   GET /api/dashboard/activities
 * @access  Private
 */
const getActivities = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const data = await fetchUserDataSources(req.user._id);

    const activities = aggregateRecentActivities({
      resume: data.resume,
      resumeAnalyses: data.resumeAnalyses,
      jobMatches: data.jobMatches,
      roadmaps: data.roadmaps,
      interviews: data.interviews,
    }).slice(0, limit);

    return res.status(200).json({
      success: true,
      activities,
      count: activities.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getCareerReadiness,
  getSkillIntelligence,
  getAnalytics,
  getRecommendations,
  getActivities,
};
