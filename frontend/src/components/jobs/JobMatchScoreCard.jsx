import React from 'react';
import {
  Code2,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Star,
  Cpu,
  CheckCircle2,
  Award,
} from 'lucide-react';
import Card from '../common/Card';

const CATEGORY_META = [
  {
    key: 'technicalSkills',
    label: 'Technical Skills Match',
    weight: '35%',
    maxPoints: 35,
    icon: Code2,
    barColor: 'bg-brand-primary',
  },
  {
    key: 'projectsRelevance',
    label: 'Projects Relevance',
    weight: '25%',
    maxPoints: 25,
    icon: FolderGit2,
    barColor: 'bg-brand-sage',
  },
  {
    key: 'educationCompatibility',
    label: 'Education Compatibility',
    weight: '15%',
    maxPoints: 15,
    icon: GraduationCap,
    barColor: 'bg-brand-charcoal',
  },
  {
    key: 'experienceInternships',
    label: 'Experience & Practical Track',
    weight: '15%',
    maxPoints: 15,
    icon: Briefcase,
    barColor: 'bg-amber-600',
  },
  {
    key: 'preferredSkills',
    label: 'Preferred / Bonus Skills',
    weight: '10%',
    maxPoints: 10,
    icon: Star,
    barColor: 'bg-brand-primary',
  },
];

const getClassificationConfig = (classification) => {
  const norm = (classification || '').toLowerCase();
  if (norm.includes('excellent')) {
    return {
      label: 'Excellent Match (85-100)',
      badgeClass: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60',
      ringColor: '#244B38',
      textColor: 'text-brand-primary',
    };
  }
  if (norm.includes('strong')) {
    return {
      label: 'Strong Match (70-84)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      ringColor: '#2E6B4F',
      textColor: 'text-emerald-700',
    };
  }
  if (norm.includes('moderate')) {
    return {
      label: 'Moderate Match (50-69)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      ringColor: '#B45309',
      textColor: 'text-amber-700',
    };
  }
  return {
    label: 'Low Match (0-49)',
    badgeClass: 'bg-red-50 text-brand-danger border-red-200',
    ringColor: '#BE3A34',
    textColor: 'text-brand-danger',
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
  } = match;

  const config = getClassificationConfig(matchClassification);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <Card className="border-brand-border p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/70 gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Award className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-heading font-bold text-brand-charcoal">
              Match Compatibility Score
            </h3>
            <span
              className={`text-xs font-heading font-bold px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Weighted comparison for <strong className="text-brand-charcoal">{jobTitle}</strong> at{' '}
            <strong className="text-brand-charcoal">{companyName}</strong>
          </p>
        </div>

        {analysisProvider && (
          <span className="text-[11px] font-heading font-medium text-brand-muted bg-brand-bg px-2.5 py-1 rounded-xl border border-brand-border self-start sm:self-auto">
            Engine: {analysisProvider}
          </span>
        )}
      </div>

      {/* Main Score Dial and Rubric Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Overall Circular Dial */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-brand-bg rounded-2xl border border-brand-border text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-brand-border"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={config.ringColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-heading font-black text-brand-charcoal">
                {overallScore}
              </span>
              <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs font-heading font-bold text-brand-charcoal">
            Overall Compatibility
          </div>
          <p className="text-[11px] text-brand-muted mt-0.5 max-w-[200px]">
            Based on the 35/25/15/15/10 rubric
          </p>
        </div>

        {/* Right: Rubric Bars */}
        <div className="lg:col-span-8 space-y-3.5">
          <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-muted mb-2">
            Rubric Breakdown & Weights
          </h4>

          {CATEGORY_META.map((cat) => {
            const item = categoryScores[cat.key] || {};
            const rawScore =
              typeof item === 'object' && item !== null && typeof item.score === 'number'
                ? item.score
                : typeof item === 'number'
                ? item
                : 0;
            const weightedPts =
              typeof item === 'object' && item !== null && typeof item.weightedScore === 'number'
                ? item.weightedScore
                : rawScore;
            const maxPoints =
              typeof item === 'object' && item !== null && typeof item.weightPercentage === 'number'
                ? item.weightPercentage
                : cat.maxPoints;
            const percentage =
              maxPoints > 0 ? Math.min(100, Math.round((weightedPts / maxPoints) * 100)) : 0;
            const feedback =
              typeof item === 'object' && item !== null && typeof item.feedback === 'string'
                ? item.feedback
                : '';
            const Icon = cat.icon;

            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-brand-muted" />
                    <span className="font-heading font-semibold text-brand-charcoal">
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      ({cat.weight})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-brand-charcoal font-bold">
                      {weightedPts} / {maxPoints} pts
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      ({rawScore}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-brand-bg border border-brand-border/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cat.barColor}`}
                    style={{ width: `${Math.min(100, rawScore)}%` }}
                  />
                </div>

                {feedback && (
                  <p className="text-[11px] text-brand-muted leading-relaxed line-clamp-1 pt-0.5">
                    {feedback}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default JobMatchScoreCard;
