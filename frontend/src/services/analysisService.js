import api from './api';

export const PREDEFINED_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
];

export const analysisService = {
  /**
   * Run or update resume analysis
   * @param {string} resumeId
   * @param {string} targetRole
   * @param {string} [jobDescription]
   * @returns {Promise<{ success: boolean, analysis: object }>}
   */
  async runAnalysis(resumeId, targetRole, jobDescription) {
    const payload = {
      targetRole: targetRole?.trim(),
    };
    if (jobDescription && jobDescription.trim()) {
      payload.jobDescription = jobDescription.trim();
    }
    const response = await api.post(`/analysis/${resumeId}`, payload);
    return response.data;
  },

  /**
   * Fetch saved analysis for a resume
   * @param {string} resumeId
   * @param {string} [role]
   * @returns {Promise<{ success: boolean, analysis: object }>}
   */
  async getAnalysis(resumeId, role) {
    const config = {};
    if (role && role.trim()) {
      config.params = { role: role.trim() };
    }
    const response = await api.get(`/analysis/${resumeId}`, config);
    return response.data;
  },

  /**
   * Delete analysis for a resume
   * @param {string} resumeId
   * @param {string} [role]
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteAnalysis(resumeId, role) {
    const config = {};
    if (role && role.trim()) {
      config.params = { role: role.trim() };
    }
    const response = await api.delete(`/analysis/${resumeId}`, config);
    return response.data;
  },
};

export default analysisService;
