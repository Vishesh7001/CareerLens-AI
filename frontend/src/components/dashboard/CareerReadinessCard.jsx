import React, { useState } from 'react';
import { Award, Info, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Card from '../common/Card';

const CareerReadinessCard = ({ careerReadiness = {} }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    overallScore = null,
    classification = 'Getting Started',
    classificationDescription = 'Beginning career preparation; complete key activities to build your profile.',
    categoryScores = {},
    missingCategories = [],
    availableCategoriesCount = 0,
    totalCategoriesCount = 5,
    calculationExplanation = '',
    disclaimer = 'This score is an internal readiness indicator for your skill preparation and does not constitute a guarantee of employment.',
    lastCalculatedAt,
  } = careerReadiness;

  const categories = Object.keys(categoryScores).map((key) => ({
    key,
    ...categoryScores[key],
  }));

  const getBadgeStyle = (label) => {
    switch (label) {
      case 'Highly Prepared':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Progressing Well':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Developing Skills':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 65) return 'text-sky-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-sky-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <Card className="border-slate-200 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-slate-900">
              Career Readiness Score
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(
                classification
              )}`}
            >
              {classification}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {classificationDescription}
          </p>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide Scoring Logic' : 'How is this calculated?'}</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Dial & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Overall Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Aggregate Readiness
          </span>
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-slate-200 bg-white shadow-inner">
            <div className="text-center">
              {overallScore !== null ? (
                <>
                  <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400">/100</span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-400 px-2">In Progress</span>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-3">
            {availableCategoriesCount} of {totalCategoriesCount} pillars contributing
          </span>
          {missingCategories.length > 0 && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-1">
              Weights renormalized
            </span>
          )}
        </div>

        {/* Right: 5 Pillar Contribution Meters */}
        <div className="md:col-span-2 space-y-3.5">
          {categories.map((cat) => (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  {cat.available ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  )}
                  <span>{cat.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({cat.available ? `${cat.appliedWeight || cat.defaultWeight}% weight` : 'Not yet evaluated'})
                  </span>
                </div>

                <div className="text-right">
                  {cat.available ? (
                    <span className="font-bold text-slate-900">{cat.score}/100</span>
                  ) : (
                    <span className="text-[11px] italic text-slate-400">Activity pending</span>
                  )}
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    cat.available ? getProgressColor(cat.score) : 'bg-slate-200'
                  }`}
                  style={{ width: `${cat.available ? Math.min(100, Math.max(0, cat.score)) : 0}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[280px]">{cat.source}</span>
                {cat.available && cat.contribution !== undefined && (
                  <span className="font-medium text-slate-600">
                    +{cat.contribution} pts to total
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanatory Collapsible Box */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-brand-primary" />
            <span>Scoring Engine Methodology & Weight Renormalization</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            {calculationExplanation}
          </p>
          <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>{disclaimer}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CareerReadinessCard;
