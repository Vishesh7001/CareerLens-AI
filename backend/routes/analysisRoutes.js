const express = require('express');
const router = express.Router();
const {
  createOrRunAnalysis,
  getAnalysisByResumeId,
  deleteAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

// All analysis routes require authentication
router.use(protect);

router.route('/:resumeId')
  .post(createOrRunAnalysis)
  .get(getAnalysisByResumeId)
  .delete(deleteAnalysis);

module.exports = router;
