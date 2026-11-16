import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Cpu,
} from 'lucide-react';
import Card from '../common/Card';

const CATEGORY_CONFIG = [
  {
    key: 'technicalSkills',
    label: 'Technical Skills',
    maxScore: 25,
    icon: Code2,
    color: 'from-blue-500 to-indigo-600',
    barColor: 'bg-blue-600',
  },
  {
    key: 'projects',
    label: 'Projects',
    maxScore: 20,
    icon: FolderGit2,
    color: 'from-emerald-500 to-teal-600',
    barColor: 'bg-emerald-600',
  },
  {
    key: 'experience',
    label: 'Work Experience / Internships',
    maxScore: 20,
    icon: Briefcase,
    color: 'from-amber-500 to-orange-600',
    barColor: 'bg-amber-600',
  },
  {
    key: 'education',
    label: 'Education',
    maxScore: 10,
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-600',
    barColor: 'bg-purple-600',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    maxScore: 10,
    icon: Award,
    color: 'from-sky-500 to-cyan-600',
    barColor: 'bg-sky-600',
  },
  {
    key: 'completeness',
    label: 'Resume Quality & Structure',
    maxScore: 15,
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    barColor: 'bg-rose-600',
  },
];

const getScoreTier = (score) => {
  if (score >= 85) {
    return {
      label: 'Strong Candidate Match',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeColor: 'text-emerald-600',
      ringColor: 'stroke-emerald-500',
    };
  }
  if (score >= 70) {
    return {
      label: 'Competitive Match',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeColor: 'text-blue-600',
      ringColor: 'stroke-blue-500',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate Match – Needs Improvement',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeColor: 'text-amber-600',
      ringColor: 'stroke-amber-500',
    };
  }
  return {
    label: 'Foundational – Significant Gaps',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeColor: 'text-rose-600',
    ringColor: 'stroke-rose-500',
  };
};

const ScoreOverviewCard = ({ analysis }) => {
  if (!analysis) return null;

  const { overallScore = 0, categoryScores = {}, targetRole, analysisProvider, updatedAt } = analysis;
  const tier = getScoreTier(overallScore);

  // SVG Circular Gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <Card className="border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Banner with Provider Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role Evaluation
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {targetRole}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Resume Match & Performance Score
          </h2>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Engine:{' '}
              <strong className="text-slate-700">
                {analysisProvider === 'fastapi-nlp-engine'
                  ? 'FastAPI NLP Engine'
                  : analysisProvider === 'rule-based-fallback'
                  ? 'Rule-Based Fallback'
                  : analysisProvider || 'Rule-Based Fallback'}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Evaluated: {formattedDate}</span>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* Circular Overall Score Widget */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-100">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`${tier.ringColor} transition-all duration-1000 ease-out`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {overallScore}
              </span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div
            className={`mt-4 px-3.5 py-1 rounded-full text-xs font-semibold border ${tier.color}`}
          >
            {tier.label}
          </div>
        </div>

        {/* Category Breakdown (6 Categories) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Category-Wise Rubric Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CATEGORY_CONFIG.map((category) => {
              const item = categoryScores[category.key] || {
                score: 0,
                maxScore: category.maxScore,
                feedback: '',
              };
              const score = typeof item.score === 'number' ? item.score : 0;
              const maxScore = item.maxScore || category.maxScore;
              const percentage = Math.min(100, Math.round((score / maxScore) * 100));
              const Icon = category.icon;

              return (
                <div
                  key={category.key}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {category.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {score}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {' '}/ {maxScore}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={`h-full ${category.barColor} transition-all duration-700 ease-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {item.feedback && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScoreOverviewCard;
