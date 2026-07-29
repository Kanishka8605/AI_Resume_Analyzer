import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalysisProvider } from './context/AnalysisContext';
import Navbar from './components/Navbar';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import About from './pages/About';

function App() {
  return (
    <Router>
      <AnalysisProvider>
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
          
          {/* Main Navigation */}
          <Navbar />
          
          {/* Main page content container */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Upload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          
          {/* Translucent Footer */}
          <footer className="py-6 border-t border-slate-900 bg-slate-950/20 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} ResumeAI Bot. All rights reserved. Powered by Claude & FastAPI.
          </footer>

        </div>
      </AnalysisProvider>
    </Router>
  );
}

export default App;
