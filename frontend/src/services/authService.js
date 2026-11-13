import api from './api';

export const authService = {
  /**
   * Register a new user account
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Log in user
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current authenticated user session (checks cookie)
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out user and clear cookie
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get user profile details
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update full name
   */
  async updateProfile(data) {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

export default authService;

