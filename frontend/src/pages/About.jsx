import React from 'react';
import { Bot, FileText, CheckCircle2, ShieldAlert, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-left">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-800 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          About ResumeAI Bot
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Learn how our parser works, what the score represents, and how to improve your ATS chances.
        </p>
      </div>

      {/* Intro Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
          <Bot size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">AI-Powered Optimization</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our platform evaluates resumes using two distinct layers: a rule-based parsing audit matching constraints built from recruiter telemetry (contact details, headings, length), and a semantic evaluation layer powered by Anthropic's Claude. It inspects wording, action verbs, and skill metrics to score your compatibility.
          </p>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-400" />
          The Evaluation Formula
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider">
              1. ATS Match (40% Weight)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates structural compliance using strict parsing tests:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Standalone headers (Experience, Education, Skills)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Email, phone, and online profile identifiers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Optimal file length (between 400 and 850 words)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Matched keywords based on target job title
              </li>
            </ul>
          </div>

          <div className="glass-card p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider">
              2. Content Quality (60% Weight)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Uses LLM models to grade formatting tone and completeness:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Impact-driven descriptions rather than tasks lists
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Presence of quantitative figures (saved 20%, increased 15%)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Clear section summary statement
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▪</span> Wording density and use of active vocabulary
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ATS Best Practices Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-400" />
          ATS Formatting Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2 p-3 bg-slate-900/30 rounded-xl">
            <p className="font-bold text-white">Do:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Use standard section titles: Experience, Education, Skills, Projects.</li>
              <li>Upload PDF or DOCX files for best extraction fidelity.</li>
              <li>Add metrics/percentages to represent your achievements.</li>
              <li>Match resume keywords to the target job description.</li>
            </ul>
          </div>

          <div className="space-y-2 p-3 bg-slate-900/30 rounded-xl">
            <p className="font-bold text-white">Avoid:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Putting critical contacts in PDF headers/footers (some parsers skip them).</li>
              <li>Using images, complex graphics, or text columns.</li>
              <li>Including excessive non-text symbols or progress rating bars.</li>
              <li>Passive verbs like "Responsible for" or "Assisted with".</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
