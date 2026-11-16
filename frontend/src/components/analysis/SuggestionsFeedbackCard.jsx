import React from 'react';
import {
  Sparkles,
  ListChecks,
  Compass,
  ArrowRight,
  Target,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import Card from '../common/Card';

const SuggestionsFeedbackCard = ({
  improvementSuggestions = [],
  aiFeedback = {},
  targetRole,
}) => {
  const {
    summary = '',
    roleSuitability = '',
    mainImprovements = '',
    nextSteps = '',
  } = aiFeedback;

  return (
    <div className="space-y-6">
      {/* Actionable Improvement Suggestions */}
      <Card className="border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Personalized Improvement Action Plan
            </h3>
            <p className="text-xs text-slate-500">
              Concrete steps you can implement today to elevate your resume impact
            </p>
          </div>
        </div>

        {improvementSuggestions.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {improvementSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">
            No specific action items generated. Your resume meets baseline guidelines for this role.
          </p>
        )}
      </Card>

      {/* AI Overall Feedback & Next Steps */}
      <Card className="border border-brand-primary/30 bg-gradient-to-br from-white to-sky-50/40 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Comprehensive CareerLens AI Review
            </h3>
            <p className="text-xs text-slate-500">
              Strategic career advisor evaluation for {targetRole || 'your target role'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {summary && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Executive Summary
              </span>
              <p>{summary}</p>
            </div>
          )}

          {roleSuitability && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-brand-primary" />
                Suitability for {targetRole}
              </span>
              <p>{roleSuitability}</p>
            </div>
          )}

          {mainImprovements && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Priority Enhancements Needed
              </span>
              <p>{mainImprovements}</p>
            </div>
          )}

          {nextSteps && (
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 text-sky-950">
              <span className="block text-xs font-bold uppercase tracking-wider text-sky-800 mb-1 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-brand-primary" />
                Recommended Next Steps
              </span>
              <p>{nextSteps}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuggestionsFeedbackCard;
