const express = require('express');
const router = express.Router();
const {
  createRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  getRoadmapByJobId,
  updateRoadmapProgress,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getUserRoadmaps)
  .post(createRoadmap);

router.route('/:roadmapId')
  .get(getRoadmapById);

router.get('/job/:jobId', getRoadmapByJobId);
router.patch('/:roadmapId/progress', updateRoadmapProgress);

module.exports = router;
