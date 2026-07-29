import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import ProgressBar from '../components/ProgressBar';
import ScoreChart from '../components/ScoreChart';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Info,
  BadgeAlert,
  FileText,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { analysisResult, clearCurrentAnalysis } = useAnalysis();
  const navigate = useNavigate();

  // Redirect to upload if there is no analysis in state
  React.useEffect(() => {
    if (!analysisResult) {
      navigate('/');
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) return null;

  const {
    overallScore,
    atsScore,
    sections,
    strengths,
    weaknesses,
    missingKeywords,
    recommendations,
    fileName,
    targetRole,
    createdAt
  } = analysisResult;

  const handleNewScan = () => {
    clearCurrentAnalysis();
    navigate('/');
  };

  const getSeverityColor = (sev) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock size={14} />
            <span>Analyzed {new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="text-indigo-400" />
            {fileName || 'Resume Analysis'}
          </h1>
          {targetRole && (
            <p className="text-slate-400 text-sm">
              Target Position: <span className="text-indigo-400 font-semibold">{targetRole}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleNewScan}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={16} />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Grid: 2 columns top (Scores + Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scores Card */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-center items-center">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 self-start">
            <Sparkles size={18} className="text-indigo-400" />
            Compatibility Scores
          </h2>
          <div className="flex flex-row gap-8 items-center justify-center py-4">
            <ProgressBar value={overallScore} label="Overall" size={140} />
            <ProgressBar value={atsScore} label="ATS Match" size={140} />
          </div>
          <div className="mt-6 text-xs text-slate-400 max-w-xs text-center leading-relaxed">
            Overall score blends structural rules (ATS) with qualitative content checks (AI review).
          </div>
        </div>

        {/* Section Audit Chart Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BadgeAlert size={18} className="text-indigo-400" />
              Structural Header Check
            </h2>
            <p className="text-slate-400 text-xs mb-4">
              ATS systems scan headers. Missing section names reduce grading. Hover bars to see detailed diagnostics.
            </p>
          </div>
          <ScoreChart sections={sections} />
        </div>

      </div>

      {/* Grid: Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Strengths Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" />
            Key Strengths
          </h2>
          <ul className="space-y-3">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 select-none font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" />
            Areas for Improvement
          </h2>
          <ul className="space-y-3">
            {weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-amber-400 select-none font-bold mt-0.5">!</span>
                <span className="leading-relaxed">{weak}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Row: Missing Keywords */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Info size={18} className="text-indigo-400" />
          Recommended Missing Keywords
        </h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          ATS parses files looking for exact keywords. Consider weaving these skills and terminologies naturally into your project or work history descriptions:
        </p>
        
        {missingKeywords && missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-2">
            {missingKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-slate-800 text-indigo-300 border border-slate-700/60 rounded-lg text-xs font-semibold hover:border-indigo-500/40 hover:text-indigo-200 transition-colors"
              >
                + {kw}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic pt-2">
            No missing keywords detected. Great job matching the requirements!
          </p>
        )}
      </div>

      {/* Panel: Actionable Recommendations */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-400" />
            Actionable Recommendations
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Prioritized actions to improve your ATS score and impress hiring managers.
          </p>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 bg-slate-850/40 border border-slate-850 rounded-xl hover:bg-slate-850/70 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {rec.category}
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {rec.message}
                  </p>
                </div>
                
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide self-start shrink-0 ${getSeverityColor(
                    rec.severity
                  )}`}
                >
                  {rec.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No recommendations found.</p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
