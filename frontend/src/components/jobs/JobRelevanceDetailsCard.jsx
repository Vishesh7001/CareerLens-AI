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
      <Card className="border border-teal-100 bg-teal-50/15 shadow-sm space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Projects Relevance</h4>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {projectEvaluation.relevanceScore || 0}%
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {projectEvaluation.feedback || 'Project alignment evaluated against role technologies.'}
          </p>
        </div>

        {projectEvaluation.suggestions && (
          <div className="p-2.5 rounded-lg bg-white border border-teal-100 text-[11px] text-teal-950 flex items-start gap-1.5 leading-snug">
            <Lightbulb className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-teal-800">Recommendation: </strong>
              {projectEvaluation.suggestions}
            </div>
          </div>
        )}
      </Card>

      {/* 2. Education Evaluation */}
      <Card className="border border-blue-100 bg-blue-50/15 shadow-sm space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Education Compatibility</h4>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {educationEvaluation.compatibilityScore || 0}%
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {educationEvaluation.feedback || 'Academic qualifications match target position requirements.'}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-blue-100 text-[11px] text-slate-600 leading-snug">
          Degrees in Computer Science, IT, or related engineering areas meet standard benchmark qualifications.
        </div>
      </Card>

      {/* 3. Experience & Student Perspective */}
      <Card className="border border-orange-100 bg-orange-50/15 shadow-sm space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Experience & Practical Track</h4>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
              {experienceEvaluation.compatibilityScore || 0}%
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {experienceEvaluation.feedback || 'Practical track record evaluated.'}
          </p>
        </div>

        {experienceEvaluation.studentPerspective && (
          <div className="p-2.5 rounded-lg bg-white border border-orange-100 text-[11px] text-orange-950 flex items-start gap-1.5 leading-snug">
            <TrendingUp className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-orange-800">Student Insight: </strong>
              {experienceEvaluation.studentPerspective}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default JobRelevanceDetailsCard;
