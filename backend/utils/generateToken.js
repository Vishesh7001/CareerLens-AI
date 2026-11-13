const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a given user ID
 * @param {string} userId - User ID
 * @param {string|number} expiresIn - Expiry string or number of days
 * @returns {string} Signed JWT
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

/**
 * Configure cookie options based on environment
 * @param {boolean} rememberMe - Whether extended cookie lifetime is requested
 * @returns {object} Express cookie options
 */
const getCookieOptions = (rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const durationMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 7 * 24 * 60 * 60 * 1000;  // 7 days

  return {
    httpOnly: true, // Prevents XSS access to cookie
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // CSRF protection
    maxAge: durationMs,
    path: '/',
  };
};

/**
 * Set authentication token as HTTP-only cookie
 * @param {object} res - Express response object
 * @param {string} token - JWT
 * @param {boolean} rememberMe - Extended duration flag
 */
const setAuthCookie = (res, token, rememberMe = false) => {
  const options = getCookieOptions(rememberMe);
  res.cookie('token', token, options);
};

/**
 * Clear authentication token cookie
 * @param {object} res - Express response object
 */
const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = {
  generateToken,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};

