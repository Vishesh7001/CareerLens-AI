import api from './api';

export const resumeService = {
  /**
   * Upload a PDF resume file with upload progress tracking
   * @param {File} file - PDF file to upload
   * @param {Function} [onUploadProgress] - Axios progress callback (event)
   * @returns {Promise<{ success: boolean, message: string, resume: object }>}
   */
  async uploadResume(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  /**
   * Fetch the current authenticated user's active resume and parsed data
   * @returns {Promise<{ success: boolean, resume: object | null }>}
   */
  async getResume() {
    const response = await api.get('/resumes');
    return response.data;
  },

  /**
   * Download the stored resume PDF file
   * @param {string} [fallbackFilename='resume.pdf']
   * @returns {Promise<{ success: boolean, filename: string }>}
   */
  async downloadResume(fallbackFilename = 'resume.pdf') {
    const response = await api.get('/resumes/download', {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header if available
    let filename = fallbackFilename;
    const disposition =
      response.headers['content-disposition'] ||
      (typeof response.headers?.get === 'function' && response.headers.get('content-disposition'));

    if (disposition) {
      const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
      }
    }

    // Trigger browser file download via Blob URL
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  },

  /**
   * Delete the authenticated user's resume record and stored file
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteResume() {
    const response = await api.delete('/resumes');
    return response.data;
  },
};

export default resumeService;
