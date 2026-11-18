import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, FileText, MessageSquareCode, Award, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

const WelcomeSection = ({ user, careerReadiness, nextActionUrl = '/mock-interview' }) => {
  const navigate = useNavigate();

  const getReadinessGreeting = (score) => {
    if (score >= 80) return 'You are currently in the top tier of interview readiness.';
    if (score >= 65) return 'Solid momentum! A few focused milestones will maximize your competitiveness.';
    if (score >= 40) return 'You are building strong career foundations. Keep completing active roadmap milestones.';
    return 'Welcome to CareerLens AI. Follow your tailored career intelligence steps below.';
  };

  const readinessScore = careerReadiness?.overallScore;
  const progressText = readinessScore !== null ? getReadinessGreeting(readinessScore) : 'Complete career activities below to calculate your dynamic Career Readiness score.';

  return (
    <div className="relative overflow-hidden bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md border border-brand-charcoal">
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Target className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>AI Career Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight text-white leading-tight">
            Welcome back,{' '}
            <span className="font-serif italic font-normal text-brand-forestLight">
              {user?.fullName?.split(' ')[0] || 'Candidate'}
            </span>
          </h1>

          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed max-w-xl font-sans">
            {progressText}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => navigate(nextActionUrl)}
              className="bg-brand-primary text-white hover:bg-brand-primaryHover font-heading font-semibold shadow-soft-xs border border-brand-sageBorder/30"
            >
              Continue Preparation
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={FileText}
              onClick={() => {
                const el = document.getElementById('resume-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/dashboard#resume-section');
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-heading font-medium"
            >
              Manage Resume
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={MessageSquareCode}
              onClick={() => navigate('/mock-interview')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-heading font-medium"
            >
              Mock Interview
            </Button>
          </div>
        </div>

        {/* Quick Readiness Dial Indicator */}
        <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 text-center min-w-[220px] flex flex-col items-center shadow-soft-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-heading font-bold text-[#A4B0A4] uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Career Readiness</span>
          </div>

          <div className="my-1">
            {readinessScore !== null ? (
              <div className="text-4xl font-heading font-black text-white">
                {readinessScore}
                <span className="text-base font-normal text-[#8A968A]">/100</span>
              </div>
            ) : (
              <div className="text-xs font-heading font-bold text-[#B2BCB2] py-2">
                In Progress
              </div>
            )}
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-heading font-semibold bg-white/10 text-brand-forestLight mt-1">
            {careerReadiness?.classification || 'Getting Started'}
          </span>

          <span className="text-[11px] text-[#8A968A] mt-2.5 font-medium">
            {careerReadiness?.availableCategoriesCount || 0} of 5 pillars active
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
