const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResume,
  downloadResume,
  deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { handleResumeUpload } = require('../middleware/uploadMiddleware');

// All resume routes require authentication
router.use(protect);

// Get current user's resume or delete it
router.route('/')
  .get(getResume)
  .delete(deleteResume);

// Upload new or replacement resume
router.post('/upload', handleResumeUpload, uploadResume);

// Download current user's uploaded resume PDF
router.get('/download', downloadResume);

module.exports = router;
