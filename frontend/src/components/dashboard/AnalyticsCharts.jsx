import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
  Briefcase,
  MessageSquareCode,
  Map,
} from 'lucide-react';
import Card from '../common/Card';

const AnalyticsCharts = ({ analytics = {} }) => {
  const [activeChart, setActiveChart] = useState('interview'); // 'interview' | 'job' | 'resume'

  const {
    resumeHistory = [],
    jobMatchHistory = [],
    interviewHistory = [],
    learningProgress = {},
  } = analytics;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 65) return '#0ea5e9'; // sky
    if (score >= 40) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  // Render SVG Line/Bar Chart for Interview or Resume or Job History
  const renderHistoryChart = (data, valueKey, labelKey, secondaryKey, title, emptyMessage) => {
    if (!data || data.length === 0) {
      return (
        <div className="py-12 text-center space-y-2">
          <BarChart2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No Historical Records</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">{emptyMessage}</p>
        </div>
      );
    }

    const maxVal = 100;
    const chartHeight = 160;
    const chartWidth = 500;
    const padding = { top: 20, right: 30, bottom: 30, left: 35 };

    const usableWidth = chartWidth - padding.left - padding.right;
    const usableHeight = chartHeight - padding.top - padding.bottom;

    const points = data.map((d, index) => {
      const x =
        data.length === 1
          ? padding.left + usableWidth / 2
          : padding.left + (index / (data.length - 1)) * usableWidth;
      const y = padding.top + usableHeight - ((d[valueKey] || 0) / maxVal) * usableHeight;
      return { x, y, ...d };
    });

    const pathD =
      points.length > 1
        ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
        : '';

    return (
      <div className="space-y-4">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible"
          >
            {/* Horizontal Grid lines */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = padding.top + usableHeight - (tick / maxVal) * usableHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94a3b8"
                    fontWeight="600"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Connecting Trend Line */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#ffffff"
                  stroke={getScoreColor(pt[valueKey])}
                  strokeWidth="2.5"
                />
                {/* Score label above point */}
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {pt[valueKey]}%
                </text>
                {/* Date label on X axis */}
                <text
                  x={pt.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748b"
                >
                  {formatDate(pt.date)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend / Recent List Below Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          {data.slice(-3).reverse().map((item, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
            >
              <div className="truncate pr-2">
                <span className="font-bold text-slate-800 block truncate">
                  {item[labelKey] || item.role || item.targetRole || 'Session'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatDate(item.date)} {secondaryKey && item[secondaryKey] ? `• ${item[secondaryKey]}` : ''}
                </span>
              </div>
              <span
                className="font-extrabold px-2 py-0.5 rounded-md text-xs"
                style={{
                  color: getScoreColor(item[valueKey]),
                  backgroundColor: `${getScoreColor(item[valueKey])}15`,
                }}
              >
                {item[valueKey]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-slate-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-slate-900">
              Career Progress Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real historical score trajectories and learning progress over time
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveChart('interview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeChart === 'interview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Interviews</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('job')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeChart === 'job'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Matches</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('resume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeChart === 'resume'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resume Analyses</span>
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div>
        {activeChart === 'interview' &&
          renderHistoryChart(
            interviewHistory,
            'score',
            'role',
            'difficulty',
            'Mock Interview Performance',
            'Complete mock interview sessions to track your scoring progression.'
          )}

        {activeChart === 'job' &&
          renderHistoryChart(
            jobMatchHistory,
            'score',
            'company',
            'role',
            'Job Matching Scores',
            'Run job match evaluations to compare compatibility across target employers.'
          )}

        {activeChart === 'resume' &&
          renderHistoryChart(
            resumeHistory,
            'score',
            'targetRole',
            'provider',
            'Resume Quality History',
            'Run AI resume analyses to monitor ATS optimization scores.'
          )}
      </div>
    </Card>
  );
};

export default AnalyticsCharts;
