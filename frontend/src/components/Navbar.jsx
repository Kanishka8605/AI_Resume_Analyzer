import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, FileText, History, Info } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-600 rounded-xl text-white group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
            <Bot size={24} className="animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            ResumeAI Bot
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileText size={16} />
            <span className="hidden sm:inline">Upload</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/history')
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <History size={16} />
            <span>History</span>
          </Link>

          <Link
            to="/about"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/about')
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Info size={16} />
            <span className="hidden sm:inline">About</span>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
