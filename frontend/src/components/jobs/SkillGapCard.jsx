import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Star,
  ArrowRight,
  Info,
} from 'lucide-react';
import Card from '../common/Card';

const getPriorityBadge = (priority) => {
  const norm = (priority || 'medium').toLowerCase();
  if (norm === 'high') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (norm === 'low') {
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const SkillGapCard = ({
  matchedSkills = [],
  missingRequiredSkills = [],
  missingPreferredSkills = [],
}) => {
  return (
    <Card className="border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Skill Gap Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Granular comparison between your resume and employer requirements
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            {matchedSkills.length} Matched
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">
            {missingRequiredSkills.length} Missing Required
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
            {missingPreferredSkills.length} Missing Preferred
          </span>
        </div>
      </div>

      {/* 1. Matched Skills Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Matched Skills ({matchedSkills.length})
          </h4>
        </div>

        {matchedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{item.skill}</span>
                {item.matchType === 'equivalent' && (
                  <span className="text-[10px] text-emerald-600 font-normal ml-0.5">
                    (via {item.matchedWith})
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            No exact or equivalent skills found matching the job requirements directly.
          </p>
        )}
      </div>

      {/* 2. Missing Required Skills Section */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
              Missing Required Skills ({missingRequiredSkills.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Not found in your resume – essential for shortlist consideration
          </span>
        </div>

        {missingRequiredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {missingRequiredSkills.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-red-100 bg-red-50/20 hover:bg-red-50/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.skill}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  <strong className="text-slate-700">Importance: </strong>
                  {item.reason}
                </p>

                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-white border border-red-100/80 text-[11px] text-slate-700 leading-relaxed">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-slate-800">Learning Action: </strong>
                    {item.suggestedLearningDirection}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : matchedSkills.length > 0 ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Outstanding! All mandatory technical qualifications appear evidenced in your resume.
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            No mandatory technical requirements were specified for this job posting.
          </p>
        )}
      </div>

      {/* 3. Missing Preferred Skills Section */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Missing Preferred / Nice-to-Have Skills ({missingPreferredSkills.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Bonus skills that elevate your profile among competitive applicants
          </span>
        </div>

        {missingPreferredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {missingPreferredSkills.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/20 hover:bg-purple-50/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.skill}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {item.reason}
                </p>

                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-white border border-purple-100/80 text-[11px] text-slate-700 leading-relaxed">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>{item.suggestedLearningDirection}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            No unfulfilled preferred skills identified.
          </p>
        )}
      </div>
    </Card>
  );
};

export default SkillGapCard;
