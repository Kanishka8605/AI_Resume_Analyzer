import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import UploadBox from '../components/UploadBox';
import { Sparkles, FileText, BarChart2, ShieldAlert } from 'lucide-react';

const Upload = () => {
  const { uploadResume, isLoading, error } = useAnalysis();
  const navigate = useNavigate();

  const handleUploadSubmit = async (file, targetRole) => {
    try {
      await uploadResume(file, targetRole);
      navigate('/dashboard');
    } catch (err) {
      console.error('Upload failed:', err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      
      {/* Header Info */}
      <div className="text-center max-w-2xl space-y-4 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={12} className="animate-spin" /> Next-gen ATS Optimization
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          AI Resume Scorer & Analyzer
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl">
          Upload your resume in PDF, DOCX, or TXT format. Get instant ATS compatibility scores, structural audits, and Claude-powered improvement suggestions.
        </p>
      </div>

      {/* Upload drop zone container */}
      <div className="w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-2xl shadow-xl">
        <UploadBox onUpload={handleUploadSubmit} isLoading={isLoading} />
        
        {/* Global error banner */}
        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm">
            <ShieldAlert size={20} className="shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-slate-300 text-xs">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Feature cards preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mt-16">
        <div className="glass-card p-5 rounded-xl text-left">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit mb-4">
            <FileText size={20} />
          </div>
          <h3 className="font-bold text-white text-base">Instant Parsing</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Extracts data from PDF, DOCX, DOC, or TXT formats instantly without local formatting issues.
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl text-left">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-4">
            <BarChart2 size={20} />
          </div>
          <h3 className="font-bold text-white text-base">ATS Match Algorithm</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Checks contact density, section headers, word counts, and industry standard structures.
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl text-left">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg w-fit mb-4">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-white text-base">Claude Critiques</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Provides tailored, role-specific suggestions using high-quality prompt heuristics.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Upload;
