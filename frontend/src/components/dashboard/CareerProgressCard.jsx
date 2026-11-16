import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Cpu,
  Map,
  MessageSquareCode,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Card from '../common/Card';

const CareerProgressCard = ({ stats = {}, careerReadiness = {} }) => {
  const navigate = useNavigate();

  const {
    hasResume = false,
    latestResumeScore = null,
    totalJobMatches = 0,
    roadmapProgress = 0,
    completedInterviews = 0,
    averageInterviewScore = null,
  } = stats;

  const pillars = [
    {
      id: 'resume',
      title: 'Resume Development',
      description: hasResume
        ? `Uploaded (${latestResumeScore !== null ? `ATS Score: ${latestResumeScore}%` : 'Needs analysis'})`
        : 'No resume uploaded yet',
      status: latestResumeScore >= 70 ? 'Ready' : hasResume ? 'In Progress' : 'Action Needed',
      statusColor: latestResumeScore >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : hasResume ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-amber-700 bg-amber-50 border-amber-200',
      icon: FileText,
      link: hasResume ? '/analysis' : '/dashboard#resume-section',
      actionText: hasResume ? 'View Analysis' : 'Upload Resume',
    },
    {
      id: 'jobMatching',
      title: 'Job Matching',
      description: totalJobMatches > 0
        ? `${totalJobMatches} target role${totalJobMatches === 1 ? '' : 's'} matched against your profile`
        : 'No job descriptions matched yet',
      status: totalJobMatches >= 2 ? 'Active' : totalJobMatches === 1 ? 'In Progress' : 'Action Needed',
      statusColor: totalJobMatches >= 2 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : totalJobMatches === 1 ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-amber-700 bg-amber-50 border-amber-200',
      icon: Briefcase,
      link: '/job-matching',
      actionText: totalJobMatches > 0 ? 'Match Details' : 'Match First Job',
    },
    {
      id: 'skills',
      title: 'Technical Skills',
      description: careerReadiness?.categoryScores?.technicalSkills?.available
        ? `${careerReadiness.categoryScores.technicalSkills.score}% skill alignment achieved`
        : 'Skills alignment pending activity',
      status: careerReadiness?.categoryScores?.technicalSkills?.score >= 70 ? 'Strong' : 'Developing',
      statusColor: careerReadiness?.categoryScores?.technicalSkills?.score >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-sky-700 bg-sky-50 border-sky-200',
      icon: Cpu,
      link: '/career-recommendations',
      actionText: 'Explore Roles',
    },
    {
      id: 'roadmap',
      title: 'Learning Roadmaps',
      description: roadmapProgress > 0
        ? `${roadmapProgress}% milestone completion across weekly modules`
        : 'Generate or start 4-week roadmap',
      status: roadmapProgress >= 75 ? 'Advanced' : roadmapProgress > 0 ? 'In Progress' : 'Not Started',
      statusColor: roadmapProgress >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : roadmapProgress > 0 ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-slate-700 bg-slate-100 border-slate-200',
      icon: Map,
      link: '/roadmaps',
      actionText: roadmapProgress > 0 ? 'Continue Roadmap' : 'Create Roadmap',
    },
    {
      id: 'interviews',
      title: 'Interview Preparation',
      description: completedInterviews > 0
        ? `${completedInterviews} completed session${completedInterviews === 1 ? '' : 's'} (${averageInterviewScore || 0}% avg)`
        : 'No mock interviews completed yet',
      status: averageInterviewScore >= 80 ? 'Interview Ready' : completedInterviews > 0 ? 'Practicing' : 'Action Needed',
      statusColor: averageInterviewScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : completedInterviews > 0 ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-amber-700 bg-amber-50 border-amber-200',
      icon: MessageSquareCode,
      link: completedInterviews > 0 ? '/interview-history' : '/mock-interview',
      actionText: completedInterviews > 0 ? 'View Reports' : 'Start Mock Interview',
    },
  ];

  return (
    <Card className="border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Career Development Pillars
          </h3>
          <p className="text-xs text-slate-500">
            Holistic progress tracking across your student career preparation journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-primary shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${pillar.statusColor}`}
                  >
                    {pillar.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(pillar.link)}
                className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1 pt-1 text-left"
              >
                <span>{pillar.actionText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CareerProgressCard;
