const express = require('express');
const router = express.Router();
const {
  createRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  getRoadmapByRole,
  getRoadmapByJobId,
  updateRoadmapProgress,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getUserRoadmaps)
  .post(createRoadmap);

router.get('/role/:role', getRoadmapByRole);
router.get('/job/:jobId', getRoadmapByJobId);
router.patch('/:roadmapId/progress', updateRoadmapProgress);

router.route('/:roadmapId')
  .get(getRoadmapById);

module.exports = router;
