import api from './api';

const dashboardService = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  getCareerReadiness: async () => {
    const response = await api.get('/dashboard/career-readiness');
    return response.data;
  },

  getSkillIntelligence: async () => {
    const response = await api.get('/dashboard/skill-intelligence');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/dashboard/recommendations');
    return response.data;
  },

  getActivities: async (limit = 15) => {
    const response = await api.get(`/dashboard/activities?limit=${limit}`);
    return response.data;
  },
};

export default dashboardService;
