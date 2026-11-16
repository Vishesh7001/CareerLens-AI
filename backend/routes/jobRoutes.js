const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  matchJobWithResume,
  getJobMatches,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createJob)
  .get(getJobs);

router.route('/:jobId')
  .get(getJobById)
  .put(updateJob)
  .delete(deleteJob);

router.post('/:jobId/match', matchJobWithResume);
router.get('/:jobId/matches', getJobMatches);

module.exports = router;
