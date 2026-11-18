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
      <Card className="border-brand-border space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border/70">
          <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Personalized Improvement Action Plan
            </h3>
            <p className="text-xs text-brand-muted">
              Concrete steps you can implement today to elevate your resume impact
            </p>
          </div>
        </div>

        {improvementSuggestions.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {improvementSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-brand-border/80 bg-brand-bg hover:bg-white hover:border-brand-borderDark transition-all duration-150"
              >
                <div className="w-6 h-6 rounded-full bg-brand-forestLight text-brand-primary font-heading font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-sageBorder/50">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                  {typeof suggestion === 'object' && suggestion !== null
                    ? suggestion.suggestion || suggestion.text || suggestion.description || JSON.stringify(suggestion)
                    : String(suggestion || '')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-muted italic py-2">
            No specific action items generated. Your resume meets baseline guidelines for this role.
          </p>
        )}
      </Card>

      {/* AI Overall Feedback & Next Steps */}
      <Card className="border-brand-border bg-white shadow-soft space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border/70">
          <div className="w-8 h-8 rounded-xl bg-brand-charcoal text-white flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <Sparkles className="w-4 h-4 text-brand-forestLight" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Comprehensive CareerLens AI Review
            </h3>
            <p className="text-xs text-brand-muted">
              Strategic career advisor evaluation for {targetRole || 'your target role'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-brand-slate leading-relaxed">
          {summary && (
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-border shadow-soft-xs">
              <span className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                Executive Summary
              </span>
              <p>{summary}</p>
            </div>
          )}

          {roleSuitability && (
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-border shadow-soft-xs">
              <span className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-brand-primary" />
                Suitability for {targetRole}
              </span>
              <p>{roleSuitability}</p>
            </div>
          )}

          {mainImprovements && (
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-border shadow-soft-xs">
              <span className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-700" />
                Primary Resume Enhancements
              </span>
              <p>{mainImprovements}</p>
            </div>
          )}

          {nextSteps && (
            <div className="p-4 rounded-xl bg-brand-forestLight/50 border border-brand-sageBorder/60 shadow-soft-xs">
              <span className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-primary mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-brand-primary" />
                Strategic Career Next Steps
              </span>
              <p className="text-brand-charcoal">{nextSteps}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuggestionsFeedbackCard;
