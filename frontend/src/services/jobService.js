import api from './api';

export const jobService = {
  /**
   * Get all saved jobs for current user
   */
  async getJobs() {
    const response = await api.get('/jobs');
    return response.data;
  },

  /**
   * Get single job by ID
   */
  async getJobById(jobId) {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Create a new job description
   */
  async createJob(jobData) {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  /**
   * Update an existing job description
   */
  async updateJob(jobId, jobData) {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  /**
   * Delete a job description
   */
  async deleteJob(jobId) {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Match active resume with a target job description
   */
  async matchJob(jobId) {
    const response = await api.post(`/jobs/${jobId}/match`);
    return response.data;
  },

  /**
   * Get saved match records for a job
   */
  async getJobMatches(jobId) {
    const response = await api.get(`/jobs/${jobId}/matches`);
    return response.data;
  },

  /**
   * Generate or refresh career recommendations
   */
  async generateCareerRecommendations(jobId, targetRole) {
    const payload = {};
    if (jobId) payload.jobId = jobId;
    if (targetRole) payload.targetRole = targetRole;
    const response = await api.post('/career/recommendations', payload);
    return response.data;
  },

  /**
   * Get latest saved career recommendations
   */
  async getSavedCareerRecommendations() {
    const response = await api.get('/career/recommendations');
    return response.data;
  },

  /**
   * Get all roadmaps for current user
   */
  async getRoadmaps() {
    const response = await api.get('/roadmaps');
    return response.data;
  },

  /**
   * Generate a learning roadmap for a job
   */
  async createRoadmap(jobId, durationWeeks = 4, missingSkills = null) {
    const payload = {
      jobId,
      durationWeeks: Number(durationWeeks) || 4,
    };
    if (missingSkills) payload.missingSkills = missingSkills;
    const response = await api.post('/roadmaps', payload);
    return response.data;
  },

  /**
   * Get roadmap by ID
   */
  async getRoadmapById(roadmapId) {
    const response = await api.get(`/roadmaps/${roadmapId}`);
    return response.data;
  },

  /**
   * Get roadmap by Job ID
   */
  async getRoadmapByJobId(jobId) {
    const response = await api.get(`/roadmaps/job/${jobId}`);
    return response.data;
  },

  /**
   * Toggle completion of a week's learning item
   */
  async updateRoadmapProgress(roadmapId, weekNumber, completed) {
    const response = await api.patch(`/roadmaps/${roadmapId}/progress`, {
      weekNumber: Number(weekNumber),
      completed: Boolean(completed),
    });
    return response.data;
  },
};

export default jobService;
