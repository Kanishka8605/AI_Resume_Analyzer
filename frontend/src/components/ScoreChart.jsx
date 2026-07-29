import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const ScoreChart = ({ sections }) => {
  if (!sections || sections.length === 0) return null;

  // Format data for Recharts
  const data = sections.map((sec) => ({
    name: sec.name,
    score: sec.score,
    feedback: sec.feedback
  }));

  // Custom tooltips
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl max-w-xs text-xs">
          <p className="font-bold text-white mb-1">{info.name}</p>
          <p className="text-indigo-400 font-semibold mb-1">Score: {info.score}/100</p>
          <p className="text-slate-300 leading-normal">{info.feedback}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[260px] bg-slate-900/30 rounded-xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
          />
          
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            width={85}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }} />
          
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((entry, index) => {
              // Dynamic colors for bar nodes
              let barColor = '#6366F1'; // Default Indigo
              if (entry.score >= 80) {
                barColor = '#10B981'; // Green
              } else if (entry.score === 0) {
                barColor = '#EF4444'; // Red
              } else if (entry.score < 60) {
                barColor = '#F59E0B'; // Orange
              }
              return <Cell key={`cell-${index}`} fill={barColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
