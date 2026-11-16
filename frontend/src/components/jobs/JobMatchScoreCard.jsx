import React from 'react';
import {
  Code2,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Star,
  Cpu,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import Card from '../common/Card';

const CATEGORY_META = [
  {
    key: 'technicalSkills',
    label: 'Technical Skills Match',
    weight: '35%',
    maxPoints: 35,
    icon: Code2,
    barColor: 'bg-indigo-600',
  },
  {
    key: 'projectsRelevance',
    label: 'Projects Relevance',
    weight: '25%',
    maxPoints: 25,
    icon: FolderGit2,
    barColor: 'bg-teal-600',
  },
  {
    key: 'educationCompatibility',
    label: 'Education Compatibility',
    weight: '15%',
    maxPoints: 15,
    icon: GraduationCap,
    barColor: 'bg-blue-600',
  },
  {
    key: 'experienceInternships',
    label: 'Experience & Practical Track',
    weight: '15%',
    maxPoints: 15,
    icon: Briefcase,
    barColor: 'bg-orange-600',
  },
  {
    key: 'preferredSkills',
    label: 'Preferred / Bonus Skills',
    weight: '10%',
    maxPoints: 10,
    icon: Star,
    barColor: 'bg-purple-600',
  },
];

const getClassificationConfig = (classification) => {
  const norm = (classification || '').toLowerCase();
  if (norm.includes('excellent')) {
    return {
      label: 'Excellent Match (85-100)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ringColor: 'stroke-emerald-500',
      textColor: 'text-emerald-700',
    };
  }
  if (norm.includes('strong')) {
    return {
      label: 'Strong Match (70-84)',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      ringColor: 'stroke-indigo-500',
      textColor: 'text-indigo-700',
    };
  }
  if (norm.includes('moderate')) {
    return {
      label: 'Moderate Match (50-69)',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      ringColor: 'stroke-amber-500',
      textColor: 'text-amber-700',
    };
  }
  return {
    label: 'Low Match (0-49)',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    ringColor: 'stroke-rose-500',
    textColor: 'text-rose-700',
  };
};

const JobMatchScoreCard = ({ match }) => {
  if (!match) return null;

  const {
    overallScore = 0,
    matchClassification = 'Low Match',
    categoryScores = {},
    jobTitle,
    companyName,
    analysisProvider,
    matchingExplanation,
    keyObservations = [],
  } = match;

  const config = getClassificationConfig(matchClassification);

  // SVG circular gauge
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <Card className="border border-indigo-100 shadow-sm overflow-hidden bg-gradient-to-b from-white to-slate-50/40">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role Compatibility Engine
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {jobTitle} @ {companyName}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Job Compatibility Score
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Provider:{' '}
            <strong className="text-slate-800">
              {analysisProvider === 'fastapi-nlp-engine' ? 'FastAPI NLP Engine' : 'Rule-Based Fallback'}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* Circular Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/80">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`${config.ringColor} transition-all duration-1000 ease-out`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {overallScore}%
              </span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Match Rating
              </span>
            </div>
          </div>

          <div className={`mt-4 px-3.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}>
            {matchClassification}
          </div>
        </div>

        {/* 5-Category Weighted Rubric */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Weighted Category Breakdown (100% Total)
            </h3>
            <span className="text-[11px] text-slate-400">
              Independently calculated & weighted
            </span>
          </div>

          <div className="space-y-3">
            {CATEGORY_META.map((cat) => {
              const item = categoryScores[cat.key] || {
                score: 0,
                weightedScore: 0,
                weightPercentage: cat.maxPoints,
                feedback: '',
              };
              const rawScore = typeof item.score === 'number' ? item.score : 0;
              const weightedPts = typeof item.weightedScore === 'number' ? item.weightedScore : 0;
              const Icon = cat.icon;

              return (
                <div
                  key={cat.key}
                  className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({cat.weight} weight)</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900">{weightedPts}</span>
                      <span className="text-[11px] text-slate-400 font-medium"> / {cat.maxPoints} pts</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({rawScore}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${cat.barColor} transition-all duration-700 ease-out rounded-full`}
                      style={{ width: `${Math.min(100, rawScore)}%` }}
                    />
                  </div>

                  {item.feedback && (
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">
                      {item.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanation & Observations */}
      {(matchingExplanation || (keyObservations && keyObservations.length > 0)) && (
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          {matchingExplanation && (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {matchingExplanation}
            </p>
          )}

          {keyObservations && keyObservations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {keyObservations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 leading-snug"
                >
                  {obs}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default JobMatchScoreCard;
