import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch analysis history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await apiService.getHistory();
      if (response.success) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    }
  };

  const uploadResume = async (file, targetRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.uploadResume(file, targetRole);
      if (response.success) {
        setAnalysisResult(response.data);
        // Refresh history
        await fetchHistory();
        return response.data;
      } else {
        throw new Error(response.error || 'Upload failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'An error occurred during upload.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeRawText = async (text, targetRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.analyzeRawText(text, targetRole);
      if (response.success) {
        setAnalysisResult(response.data);
        await fetchHistory();
        return response.data;
      } else {
        throw new Error(response.error || 'Analysis failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'An error occurred during analysis.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysis = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getAnalysisById(id);
      if (response.success) {
        setAnalysisResult(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Record not found.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load analysis details.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCurrentAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysisResult,
        history,
        isLoading,
        error,
        uploadResume,
        analyzeRawText,
        loadAnalysis,
        clearCurrentAnalysis,
        fetchHistory
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};
