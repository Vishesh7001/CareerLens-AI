import React from 'react';
import {
  Code2,
  AlertCircle,
  Check,
  Tag,
  Layers,
  Database,
  Terminal,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import Card from '../common/Card';

const SKILL_CATEGORY_META = [
  { key: 'programmingLanguages', label: 'Programming Languages', icon: Code2 },
  { key: 'frameworks', label: 'Frameworks & Libraries', icon: Layers },
  { key: 'databases', label: 'Databases & Storage', icon: Database },
  { key: 'tools', label: 'Developer Tools & Platforms', icon: Terminal },
  { key: 'other', label: 'Other Methodologies & Concepts', icon: Tag },
];

const getPriorityBadge = (priority) => {
  const norm = (priority || 'medium').toLowerCase();
  if (norm === 'high') {
    return {
      label: 'High Priority',
      className: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    };
  }
  if (norm === 'low') {
    return {
      label: 'Low Priority',
      className: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    };
  }
  return {
    label: 'Medium Priority',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  };
};

const TechnicalSkillsCard = ({ technicalSkillsAnalysis = {}, missingSkills = [] }) => {
  const {
    existingSkills = [],
    categorized = {},
    roleRelevanceScore = 0,
    summary = '',
  } = technicalSkillsAnalysis;

  return (
    <Card className="border border-slate-200/90 shadow-sm space-y-6">
      {/* Header with Relevance Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Technical Skills & Role Relevance
            </h3>
            <p className="text-xs text-slate-500">
              Categorized skills matched against industry benchmarks for this role
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Relevance Rating:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {roleRelevanceScore}% Match
          </span>
        </div>
      </div>

      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {summary}
        </div>
      )}

      {/* Categorized Existing Skills */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Identified Skills in Resume ({existingSkills.length})
        </h4>

        {existingSkills.length > 0 ? (
          <div className="space-y-3.5">
            {SKILL_CATEGORY_META.map((cat) => {
              const list = categorized[cat.key] || [];
              if (list.length === 0) return null;
              const Icon = cat.icon;

              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cat.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({list.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-5">
                    {list.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            No technical skills were parsed from the resume. Make sure skills are clearly listed under a Skills section.
          </p>
        )}
      </div>

      {/* Missing Skills Section */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              High-Value Missing Skills ({missingSkills.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Recommended additions to strengthen ATS & interview readiness
          </span>
        </div>

        {missingSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {missingSkills.map((item, idx) => {
              const badge = getPriorityBadge(item.priority);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {item.skill}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {item.reason}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            Great job! No major standard role skills appear missing from your profile.
          </div>
        )}
      </div>
    </Card>
  );
};

export default TechnicalSkillsCard;
