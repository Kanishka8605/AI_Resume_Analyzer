import React from 'react';

const ProgressBar = ({ value, label, size = 160, strokeWidth = 14 }) => {
  const percentage = Math.min(100, Math.max(0, value || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color theme based on score tiers
  let colorClass = 'text-accent-red';
  let gradientId = 'grad-red';
  let stopColors = { start: '#EF4444', end: '#B91C1C' }; // Red

  if (percentage >= 80) {
    colorClass = 'text-accent-green';
    gradientId = 'grad-green';
    stopColors = { start: '#10B981', end: '#047857' }; // Green
  } else if (percentage >= 60) {
    colorClass = 'text-accent-orange';
    gradientId = 'grad-orange';
    stopColors = { start: '#F59E0B', end: '#B45309' }; // Orange
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className={`w-full h-full transform -rotate-95 ${colorClass}`} viewBox={`0 0 ${size} ${size}`}>
          {/* Gradients */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stopColors.start} />
              <stop offset="100%" stopColor={stopColors.end} />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            className="text-slate-800"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground Colored Score Circle */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {percentage}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
