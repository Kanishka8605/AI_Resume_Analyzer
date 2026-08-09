import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import ProgressBar from '../components/ProgressBar';
import ScoreChart from '../components/ScoreChart';
import AIChatBot from '../components/AIChatBot';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Info,
  BadgeAlert,
  FileText,
  Clock,
  Bot,
  BarChart3,
  Target
} from 'lucide-react';

const Dashboard = () => {
  const { analysisResult, clearCurrentAnalysis } = useAnalysis();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bot'

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
    createdAt,
    text: resumeText
  } = analysisResult;

  const handleNewScan = () => {
    clearCurrentAnalysis();
    navigate('/');
  };

  const getSeverityColor = (sev) => {
    switch ((sev || '').toLowerCase()) {
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
            <span>Analyzed {createdAt ? new Date(createdAt).toLocaleDateString() : 'Just now'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="text-indigo-400" />
            {fileName || 'Resume Analysis'}
          </h1>
          {targetRole && (
            <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
              <Target size={14} className="text-indigo-400" />
              <span>Target Role:</span>
              <span className="text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                {targetRole}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewScan}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 size={18} />
          <span>Full Analysis Report</span>
        </button>

        <button
          onClick={() => setActiveTab('bot')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'bot'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot size={18} className="text-indigo-400" />
          <span>Interactive AI Bot Coach</span>
          <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full">
            Live
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DETAILED REPORT */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
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
                Overall score combines structural formatting rules (ATS) with role-specific keyword density and bullet point impact.
              </div>
            </div>

            {/* Section Audit Chart Card */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <BadgeAlert size={18} className="text-indigo-400" />
                  Structural Header Diagnostic
                </h2>
                <p className="text-slate-400 text-xs mb-4">
                  ATS parsers filter candidate resumes by section headers. Hover or tap bars to review section presence.
                </p>
              </div>
              <ScoreChart sections={sections} />
            </div>

          </div>

          {/* Quick Banner: Open Interactive AI Bot */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-xl text-white shrink-0 shadow-lg shadow-indigo-600/30">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Need tailored bullet rewrites or interview preparation?</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Chat directly with our AI Assistant Bot trained specifically on your uploaded resume for {targetRole || 'your target position'}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('bot')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Bot size={16} />
              <span>Launch AI Bot Assistant</span>
            </button>
          </div>

          {/* Grid: Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Strengths Card */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-400" />
                Individual Strengths Detected
              </h2>
              <ul className="space-y-3">
                {strengths && strengths.map((str, idx) => (
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
                {weaknesses && weaknesses.map((weak, idx) => (
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
              Missing High-Impact Keywords ({targetRole || 'General'})
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              ATS parsers rank applicants by keyword frequency matching the job description. Incorporate these recommended skills into your project descriptions:
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
                No critical missing keywords detected. Excellent match for {targetRole || 'the role'}!
              </p>
            )}
          </div>

          {/* Panel: Actionable Recommendations */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" />
                Actionable Tailoring Steps
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Prioritized recommendations based on analyzing your actual resume text and target role requirements.
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
      )}

      {/* TAB 2: INTERACTIVE AI CHATBOT ASSISTANT */}
      {activeTab === 'bot' && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="text-indigo-400" size={22} />
              Interactive AI Career Coach Assistant
            </h2>
            <p className="text-slate-400 text-xs">
              Ask questions about your uploaded resume, get personalized bullet point rewrites, practice interview questions, or draft cover letter intros tailored for {targetRole || 'your target role'}.
            </p>
          </div>

          <AIChatBot resumeText={resumeText} targetRole={targetRole} />
        </div>
      )}

    </div>
  );
};

export default Dashboard;
