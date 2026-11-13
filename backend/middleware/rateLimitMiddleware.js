const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication routes (login, register)
 * Protects against brute-force and credential-stuffing attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs (sufficient for development/production)
  standardHeaders: true, // Return standard rate limit info in headers `RateLimit-*`
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

module.exports = { authLimiter };

