import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
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
      count: totalStrongSkills,
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'improve',
      label: 'Skills to Improve',
      count: totalSkillsToImprove,
      icon: AlertTriangle,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'missing',
      label: 'Missing Required',
      count: totalMissingSkills,
      icon: AlertTriangle,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'market',
      label: 'Frequently Required',
      count: frequentlyRequiredSkills.length,
      icon: Flame,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'roadmap',
      label: 'Recently Improved',
      count: recentlyImprovedSkills.length,
      icon: Clock,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Job-Matched Skill':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Interview-Demonstrated Skill':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Verified on Resume':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Required for Target Job':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Roadmap Milestone Completed':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderActiveList = () => {
    let list = [];
    if (activeTab === 'strong') list = strongSkills;
    if (activeTab === 'improve') list = skillsToImprove;
    if (activeTab === 'missing') list = missingRequiredSkills;
    if (activeTab === 'market') list = frequentlyRequiredSkills;
    if (activeTab === 'roadmap') list = recentlyImprovedSkills;

    if (list.length === 0) {
      return (
        <div className="py-10 text-center space-y-2">
          <Cpu className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No skill records in this category</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Upload resumes, run job matches, or take mock interviews to populate your skill intelligence.
          </p>
        </div>
      );
    }

    if (activeTab === 'market') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {list.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{item.skillName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {item.demandLevel} Demand
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Required in <strong>{item.occurrenceCount}</strong> of your saved target jobs.
                </div>
              </div>
              <p className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-200/60">
                {item.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900">{item.skillName}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    item.currentStatus
                  )}`}
                >
                  {item.currentStatus}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>Source: <strong className="text-slate-600">{item.source}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-slate-600">{item.relatedTargetRole}</strong></span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.evidence}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-brand-primary font-medium flex items-center gap-1">
              <span>Next action: {item.recommendedAction}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-slate-200 p-6 space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-slate-900">
              Unified Skill Intelligence
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-phase skill synthesis distinguishing resume mentions, job matches, and interview mastery
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : tab.badgeColor
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-1">{renderActiveList()}</div>
    </Card>
  );
};

export default SkillIntelligenceCard;
