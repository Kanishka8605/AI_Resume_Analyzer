import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds because AI analysis can take time
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  /**
   * Uploads a resume file and parses/analyzes it
   * @param {File} file 
   * @param {string} targetRole 
   */
  uploadResume: async (file, targetRole) => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) {
      formData.append('targetRole', targetRole);
    }
    
    const response = await apiClient.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Evaluates raw resume text
   * @param {string} text 
   * @param {string} targetRole 
   */
  analyzeRawText: async (text, targetRole) => {
    const response = await apiClient.post('/resume/analyze', {
      text,
      targetRole
    });
    return response.data;
  },

  /**
   * Fetches analysis history
   */
  getHistory: async () => {
    const response = await apiClient.get('/resume/history');
    return response.data;
  },

  /**
   * Fetches single analysis details
   * @param {string} id 
   */
  getAnalysisById: async (id) => {
    const response = await apiClient.get(`/resume/analysis/${id}`);
    return response.data;
  }
};

export default apiClient;
