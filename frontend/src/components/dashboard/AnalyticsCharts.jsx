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
    if (score >= 80) return '#244B38'; // forest green
    if (score >= 65) return '#2D5A43'; // sage
    if (score >= 40) return '#B45309'; // amber
    return '#BE3A34'; // warm red
  };

  // Render SVG Line/Bar Chart for Interview or Resume or Job History
  const renderHistoryChart = (data, valueKey, labelKey, secondaryKey, title, emptyMessage) => {
    if (!data || data.length === 0) {
      return (
        <div className="py-14 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-muted flex items-center justify-center mx-auto">
            <BarChart2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-heading font-semibold text-brand-charcoal">No Historical Records</p>
          <p className="text-[11px] text-brand-muted max-w-sm mx-auto">{emptyMessage}</p>
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

    const areaD =
      points.length > 1
        ? `M ${points[0].x},${padding.top + usableHeight} L ${points
            .map((p) => `${p.x},${p.y}`)
            .join(' L ')} L ${points[points.length - 1].x},${padding.top + usableHeight} Z`
        : '';

    return (
      <div className="space-y-4">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#244B38" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#244B38" stopOpacity="0.0" />
              </linearGradient>
            </defs>

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
                    stroke="#ECEEE9"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#6A726A"
                    fontFamily="Inter, sans-serif"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#244B38"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points & Labels */}
            {points.map((p, idx) => (
              <g key={idx} className="group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#244B38"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-transform duration-150 hover:scale-125 cursor-pointer"
                />
                {/* Score label above point */}
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#191C1A"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {p[valueKey]}%
                </text>
                {/* Date label on x-axis */}
                <text
                  x={p.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#6A726A"
                  fontFamily="Inter, sans-serif"
                >
                  {formatDate(p.createdAt || p.date)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend / Secondary Details */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border/60 text-xs">
          <span className="font-heading font-semibold text-brand-charcoal">{title}</span>
          <div className="flex items-center gap-3 text-brand-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
              Recorded Progress
            </span>
            <span>{data.length} evaluation points</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-brand-border p-6 space-y-4">
      {/* Header and Chart Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Career Progress Analytics
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Time-series progression across interviews, job matches, and ATS resume evaluations
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-brand-bg p-1 rounded-xl border border-brand-border">
          <button
            type="button"
            onClick={() => setActiveChart('interview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
              activeChart === 'interview'
                ? 'bg-white text-brand-primary shadow-soft-xs'
                : 'text-brand-slate hover:text-brand-charcoal'
            }`}
          >
            Interviews
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('job')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
              activeChart === 'job'
                ? 'bg-white text-brand-primary shadow-soft-xs'
                : 'text-brand-slate hover:text-brand-charcoal'
            }`}
          >
            Job Matches
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('resume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
              activeChart === 'resume'
                ? 'bg-white text-brand-primary shadow-soft-xs'
                : 'text-brand-slate hover:text-brand-charcoal'
            }`}
          >
            Resume Scores
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-2">
        {activeChart === 'interview' &&
          renderHistoryChart(
            interviewHistory,
            'score',
            'role',
            'roundType',
            'Mock Interview Score Progression',
            'Complete mock interview sessions to visualize your technical & behavioral score trajectory.'
          )}

        {activeChart === 'job' &&
          renderHistoryChart(
            jobMatchHistory,
            'overallMatchScore',
            'jobTitle',
            'company',
            'Job Compatibility Compatibility Trend',
            'Run job match analyses against target jobs to track your market alignment.'
          )}

        {activeChart === 'resume' &&
          renderHistoryChart(
            resumeHistory,
            'overallScore',
            'targetRole',
            'resumeName',
            'ATS Resume Quality Progression',
            'Run ATS resume reviews across target roles to track optimization improvements.'
          )}
      </div>
    </Card>
  );
};

export default AnalyticsCharts;
