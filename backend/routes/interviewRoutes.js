const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// All interview endpoints require authenticated session
router.use(protect);

router.route('/')
  .post(createInterview)
  .get(getUserInterviews);

router.route('/:interviewId')
  .get(getInterviewById)
  .delete(deleteInterview);

router.get('/:interviewId/current-question', getCurrentQuestion);
router.patch('/:interviewId/draft', saveDraftAnswer);
router.post('/:interviewId/answer', submitAnswer);
router.post('/:interviewId/retry-evaluation', retryEvaluation);
router.post('/:interviewId/next', nextQuestion);
router.post('/:interviewId/complete', completeInterview);
router.get('/:interviewId/report', getInterviewReport);

module.exports = router;
