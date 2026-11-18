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
      iconBg: 'bg-brand-forestLight text-brand-primary',
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
      iconBg: 'bg-brand-bg text-brand-charcoal',
      action: () => navigate('/analysis'),
      actionText: latestResumeScore !== null ? 'View Report' : 'Analyze Now',
      isGood: latestResumeScore >= 70,
    },
    {
      id: 'jobMatches',
      title: 'Job Matches',
      value: `${totalJobMatches} Role${totalJobMatches === 1 ? '' : 's'}`,
      subtext: totalJobMatches > 0 ? 'Rubric compatibility run' : 'Match target jobs',
      icon: Briefcase,
      iconBg: 'bg-brand-bg text-brand-primary',
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
      iconBg: 'bg-brand-bg text-brand-charcoal',
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
      iconBg: 'bg-amber-50/80 text-amber-800',
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
      iconBg: 'bg-brand-forestLight text-brand-primary',
      action: () => navigate('/roadmaps'),
      actionText: 'Roadmap',
      isGood: roadmapProgress > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.id}
            className="p-5 flex flex-col justify-between hover:border-brand-borderDark hover:shadow-soft-md transition-all duration-200 group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-heading font-semibold text-brand-muted uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-heading font-bold text-brand-charcoal tracking-tight">
                {kpi.value}
              </div>

              <p className="text-xs text-brand-muted mt-1 truncate">
                {kpi.subtext}
              </p>
            </div>

            <div className="mt-4 pt-3.5 border-t border-brand-border/60 flex items-center justify-between">
              <button
                type="button"
                onClick={kpi.action}
                className="text-xs font-heading font-semibold text-brand-primary group-hover:text-brand-primaryHover flex items-center gap-1 transition-colors"
              >
                <span>{kpi.actionText}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <span
                className={`w-2 h-2 rounded-full ${
                  kpi.isGood ? 'bg-brand-primary' : 'bg-brand-borderDark'
                }`}
                title={kpi.isGood ? 'Positive progress' : 'Action needed'}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewStats;
