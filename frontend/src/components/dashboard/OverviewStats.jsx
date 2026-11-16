import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  MessageSquareCode,
  Award,
  Map,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../common/Card';

const OverviewStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const {
    totalResumes = 0,
    hasResume = false,
    resumeFileName = null,
    totalJobMatches = 0,
    totalInterviews = 0,
    completedInterviews = 0,
    averageInterviewScore = null,
    roadmapProgress = 0,
    totalRoadmapModules = 0,
    completedRoadmapModules = 0,
    latestResumeScore = null,
    latestResumeTargetRole = null,
  } = stats;

  const kpis = [
    {
      id: 'resumes',
      title: 'Resume Status',
      value: hasResume ? 'Active' : 'Missing',
      subtext: resumeFileName ? resumeFileName : 'Upload PDF resume',
      icon: FileText,
      iconBg: 'bg-emerald-50 text-emerald-600',
      action: () => {
        const el = document.getElementById('resume-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else navigate('/dashboard#resume-section');
      },
      actionText: hasResume ? 'Manage' : 'Upload',
      isGood: hasResume,
    },
    {
      id: 'resumeScore',
      title: 'Latest Resume Score',
      value: latestResumeScore !== null ? `${latestResumeScore}/100` : 'Not Analyzed',
      subtext: latestResumeTargetRole ? latestResumeTargetRole : 'Run ATS evaluation',
      icon: Sparkles,
      iconBg: 'bg-sky-50 text-sky-600',
      action: () => navigate('/analysis'),
      actionText: latestResumeScore !== null ? 'View Report' : 'Analyze Now',
      isGood: latestResumeScore >= 70,
    },
    {
      id: 'jobMatches',
      title: 'Job Matches',
      value: `${totalJobMatches} Role${totalJobMatches === 1 ? '' : 's'}`,
      subtext: totalJobMatches > 0 ? '5-pillar compatibility run' : 'Match target jobs',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-brand-primary',
      action: () => navigate('/job-matching'),
      actionText: totalJobMatches > 0 ? 'View Matches' : 'Run Match',
      isGood: totalJobMatches > 0,
    },
    {
      id: 'interviews',
      title: 'Mock Interviews',
      value: `${totalInterviews} Session${totalInterviews === 1 ? '' : 's'}`,
      subtext: `${completedInterviews} completed sessions`,
      icon: MessageSquareCode,
      iconBg: 'bg-purple-50 text-purple-600',
      action: () => navigate(totalInterviews > 0 ? '/interview-history' : '/mock-interview'),
      actionText: totalInterviews > 0 ? 'History' : 'Start',
      isGood: completedInterviews > 0,
    },
    {
      id: 'interviewScore',
      title: 'Avg Interview Score',
      value: averageInterviewScore !== null ? `${averageInterviewScore}/100` : 'No Data',
      subtext: averageInterviewScore !== null ? 'Evaluated across rubrics' : 'Complete 1st session',
      icon: Award,
      iconBg: 'bg-amber-50 text-amber-600',
      action: () => navigate(completedInterviews > 0 ? '/interview-history' : '/mock-interview'),
      actionText: 'Details',
      isGood: averageInterviewScore >= 70,
    },
    {
      id: 'roadmap',
      title: 'Roadmap Progress',
      value: `${roadmapProgress}%`,
      subtext: `${completedRoadmapModules} of ${totalRoadmapModules} modules done`,
      icon: Map,
      iconBg: 'bg-teal-50 text-teal-600',
      action: () => navigate('/roadmaps'),
      actionText: 'Roadmap',
      isGood: roadmapProgress >= 50,
      showBar: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.id}
            className="p-4 sm:p-5 flex flex-col justify-between border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center flex-shrink-0 font-bold`}>
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={kpi.action}
                  className="text-[11px] font-semibold text-slate-400 hover:text-brand-primary flex items-center gap-0.5"
                  title={kpi.actionText}
                >
                  <span>{kpi.actionText}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
                  {kpi.value}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={kpi.subtext}>
                  {kpi.subtext}
                </p>
              </div>
            </div>

            {kpi.showBar && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, roadmapProgress))}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewStats;
