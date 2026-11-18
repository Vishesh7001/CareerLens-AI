const app = require('../app');
const { connectDB } = require('../config/db');

/**
 * Vercel Serverless Function entry point for CareerLens AI Express backend
 *
 * Ensures the cached MongoDB connection is active and ready before handing
 * execution over to the Express application.
 */
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless Entry] Database connection failed:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please retry in a few moments.',
    });
  }

  return app(req, res);
};
