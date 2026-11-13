/**
 * AI Service Communication Layer
 * Connects Node.js Express backend to Python FastAPI AI microservice
 */

const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8000';
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Get normalized base URL for the FastAPI AI microservice
 * @returns {string} Clean base URL without trailing slashes
 */
const getAiServiceBaseUrl = () => {
  const url = process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL;
  return url.trim().replace(/\/+$/, '');
};

/**
 * Check health status of Python FastAPI microservice
 * @param {object} [options]
 * @param {number} [options.timeoutMs=5000] - Request timeout in milliseconds
 * @param {string} [options.overrideUrl] - Optional URL override for testing unreachable endpoints
 * @returns {Promise<{isHealthy: boolean, statusCode: number, data?: object, message?: string}>}
 */
const checkAiServiceHealth = async (options = {}) => {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const baseUrl = options.overrideUrl || getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/health`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-2xx HTTP responses from FastAPI
    if (!response.ok) {
      return {
        isHealthy: false,
        statusCode: 502, // Bad Gateway (upstream service returned error)
        message: `AI microservice returned an error status (${response.status})`,
      };
    }

    // Parse and validate JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      return {
        isHealthy: false,
        statusCode: 502,
        message: 'Invalid JSON response received from AI microservice',
      };
    }

    // Verify expected payload schema
    if (!data || typeof data !== 'object' || data.status !== 'healthy') {
      return {
        isHealthy: false,
        statusCode: 502,
        message: 'AI microservice reported an unhealthy status',
        data,
      };
    }

    return {
      isHealthy: true,
      statusCode: 200,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Timeout triggered by AbortController
    if (error.name === 'AbortError' || error.type === 'aborted') {
      return {
        isHealthy: false,
        statusCode: 504, // Gateway Timeout
        message: `AI microservice request timed out after ${timeoutMs}ms`,
      };
    }

    // Connection refused, unreachable host, or general network error
    return {
      isHealthy: false,
      statusCode: 503, // Service Unavailable
      message: 'AI microservice is unavailable or unreachable',
    };
  }
};

module.exports = {
  checkAiServiceHealth,
  getAiServiceBaseUrl,
};

