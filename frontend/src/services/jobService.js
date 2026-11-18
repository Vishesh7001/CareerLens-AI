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
    // Ensure both match and matchResult are present for backwards/caller compatibility
    if (response.data && response.data.match && !response.data.matchResult) {
      response.data.matchResult = response.data.match;
    }
    return response.data;
  },

  /**
   * Run job match (alias for matchJob)
   */
  async runJobMatch(jobId) {
    return this.matchJob(jobId);
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
   * Get all roadmaps for current user, optionally filtered by role
   */
  async getRoadmaps(role = null) {
    const config = {};
    if (role && typeof role === 'string' && role.trim()) {
      config.params = { role: role.trim() };
    }
    const response = await api.get('/roadmaps', config);
    return response.data;
  },

  /**
   * Get roadmap by target role
   */
  async getRoadmapByRole(role) {
    if (!role || typeof role !== 'string') return null;
    const response = await api.get(`/roadmaps/role/${encodeURIComponent(role.trim())}`);
    return response.data;
  },

  /**
   * Generate a learning roadmap for a job or role
   */
  async createRoadmap(jobIdOrConfig, durationWeeks = 4, missingSkills = null) {
    let payload = {};

    if (typeof jobIdOrConfig === 'object' && jobIdOrConfig !== null) {
      payload = {
        durationWeeks: 4,
        ...jobIdOrConfig,
      };
    } else if (typeof jobIdOrConfig === 'string') {
      const cleanVal = jobIdOrConfig.trim();
      if (/^[0-9a-fA-F]{24}$/.test(cleanVal)) {
        payload.jobId = cleanVal;
      } else {
        payload.targetRole = cleanVal;
      }
      payload.durationWeeks = Number(durationWeeks) || 4;
      if (missingSkills) payload.missingSkills = missingSkills;
    }

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
