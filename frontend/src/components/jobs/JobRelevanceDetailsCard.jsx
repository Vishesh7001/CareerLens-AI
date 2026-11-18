import React from 'react';
import {
  FolderGit2,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import Card from '../common/Card';

const JobRelevanceDetailsCard = ({
  projectEvaluation = {},
  educationEvaluation = {},
  experienceEvaluation = {},
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Projects Evaluation */}
      <Card className="border-brand-border bg-white shadow-soft space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center shadow-soft-xs">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-heading font-bold text-brand-charcoal">Projects Relevance</h4>
            </div>
            <span className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60">
              {projectEvaluation.relevanceScore || 0}%
            </span>
          </div>

          <p className="text-xs text-brand-slate leading-relaxed">
            {projectEvaluation.feedback || 'Project alignment evaluated against role technologies.'}
          </p>
        </div>

        {projectEvaluation.suggestions && (
          <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-[11px] text-brand-charcoal flex items-start gap-2 leading-relaxed">
            <Lightbulb className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-heading font-semibold text-brand-primary">Recommendation: </strong>
              {projectEvaluation.suggestions}
            </div>
          </div>
        )}
      </Card>

      {/* 2. Education Evaluation */}
      <Card className="border-brand-border bg-white shadow-soft space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-bg text-brand-charcoal flex items-center justify-center shadow-soft-xs border border-brand-border">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-heading font-bold text-brand-charcoal">Education Compatibility</h4>
            </div>
            <span className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full bg-brand-bg text-brand-charcoal border border-brand-border">
              {educationEvaluation.compatibilityScore || 0}%
            </span>
          </div>

          <p className="text-xs text-brand-slate leading-relaxed">
            {educationEvaluation.feedback || 'Academic qualifications match target position requirements.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-[11px] text-brand-muted leading-relaxed">
          Degrees in Computer Science, IT, or related engineering areas meet standard benchmark qualifications.
        </div>
      </Card>

      {/* 3. Experience & Student Perspective */}
      <Card className="border-brand-border bg-white shadow-soft space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-soft-xs border border-amber-200">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-heading font-bold text-brand-charcoal">Experience & Practical Track</h4>
            </div>
            <span className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {experienceEvaluation.compatibilityScore || 0}%
            </span>
          </div>

          <p className="text-xs text-brand-slate leading-relaxed">
            {experienceEvaluation.feedback || 'Practical track record evaluated.'}
          </p>
        </div>

        {experienceEvaluation.studentPerspective && (
          <div className="p-3 rounded-xl bg-brand-forestLight/40 border border-brand-sageBorder/50 text-[11px] text-brand-charcoal flex items-start gap-2 leading-relaxed">
            <TrendingUp className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-heading font-semibold text-brand-primary">Student Insight: </strong>
              {experienceEvaluation.studentPerspective}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default JobRelevanceDetailsCard;
