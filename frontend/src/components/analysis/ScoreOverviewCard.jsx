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
} from 'lucide-react';
import Card from '../common/Card';

const CATEGORY_CONFIG = [
  {
    key: 'technicalSkills',
    label: 'Technical Skills',
    maxScore: 25,
    icon: Code2,
    barColor: 'bg-brand-primary',
  },
  {
    key: 'projects',
    label: 'Projects',
    maxScore: 20,
    icon: FolderGit2,
    barColor: 'bg-brand-sage',
  },
  {
    key: 'experience',
    label: 'Work Experience / Internships',
    maxScore: 20,
    icon: Briefcase,
    barColor: 'bg-brand-charcoal',
  },
  {
    key: 'education',
    label: 'Education',
    maxScore: 10,
    icon: GraduationCap,
    barColor: 'bg-brand-primary',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    maxScore: 10,
    icon: Award,
    barColor: 'bg-brand-sage',
  },
  {
    key: 'completeness',
    label: 'Resume Quality & Structure',
    maxScore: 15,
    icon: Sparkles,
    barColor: 'bg-amber-600',
  },
];

const getScoreTier = (score) => {
  if (score >= 85) {
    return {
      label: 'Strong Candidate Match',
      color: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60',
      badgeColor: 'text-brand-primary',
      ringColor: '#244B38',
    };
  }
  if (score >= 70) {
    return {
      label: 'Competitive Match',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeColor: 'text-emerald-700',
      ringColor: '#2E6B4F',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate Match – Needs Improvement',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeColor: 'text-amber-700',
      ringColor: '#B45309',
    };
  }
  return {
    label: 'Foundational – Significant Gaps',
    color: 'bg-red-50 text-brand-danger border-red-200',
    badgeColor: 'text-brand-danger',
    ringColor: '#BE3A34',
  };
};

const ScoreOverviewCard = ({ analysis }) => {
  if (!analysis) return null;

  const {
    overallScore = 0,
    categoryScores = {},
    targetRole = 'Target Role',
    analysisProvider = 'fastapi-nlp-engine',
    engine,
  } = analysis;

  const tier = getScoreTier(overallScore);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <Card className="border-brand-border p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-heading font-bold text-brand-charcoal">
              ATS Resume Match Score
            </h3>
            <span
              className={`text-xs font-heading font-bold px-2.5 py-0.5 rounded-full border ${tier.color}`}
            >
              {tier.label}
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Evaluated against industry ATS benchmarks for{' '}
            <strong className="text-brand-charcoal">{targetRole}</strong>
          </p>
        </div>

        <div className="text-xs font-heading font-medium text-brand-muted bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-border self-start md:self-auto">
          Scoring Engine: <span className="text-brand-charcoal font-bold">{analysisProvider || engine || 'fastapi-nlp-engine'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Circular Gauge */}
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
                stroke={tier.ringColor}
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
            Overall ATS Readiness
          </div>
          <p className="text-[11px] text-brand-muted mt-0.5 max-w-[200px]">
            Based on 6 weighted rubric dimensions
          </p>
        </div>

        {/* Category Breakdown Bars */}
        <div className="lg:col-span-8 space-y-3.5">
          <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-muted mb-2">
            Rubric Breakdown & Category Points
          </h4>

          {CATEGORY_CONFIG.map((cat) => {
            const item = categoryScores[cat.key] || {};
            const score =
              typeof item === 'object' && item !== null && typeof item.score === 'number'
                ? item.score
                : typeof item === 'number'
                ? item
                : 0;
            const maxScore =
              typeof item === 'object' && item !== null && typeof item.maxScore === 'number'
                ? item.maxScore
                : cat.maxScore;
            const feedback =
              typeof item === 'object' && item !== null && typeof item.feedback === 'string'
                ? item.feedback
                : '';
            const percentage =
              maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;
            const Icon = cat.icon;

            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-brand-muted" />
                    <span className="font-heading font-semibold text-brand-charcoal">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-brand-charcoal font-bold">
                      {score} / {maxScore} pts
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      ({percentage}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-brand-bg border border-brand-border/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cat.barColor}`}
                    style={{ width: `${percentage}%` }}
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

export default ScoreOverviewCard;
