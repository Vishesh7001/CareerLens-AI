import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Cpu,
  Map,
  MessageSquareCode,
  ArrowRight,
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

  const techScore = careerReadiness?.categoryScores?.technicalSkills?.score;
  const techAvailable = Boolean(careerReadiness?.categoryScores?.technicalSkills?.available && typeof techScore === 'number');

  const pillars = [
    {
      id: 'resume',
      title: 'Resume Quality',
      description: hasResume
        ? latestResumeScore !== null
          ? `ATS score: ${latestResumeScore}% · Based on your uploaded resume`
          : 'Resume uploaded · Needs analysis'
        : 'Upload your resume to check your ATS score and get feedback',
      status: latestResumeScore >= 70 ? 'Strong' : hasResume ? 'In Progress' : 'Action Needed',
      statusColor:
        latestResumeScore >= 70
          ? 'text-brand-primary bg-brand-forestLight border-brand-sageBorder/60'
          : hasResume
          ? 'text-brand-charcoal bg-brand-bg border-brand-border'
          : 'text-amber-800 bg-amber-50 border-amber-200',
      icon: FileText,
      link: hasResume ? '/analysis' : '/dashboard#resume-section',
      actionText: hasResume ? 'View Analysis' : 'Upload Resume',
    },
    {
      id: 'jobMatching',
      title: 'Job Compatibility',
      description:
        totalJobMatches > 0
          ? `${totalJobMatches} target role${totalJobMatches === 1 ? '' : 's'} matched against your profile`
          : 'Compare your resume with target job descriptions',
      status: totalJobMatches >= 2 ? 'Active' : totalJobMatches === 1 ? 'In Progress' : 'Action Needed',
      statusColor:
        totalJobMatches >= 2
          ? 'text-brand-primary bg-brand-forestLight border-brand-sageBorder/60'
          : totalJobMatches === 1
          ? 'text-brand-charcoal bg-brand-bg border-brand-border'
          : 'text-amber-800 bg-amber-50 border-amber-200',
      icon: Briefcase,
      link: '/job-matching',
      actionText: totalJobMatches > 0 ? 'Match Details' : 'Match First Job',
    },
    {
      id: 'skills',
      title: 'Technical Skills',
      description: techAvailable
        ? `${techScore}% skills alignment with your target roles`
        : 'Review your technical skills against job expectations',
      status: techAvailable ? (techScore >= 70 ? 'Strong' : 'Developing') : 'Action Needed',
      statusColor:
        techAvailable && techScore >= 70
          ? 'text-brand-primary bg-brand-forestLight border-brand-sageBorder/60'
          : techAvailable
          ? 'text-brand-charcoal bg-brand-bg border-brand-border'
          : 'text-amber-800 bg-amber-50 border-amber-200',
      icon: Cpu,
      link: '/career-recommendations',
      actionText: 'Explore Roles',
    },
    {
      id: 'roadmap',
      title: 'Learning Progress',
      description:
        roadmapProgress > 0
          ? `${roadmapProgress}% of weekly learning milestones completed`
          : 'Follow step-by-step roadmaps to build missing skills',
      status: roadmapProgress >= 75 ? 'Advanced' : roadmapProgress > 0 ? 'In Progress' : 'Not Started',
      statusColor:
        roadmapProgress >= 75
          ? 'text-brand-primary bg-brand-forestLight border-brand-sageBorder/60'
          : roadmapProgress > 0
          ? 'text-brand-charcoal bg-brand-bg border-brand-border'
          : 'text-brand-muted bg-brand-bg border-brand-border',
      icon: Map,
      link: '/roadmaps',
      actionText: roadmapProgress > 0 ? 'Continue Roadmap' : 'Create Roadmap',
    },
    {
      id: 'interviews',
      title: 'Interview Performance',
      description:
        completedInterviews > 0
          ? `${completedInterviews} interview${completedInterviews === 1 ? '' : 's'} completed (${averageInterviewScore || 0}% avg score)`
          : 'Practice real mock interviews and improve your answers',
      status:
        averageInterviewScore >= 80
          ? 'Strong'
          : completedInterviews > 0
          ? 'Practicing'
          : 'Action Needed',
      statusColor:
        averageInterviewScore >= 80
          ? 'text-brand-primary bg-brand-forestLight border-brand-sageBorder/60'
          : completedInterviews > 0
          ? 'text-brand-charcoal bg-brand-bg border-brand-border'
          : 'text-amber-800 bg-amber-50 border-amber-200',
      icon: MessageSquareCode,
      link: completedInterviews > 0 ? '/interview-history' : '/mock-interview',
      actionText: completedInterviews > 0 ? 'View Reports' : 'Start Mock Interview',
    },
  ];

  return (
    <Card className="border-brand-border p-5 sm:p-6 space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
        <div>
          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            Your Career Progress
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Track your progress in different areas of career preparation.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="p-3 sm:p-3.5 rounded-xl bg-brand-bg border border-brand-border/70 hover:border-brand-borderDark transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 group"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-brand-border text-brand-primary flex-shrink-0 shadow-soft-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-heading font-bold text-brand-charcoal">
                      {pillar.title}
                    </h4>
                    <span
                      className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full border ${pillar.statusColor}`}
                    >
                      {pillar.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {pillar.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pillar.link.includes('#')) {
                    const el = document.getElementById('resume-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else navigate(pillar.link);
                  } else {
                    navigate(pillar.link);
                  }
                }}
                className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1.5 self-end sm:self-center transition-colors group-hover:underline flex-shrink-0"
              >
                <span>{pillar.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CareerProgressCard;
