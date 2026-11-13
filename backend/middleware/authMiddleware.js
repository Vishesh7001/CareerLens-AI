const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verifies JWT from HTTP-only cookie or Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Try to read token from HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback: try to read token from Authorization header (Bearer <token>)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token found. Please log in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Fetch user without password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User belonging to this token no longer exists.',
      });
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token verification failed.',
    });
  }
};

module.exports = { protect };

