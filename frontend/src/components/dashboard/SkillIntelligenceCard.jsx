import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Layers,
  FileText,
  Briefcase,
  MessageSquareCode,
  Map,
  Lightbulb,
} from 'lucide-react';
import Card from '../common/Card';

const SkillIntelligenceCard = ({ skillIntelligence = {} }) => {
  const [activeTab, setActiveTab] = useState('strong');

  const {
    strongSkills = [],
    skillsToImprove = [],
    missingRequiredSkills = [],
    frequentlyRequiredSkills = [],
    recentlyImprovedSkills = [],
    totalStrongSkills = 0,
    totalSkillsToImprove = 0,
    totalMissingSkills = 0,
  } = skillIntelligence;

  const tabs = [
    {
      id: 'strong',
      label: 'Strong Skills',
      count: totalStrongSkills || strongSkills.length,
      icon: CheckCircle2,
      badgeColor: 'bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60',
    },
    {
      id: 'improve',
      label: 'Needs Improvement',
      count: totalSkillsToImprove || skillsToImprove.length,
      icon: AlertTriangle,
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
    {
      id: 'missing',
      label: 'Missing Required',
      count: totalMissingSkills || missingRequiredSkills.length,
      icon: AlertTriangle,
      badgeColor: 'bg-red-50 text-brand-danger border border-red-200',
    },
    {
      id: 'market',
      label: 'Frequently Required',
      count: frequentlyRequiredSkills.length,
      icon: Flame,
      badgeColor: 'bg-brand-bg text-brand-charcoal border border-brand-border',
    },
    {
      id: 'roadmap',
      label: 'Recently Improved',
      count: recentlyImprovedSkills.length,
      icon: Clock,
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
  ];

  // Helper to extract skill name safely across string or object format
  const getSkillName = (s) => {
    if (!s) return 'Skill';
    if (typeof s === 'string') return s;
    return s.skillName || s.name || s.skill || s.topic || 'Skill';
  };

  // Helper to determine status badge and color
  const getSkillBadge = (skill, tabId) => {
    if (!skill) return { label: 'Verified', style: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60' };

    const rawStatus = skill.currentStatus || skill.status;

    if (tabId === 'strong') {
      if (rawStatus === 'Interview-Demonstrated Skill') {
        return { label: 'Demonstrated', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      }
      if (rawStatus === 'Job-Matched Skill') {
        return { label: 'Job Matched', style: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60' };
      }
      return { label: 'Verified', style: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60' };
    }

    if (tabId === 'improve') {
      if (skill.priority === 'High') {
        return { label: 'High Priority', style: 'bg-amber-50 text-amber-800 border-amber-200' };
      }
      return { label: rawStatus || 'Needs Practice', style: 'bg-amber-50 text-amber-800 border-amber-200' };
    }

    if (tabId === 'missing') {
      if (skill.priority === 'High') {
        return { label: 'Required Skill', style: 'bg-red-50 text-brand-danger border-red-200' };
      }
      return { label: rawStatus || 'Missing Required', style: 'bg-red-50 text-brand-danger border-red-200' };
    }

    if (tabId === 'market') {
      if (skill.isPossessed) {
        return { label: 'In Your Profile', style: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60' };
      }
      return {
        label: `${skill.demandLevel || 'High'} Demand`,
        style: 'bg-brand-bg text-brand-charcoal border-brand-border',
      };
    }

    if (tabId === 'roadmap') {
      return { label: 'Milestone Done', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }

    return { label: 'Verified', style: 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60' };
  };

  // Helper to extract description or evidence
  const getSkillEvidence = (skill, tabId) => {
    if (!skill) return '';
    if (typeof skill === 'string') return 'Identified in your career profile.';

    if (skill.evidence) return skill.evidence;
    if (skill.description) return skill.description;

    if (tabId === 'strong') {
      return 'Found in your resume and validated for your target roles.';
    }
    if (tabId === 'improve') {
      return skill.recommendedAction || 'Recommended to strengthen through practice.';
    }
    if (tabId === 'missing') {
      return 'Flagged as required for your target job descriptions.';
    }
    if (tabId === 'market') {
      return skill.occurrenceCount
        ? `Appears in ${skill.occurrenceCount} saved job description${skill.occurrenceCount === 1 ? '' : 's'}.`
        : 'Frequently requested across top industry roles.';
    }
    if (tabId === 'roadmap') {
      return 'Completed through your weekly learning roadmaps.';
    }
    return '';
  };

  // Helper to get source icon
  const getSourceIcon = (source) => {
    const s = (source || '').toLowerCase();
    if (s.includes('resume')) return FileText;
    if (s.includes('interview')) return MessageSquareCode;
    if (s.includes('job') || s.includes('market')) return Briefcase;
    if (s.includes('roadmap') || s.includes('learning')) return Map;
    return Cpu;
  };

  const renderEmptyState = () => {
    const emptyConfig = {
      strong: {
        title: 'No Verified Skills Yet',
        desc: 'Upload your resume or complete a mock interview to display your verified technical competencies.',
      },
      improve: {
        title: 'No Skills Flagged for Improvement',
        desc: 'As you practice mock interviews and run job matches, concepts requiring review will appear here.',
      },
      missing: {
        title: 'No Missing Required Skills',
        desc: 'Compare your resume with target job descriptions to identify any missing technical requirements.',
      },
      market: {
        title: 'No Job Market Data Available',
        desc: 'Save and analyze target job descriptions to see which skills are frequently requested in the market.',
      },
      roadmap: {
        title: 'No Completed Roadmaps Yet',
        desc: 'Check off weekly learning roadmap modules as you study to track your skill improvements here.',
      },
    };

    const cfg = emptyConfig[activeTab] || emptyConfig.strong;

    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-muted flex items-center justify-center mx-auto">
          <Cpu className="w-5 h-5" />
        </div>
        <p className="text-xs font-heading font-semibold text-brand-charcoal">{cfg.title}</p>
        <p className="text-[11px] text-brand-muted max-w-sm mx-auto leading-relaxed">
          {cfg.desc}
        </p>
      </div>
    );
  };

  const renderActiveList = () => {
    let list = [];
    if (activeTab === 'strong') list = strongSkills;
    if (activeTab === 'improve') list = skillsToImprove;
    if (activeTab === 'missing') list = missingRequiredSkills;
    if (activeTab === 'market') list = frequentlyRequiredSkills;
    if (activeTab === 'roadmap') list = recentlyImprovedSkills;

    const safeList = (list || []).filter(Boolean);

    if (safeList.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {safeList.map((skill, idx) => {
          const name = getSkillName(skill);
          const badge = getSkillBadge(skill, activeTab);
          const evidence = getSkillEvidence(skill, activeTab);
          const source = skill.source || skill.relatedTargetRole || (activeTab === 'market' ? 'Market Demand' : null);
          const SourceIcon = getSourceIcon(source);
          const actionTip = activeTab !== 'strong' && skill.recommendedAction ? skill.recommendedAction : null;

          return (
            <div
              key={`${name}-${idx}`}
              className="p-4 rounded-2xl bg-white border border-brand-border/80 hover:border-brand-primary/40 hover:shadow-soft-xs transition-all duration-150 flex flex-col justify-between space-y-3"
            >
              {/* Header: Skill Name & Category Badge */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-heading font-bold text-brand-charcoal leading-snug break-words">
                    {name}
                  </h4>
                  <span
                    className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Evidence / Reason Description */}
                {evidence && (
                  <p className="text-xs text-brand-slate leading-relaxed font-sans pt-0.5">
                    {evidence}
                  </p>
                )}
              </div>

              {/* Action Tip if present (for Needs Improvement, Missing, Market) */}
              {actionTip && actionTip !== evidence && (
                <div className="text-[11px] text-brand-muted bg-brand-bg/80 p-2 rounded-xl border border-brand-border/60 flex items-start gap-1.5 leading-snug">
                  <Lightbulb className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{actionTip}</span>
                </div>
              )}

              {/* Footer Meta: Source / Target Context */}
              {source && (
                <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                  <span className="flex items-center gap-1.5 font-medium truncate">
                    <SourceIcon className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                    <span className="truncate">{source}</span>
                  </span>
                  {skill.occurrenceCount ? (
                    <span className="text-[10px] font-heading font-bold text-brand-primary bg-brand-forestLight px-1.5 py-0.5 rounded border border-brand-sageBorder/40">
                      {skill.occurrenceCount} {skill.occurrenceCount === 1 ? 'Job' : 'Jobs'}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-brand-border p-5 sm:p-6 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Unified Skill Intelligence
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Your skills aggregated across resume parsing, target job descriptions, and mock interviews.
          </p>
        </div>
      </div>

      {/* Five Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-brand-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-heading font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-soft-xs'
                  : 'bg-white text-brand-slate hover:bg-brand-bg border border-brand-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : tab.badgeColor
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">{renderActiveList()}</div>
    </Card>
  );
};

export default SkillIntelligenceCard;
