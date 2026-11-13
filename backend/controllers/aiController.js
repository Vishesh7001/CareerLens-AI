const { checkAiServiceHealth } = require('../services/aiService');

/**
 * @desc    Check Python FastAPI AI microservice health status
 * @route   GET /api/ai/health
 * @access  Public
 */
const getAiHealth = async (req, res, next) => {
  try {
    const healthResult = await checkAiServiceHealth();

    if (!healthResult.isHealthy) {
      return res.status(healthResult.statusCode || 503).json({
        success: false,
        status: 'unhealthy',
        message: healthResult.message || 'AI microservice is unavailable',
      });
    }

    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'AI microservice is healthy and reachable',
      aiService: healthResult.data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAiHealth,
};

