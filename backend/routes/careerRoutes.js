const express = require('express');
const router = express.Router();
const {
  generateCareerRecommendations,
  getSavedRecommendations,
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/recommendations')
  .post(generateCareerRecommendations)
  .get(getSavedRecommendations);

module.exports = router;
