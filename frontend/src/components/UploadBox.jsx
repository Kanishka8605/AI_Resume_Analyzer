import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Briefcase, AlertCircle } from 'lucide-react';

const UploadBox = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];

  const validateFile = (selectedFile) => {
    setLocalError('');
    if (!selectedFile) return false;

    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const sizeInMB = selectedFile.size / (1024 * 1024);

    if (!allowedExtensions.includes(extension)) {
      setLocalError('Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.');
      return false;
    }

    if (sizeInMB > 5) {
      setLocalError('File size is too large. Maximum size allowed is 5MB.');
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const clearFile = () => {
    setFile(null);
    setLocalError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setLocalError('Please choose or drop a resume file first.');
      return;
    }
    onUpload(file, targetRole);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={file ? undefined : onButtonClick}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            file
              ? 'border-indigo-500/50 bg-indigo-500/5'
              : dragActive
              ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99] shadow-inner'
              : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleChange}
          />

          {!file ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-slate-800 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-lg font-semibold">Drag & drop your resume</p>
                <p className="text-sm text-slate-400 mt-1">
                  Supports PDF, DOCX, DOC, or TXT (Max 5MB)
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-xl border border-slate-700 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <FileText size={24} />
                </div>
                <div className="text-left truncate max-w-[240px]">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Target Job Role Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Briefcase size={16} className="text-indigo-400" />
            Target Job Role / Description (Optional)
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <p className="text-xs text-slate-500">
            Providing a role tailors the keyword analysis and yields more targeted improvements.
          </p>
        </div>

        {/* Local Error feedback */}
        {localError && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !file}
          className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg shadow-indigo-600/25 transition-all text-center flex items-center justify-center gap-2 ${
            isLoading || !file
              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <span>Scan & Analyze Resume</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadBox;
