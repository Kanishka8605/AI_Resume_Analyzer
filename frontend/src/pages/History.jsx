import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import { FileText, Eye, AlertCircle, Calendar, Target, Loader2 } from 'lucide-react';

const History = () => {
  const { history, fetchHistory, loadAnalysis, isLoading } = useAnalysis();
  const [fetching, setFetching] = useState(true);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInit = async () => {
      setLocalError('');
      try {
        await fetchHistory();
      } catch (err) {
        setLocalError('Failed to load past analyses history.');
      } finally {
        setFetching(false);
      }
    };
    fetchInit();
  }, []);

  const handleSelectRecord = async (id) => {
    try {
      await loadAnalysis(id);
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Could not load details for that analysis record.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-accent-green';
    if (score >= 60) return 'text-accent-orange';
    return 'text-accent-red';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Scan History
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review and compare your previously scanned resumes and compatibility scores.
        </p>
      </div>

      {localError && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{localError}</span>
        </div>
      )}

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={36} className="text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm">Retrieving history history logs...</p>
        </div>
      ) : history && history.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              
              {/* File details info */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <FileText size={24} />
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-bold text-white text-base truncate max-w-sm">
                    {record.fileName || 'Unnamed File'}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Target size={12} className="text-indigo-400" />
                      {record.targetRole || 'General Professional'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-indigo-400" />
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scores display */}
              <div className="flex items-center justify-between md:justify-end gap-8 border-t border-slate-800 md:border-none pt-4 md:pt-0">
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall</p>
                    <p className={`text-xl font-extrabold ${getScoreColor(record.overallScore)}`}>
                      {record.overallScore}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-slate-800"></div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ATS Match</p>
                    <p className={`text-xl font-extrabold ${getScoreColor(record.atsScore)}`}>
                      {record.atsScore}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectRecord(record.id)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Eye size={14} />
                  <span>Report</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-2xl border-slate-800/80">
          <div className="p-4 bg-slate-800 rounded-full w-fit mx-auto text-slate-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-white">No scans yet</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Scan your first resume to see history, scores, and recommendations logs here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            Go Upload Resume
          </button>
        </div>
      )}

    </div>
  );
};

export default History;
