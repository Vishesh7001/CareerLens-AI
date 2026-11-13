const express = require('express');
const router = express.Router();
const { getAiHealth } = require('../controllers/aiController');

// GET /api/ai/health
router.get('/health', getAiHealth);

module.exports = router;

