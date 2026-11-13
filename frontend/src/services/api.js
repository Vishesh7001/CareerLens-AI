import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables HTTP-only cookies to be sent and received
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a structured message, use it; otherwise provide a standard fallback
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? error.response.data.errors.join(', ')
        : 'A network or server error occurred. Please try again.');

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
      original: error,
    });
  }
);

export default api;

