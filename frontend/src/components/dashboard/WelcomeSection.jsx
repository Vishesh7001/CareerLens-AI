import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, FileText, MessageSquareCode, Compass } from 'lucide-react';
import Button from '../common/Button';

const WelcomeSection = ({ user, careerReadiness, nextActionUrl = '/mock-interview' }) => {
  const navigate = useNavigate();

  const getReadinessGreeting = (score) => {
    if (score >= 80) return 'You are in the top tier of interview readiness!';
    if (score >= 65) return 'Great progress! A few focused milestones will maximize your competitiveness.';
    if (score >= 40) return 'You are building strong career foundations. Keep completing weekly goals.';
    return 'Welcome to CareerLens AI. Follow your personalized roadmap to build career readiness.';
  };

  const readinessScore = careerReadiness?.overallScore;
  const progressText = readinessScore !== null ? getReadinessGreeting(readinessScore) : 'Complete career activities below to calculate your real-time Career Readiness score.';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-navy to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-700/50">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI-Powered Career Intelligence Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Welcome back, {user?.fullName || 'Student'}!
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {progressText}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => navigate(nextActionUrl)}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold border-0 shadow-lg shadow-sky-500/20"
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
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
            >
              Manage Resume
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={MessageSquareCode}
              onClick={() => navigate('/mock-interview')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
            >
              Mock Interview
            </Button>
          </div>
        </div>

        {/* Quick Readiness Dial Indicator */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[200px] flex flex-col items-center">
          <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
            Career Readiness
          </span>
          <div className="my-2">
            {readinessScore !== null ? (
              <div className="text-3xl sm:text-4xl font-black text-white">
                {readinessScore}
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-300 py-2">
                In Progress
              </div>
            )}
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white">
            {careerReadiness?.classification || 'Getting Started'}
          </span>
          <span className="text-[10px] text-slate-300 mt-2">
            {careerReadiness?.availableCategoriesCount || 0} of 5 pillars active
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
