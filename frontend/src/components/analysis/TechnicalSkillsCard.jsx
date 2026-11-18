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
      className: 'bg-red-50 text-brand-danger border-red-200 font-semibold',
    };
  }
  if (norm === 'low') {
    return {
      label: 'Low Priority',
      className: 'bg-brand-bg text-brand-muted border-brand-border font-medium',
    };
  }
  return {
    label: 'Medium Priority',
    className: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
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
    <Card className="border-brand-border space-y-6">
      {/* Header with Relevance Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/70 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Technical Skills & Role Relevance
            </h3>
            <p className="text-xs text-brand-muted">
              Categorized skills matched against industry benchmarks for this role
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-brand-muted font-medium">Relevance Rating:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-bold bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60">
            {roleRelevanceScore}% Match
          </span>
        </div>
      </div>

      {summary && (
        <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border text-xs sm:text-sm text-brand-slate leading-relaxed">
          {summary}
        </div>
      )}

      {/* Categorized Existing Skills */}
      <div>
        <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-muted mb-3">
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
                  <div className="flex items-center gap-1.5 text-xs font-heading font-semibold text-brand-charcoal">
                    <Icon className="w-3.5 h-3.5 text-brand-muted" />
                    <span>{cat.label}</span>
                    <span className="text-[10px] text-brand-muted font-normal">
                      ({list.length})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {list.map((skill, sIdx) => {
                      const skillLabel =
                        typeof skill === 'object' && skill !== null
                          ? skill.name || skill.skill || skill.title || ''
                          : String(skill || '');
                      return (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 text-xs font-heading font-medium px-2.5 py-1 rounded-xl bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60 shadow-soft-xs"
                        >
                          <Check className="w-3 h-3 text-brand-primary" />
                          {skillLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-brand-muted italic py-2">
            No technical skills detected in the parsed resume.
          </p>
        )}
      </div>

      {/* Missing Skills Section */}
      <div className="pt-4 border-t border-brand-border/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-charcoal">
              Recommended Skills to Acquire ({missingSkills.length})
            </h4>
          </div>
          <span className="text-[11px] text-brand-muted">
            High impact on ATS rankings
          </span>
        </div>

        {missingSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {missingSkills.map((missing, idx) => {
              const badge = getPriorityBadge(missing.priority);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-brand-bg border border-brand-border/70 hover:border-brand-borderDark transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-heading font-bold text-brand-charcoal">
                      {typeof missing === 'object' && missing !== null
                        ? missing.skill || missing.name || missing.title || ''
                        : String(missing || '')}
                    </span>
                    <span
                      className={`text-[10px] font-heading px-2 py-0.5 rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {missing.reason && (
                    <p className="text-[11px] text-brand-muted leading-relaxed">
                      {missing.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-brand-primary italic py-2">
            Great news! No critical missing technical skills identified for this role benchmark.
          </p>
        )}
      </div>
    </Card>
  );
};

export default TechnicalSkillsCard;
