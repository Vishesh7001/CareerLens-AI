import React, { useState } from 'react';
import { Award, Info, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';

const CATEGORY_ORDER = [
  { key: 'resumeQuality', label: 'Resume Quality' },
  { key: 'jobCompatibility', label: 'Job Compatibility' },
  { key: 'technicalSkills', label: 'Technical Skills' },
  { key: 'learningProgress', label: 'Learning Progress' },
  { key: 'interviewPerformance', label: 'Interview Performance' },
];

const CareerReadinessCard = ({ careerReadiness = {} }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    overallScore = null,
    classification = 'Getting Started',
    categoryScores = {},
    availableCategoriesCount = 0,
    totalCategoriesCount = 5,
    calculationExplanation = '',
    disclaimer = 'This score is an internal readiness indicator for your skill preparation and does not constitute a guarantee of employment.',
  } = careerReadiness;

  const getBadgeStyle = (label) => {
    switch (label) {
      case 'Highly Prepared':
        return 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60';
      case 'Progressing Well':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Developing Skills':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-brand-bg text-brand-charcoal border-brand-border';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-brand-primary';
    if (score >= 65) return 'text-emerald-700';
    if (score >= 40) return 'text-amber-700';
    return 'text-brand-slate';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-brand-primary';
    if (score >= 65) return 'bg-emerald-600';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-brand-muted';
  };

  const getShortStatus = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 65) return 'Good';
    if (score >= 40) return 'Developing';
    return 'In Progress';
  };

  return (
    <Card className="border-brand-border p-5 sm:p-6 space-y-5">
      {/* 3. Simplified Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Award className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Career Readiness Score
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold border ${getBadgeStyle(
                classification
              )}`}
            >
              {classification}
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed">
            Your overall progress across resume, skills, learning, and interviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanation((prev) => !prev)}
          className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover inline-flex items-center gap-1 transition-colors self-start sm:self-center"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showExplanation ? 'Hide details' : 'How is this calculated?'}</span>
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Main Score & 5 Categories Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Left: Compact Circular Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-brand-bg rounded-2xl border border-brand-border text-center">
          <span className="text-[10px] font-heading font-bold text-brand-muted uppercase tracking-wider mb-2">
            Overall Readiness
          </span>
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-brand-border bg-white shadow-soft-xs">
            <div className="text-center">
              {overallScore !== null ? (
                <>
                  <span className={`text-3xl font-heading font-black ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </span>
                  <span className="text-[11px] font-bold text-brand-muted block -mt-1">/100</span>
                </>
              ) : (
                <span className="text-xs font-heading font-semibold text-brand-muted">
                  Pending
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-heading font-semibold text-brand-charcoal mt-2.5">
            {availableCategoriesCount} of {totalCategoriesCount} Categories Active
          </span>
        </div>

        {/* Right: 5 Readiness Categories Clean Progress Bars */}
        <div className="md:col-span-8 space-y-3">
          {CATEGORY_ORDER.map((cat) => {
            const catData = categoryScores[cat.key] || {};
            const isAvailable = Boolean(catData.available && typeof catData.score === 'number');
            const score = isAvailable ? catData.score : null;

            return (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-brand-charcoal font-heading font-semibold">
                    {cat.label}
                  </span>

                  {isAvailable ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-brand-muted font-medium">
                        {getShortStatus(score)}
                      </span>
                      <span className={`font-heading font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-brand-muted font-medium">
                      Not available yet
                    </span>
                  )}
                </div>

                {/* Only display clean progress bar when data is available */}
                {isAvailable && (
                  <div className="w-full h-2 rounded-full bg-brand-bg border border-brand-border/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                        score
                      )}`}
                      style={{ width: `${Math.max(5, score)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Scoring Details */}
      {showExplanation && (
        <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border space-y-2 text-xs text-brand-slate animate-in fade-in-50 duration-150">
          <div className="flex items-center gap-2 font-heading font-bold text-brand-charcoal">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>How CareerLens AI Calculates Your Score</span>
          </div>
          <p className="leading-relaxed text-xs">
            Your readiness score is dynamically calculated across your completed activities. Unattempted categories are not penalized with 0%, so your score always reflects your actual progress fairly.
          </p>
          <div className="text-[11px] text-brand-muted flex items-center gap-1.5 pt-1 border-t border-brand-border/60">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span>{disclaimer}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CareerReadinessCard;
