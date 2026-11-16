const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getCareerReadiness,
  getSkillIntelligence,
  getAnalytics,
  getRecommendations,
  getActivities,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/overview', getDashboardOverview);
router.get('/career-readiness', getCareerReadiness);
router.get('/skill-intelligence', getSkillIntelligence);
router.get('/analytics', getAnalytics);
router.get('/recommendations', getRecommendations);
router.get('/activities', getActivities);

module.exports = router;
