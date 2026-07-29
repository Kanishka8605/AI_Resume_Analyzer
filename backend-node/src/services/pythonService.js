const axios = require('axios');
const FormData = require('form-data');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonService = {
  /**
   * Forwards resume file to Python FastAPI service for text extraction.
   * @param {Buffer} fileBuffer 
   * @param {string} originalname 
   * @param {string} mimetype 
   */
  parseFile: async (fileBuffer, originalname, mimetype) => {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: originalname,
        contentType: mimetype
      });

      const response = await axios.post(`${PYTHON_SERVICE_URL}/parse`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message;
      console.error(`Error from Python parsing service: ${errMsg}`);
      throw new Error(errMsg);
    }
  },

  /**
   * Forwards raw text and target job role to Python FastAPI service for grading and critique.
   * @param {string} resumeText 
   * @param {string} targetRole 
   */
  analyzeText: async (resumeText, targetRole) => {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze`, {
        resumeText,
        targetRole
      });
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message;
      console.error(`Error from Python analysis service: ${errMsg}`);
      throw new Error(errMsg);
    }
  }
};

module.exports = pythonService;
