const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Public auth routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected session check
router.get('/me', protect, getMe);

// Logout route
router.post('/logout', logout);

module.exports = router;

