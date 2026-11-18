import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Star,
  Info,
} from 'lucide-react';
import Card from '../common/Card';

const getPriorityBadge = (priority) => {
  const norm = (priority || 'medium').toLowerCase();
  if (norm === 'high') {
    return 'bg-red-50 text-brand-danger border-red-200 font-semibold';
  }
  if (norm === 'low') {
    return 'bg-brand-bg text-brand-muted border-brand-border font-medium';
  }
  return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
};

const SkillGapCard = ({
  matchedSkills = [],
  missingRequiredSkills = [],
  missingPreferredSkills = [],
}) => {
  return (
    <Card className="border-brand-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/70 gap-2">
        <div>
          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            Skill Gap Analysis
          </h3>
          <p className="text-xs text-brand-muted">
            Granular comparison between your resume and employer requirements
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-brand-forestLight text-brand-primary font-heading font-semibold border border-brand-sageBorder/60">
            {matchedSkills.length} Matched
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-brand-danger font-heading font-semibold border border-red-200">
            {missingRequiredSkills.length} Missing Required
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-heading font-semibold border border-amber-200">
            {missingPreferredSkills.length} Missing Preferred
          </span>
        </div>
      </div>

      {/* 1. Matched Skills Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-brand-primary" />
          <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-charcoal">
            Matched Skills ({matchedSkills.length})
          </h4>
        </div>

        {matchedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60 shadow-soft-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                <span>{item.skill}</span>
                {item.matchType === 'equivalent' && (
                  <span className="text-[10px] text-brand-primary/80 font-normal ml-0.5">
                    (via {item.matchedWith})
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-muted italic">
            No exact or equivalent skills found matching the job requirements directly.
          </p>
        )}
      </div>

      {/* 2. Missing Required Skills Section */}
      <div className="pt-4 border-t border-brand-border/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-danger" />
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-danger">
              Missing Required Skills ({missingRequiredSkills.length})
            </h4>
          </div>
          <span className="text-[11px] text-brand-muted">
            Not found in your resume – essential for shortlist consideration
          </span>
        </div>

        {missingRequiredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {missingRequiredSkills.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-brand-bg border border-brand-border/80 hover:border-brand-borderDark transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-heading font-bold text-brand-charcoal">
                    {item.skill}
                  </span>
                  <span
                    className={`text-[10px] font-heading px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority || 'High'} Priority
                  </span>
                </div>
                {item.importance && (
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    {item.importance}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-primary italic">
            Excellent! Your resume covers all core required skills for this job.
          </p>
        )}
      </div>

      {/* 3. Missing Preferred Skills Section */}
      {missingPreferredSkills.length > 0 && (
        <div className="pt-4 border-t border-brand-border/70">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-charcoal">
              Missing Preferred / Bonus Skills ({missingPreferredSkills.length})
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingPreferredSkills.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-medium bg-white text-brand-charcoal border border-brand-border shadow-soft-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{item.skill}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SkillGapCard;
