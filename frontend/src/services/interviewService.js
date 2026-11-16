import api from './api';

export const interviewService = {
  /**
   * Create a new mock interview session and generate questions
   */
  async createInterview(config) {
    const response = await api.post('/interviews', config);
    return response.data;
  },

  /**
   * Get all past interview sessions for the authenticated user
   */
  async getInterviews() {
    const response = await api.get('/interviews');
    return response.data;
  },

  /**
   * Get single interview session by ID (with progress and answers)
   */
  async getInterviewById(interviewId) {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  /**
   * Delete an interview session owned by the authenticated user
   */
  async deleteInterview(interviewId) {
    const response = await api.delete(`/interviews/${interviewId}`);
    return response.data;
  },

  /**
   * Get current active question for session
   */
  async getCurrentQuestion(interviewId) {
    const response = await api.get(`/interviews/${interviewId}/current-question`);
    return response.data;
  },

  /**
   * Save a draft answer for a question
   */
  async saveDraft(interviewId, draftAnswer, questionIndex = null) {
    const payload = { draftAnswer };
    if (typeof questionIndex === 'number') {
      payload.questionIndex = questionIndex;
    }
    const response = await api.patch(`/interviews/${interviewId}/draft`, payload);
    return response.data;
  },

  /**
   * Submit an answer and trigger evaluation
   */
  async submitAnswer(interviewId, answer, questionIndex = null) {
    const payload = { answer };
    if (typeof questionIndex === 'number') {
      payload.questionIndex = questionIndex;
    }
    const response = await api.post(`/interviews/${interviewId}/answer`, payload);
    return response.data;
  },

  /**
   * Retry evaluating an already submitted answer
   */
  async retryEvaluation(interviewId, questionIndex = null) {
    const payload = {};
    if (typeof questionIndex === 'number') {
      payload.questionIndex = questionIndex;
    }
    const response = await api.post(`/interviews/${interviewId}/retry-evaluation`, payload);
    return response.data;
  },

  /**
   * Advance to the next question in sequence
   */
  async nextQuestion(interviewId) {
    const response = await api.post(`/interviews/${interviewId}/next`);
    return response.data;
  },

  /**
   * Complete interview session and generate final performance report
   */
  async completeInterview(interviewId) {
    const response = await api.post(`/interviews/${interviewId}/complete`);
    return response.data;
  },

  /**
   * Get final performance report for completed interview
   */
  async getInterviewReport(interviewId) {
    const response = await api.get(`/interviews/${interviewId}/report`);
    return response.data;
  },
};

export default interviewService;
