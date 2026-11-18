import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileCheck2,
  Briefcase,
  Map,
  MessageSquareCode,
  CheckCircle2,
  Award,
  Layers,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const pillars = [
  {
    icon: FileCheck2,
    tag: 'Resume Intelligence',
    title: 'Smart Resume Analysis',
    description:
      'Upload your resume and get an ATS score, identify your skills, and find areas where you can improve.',
    metric: 'Resume Score & Feedback',
  },
  {
    icon: Briefcase,
    tag: 'Job Compatibility',
    title: 'Job Matching',
    description:
      'Compare your resume with a job description to see which skills match and which skills you still need to learn.',
    metric: 'Find Your Skill Gaps',
  },
  {
    icon: MessageSquareCode,
    tag: 'Interview Preparation',
    title: 'AI Mock Interviews',
    description:
      'Practice interview questions for different job roles and get feedback on your answers.',
    metric: 'Practice & Improve',
  },
  {
    icon: Map,
    tag: 'Learning Pathways',
    title: 'Personalized Learning Roadmaps',
    description:
      'Follow a simple 4-week learning plan to improve your skills and prepare for your target job.',
    metric: 'Track Your Progress',
  },
  {
    icon: Layers,
    tag: 'Skill Intelligence',
    title: 'Skill Tracking',
    description:
      'Understand your strong skills, identify missing skills, and track what you need to improve.',
    metric: 'Understand Your Skills',
  },
  {
    icon: Award,
    tag: 'Holistic Readiness',
    title: 'Career Readiness Score',
    description:
      'Get an overall score based on your resume, job matches, skills, learning progress, and interview performance.',
    metric: 'Track Your Preparation',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Resume',
    description:
      'Drop your existing PDF resume into the workspace. We extract your skills, education, and experience without losing any details.',
  },
  {
    number: '02',
    title: 'Match with Target Jobs',
    description:
      'Pick a target role or paste a job description. See matched skills, discover what you are missing, and get a 4-week roadmap.',
  },
  {
    number: '03',
    title: 'Practice Mock Interviews',
    description:
      'Answer realistic interview questions. Get immediate feedback, ideal sample answers, and watch your Readiness Score rise.',
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-slate">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16 border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forestLight border border-brand-sageBorder/60 text-brand-primary text-xs font-heading font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              Comprehensive Student & Fresher Career Platform
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-brand-charcoal tracking-tight leading-[1.12]">
              Elevate Your Career Trajectory{' '}
              <span className="font-serif italic font-normal text-brand-primary block sm:inline">
                With Precision AI.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-brand-slate max-w-2xl mx-auto leading-relaxed">
              CareerLens AI unifies ATS resume intelligence, job compatibility gap analysis, structured learning roadmaps, and realistic mock interview simulations in one refined workspace.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => navigate('/dashboard')}
                >
                  Enter Your Workspace
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    onClick={() => navigate('/register')}
                  >
                    Start Free Career Assessment
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/login')}
                  >
                    Candidate Sign In
                  </Button>
                </>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-5 sm:gap-6 text-xs text-brand-muted font-heading flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                Free for Students
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                100% Private & Secure
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                Instant AI Feedback
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Six Career Development Pillars Section */}
      <section id="features" className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-8 sm:mb-10">
            <span className="text-xs font-heading font-bold tracking-wider text-brand-primary uppercase">
              Six Career Development Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-charcoal tracking-tight">
              Everything You Need to Prepare for Your Career
            </h2>
            <p className="text-xs sm:text-sm text-brand-slate">
              Designed specifically for college students and freshers to build confidence and land their first job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 sm:p-6 rounded-2xl bg-brand-bg border border-brand-border flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-primary shadow-soft-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted block mb-1">
                        {pillar.tag}
                      </span>
                      <h3 className="text-base sm:text-lg font-heading font-bold text-brand-charcoal">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-brand-border/70 text-xs">
                    <span className="font-heading font-semibold text-brand-primary">
                      {pillar.metric}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-10 lg:py-14 bg-brand-bg border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-8 sm:mb-10">
            <span className="text-xs font-heading font-bold tracking-wider text-brand-primary uppercase">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-charcoal tracking-tight">
              From Raw Resume to Confident Candidate
            </h2>
            <p className="text-xs sm:text-sm text-brand-slate">
              A structured 3-step pipeline transforming candidate preparation into measurable readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-brand-border shadow-soft relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-2xl sm:text-3xl font-serif italic text-brand-primary font-normal">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-heading font-bold text-brand-charcoal">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-brand-border/50 text-xs font-heading font-semibold text-brand-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  Verified Pipeline Step
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Readiness Index Callout */}
      <section id="readiness" className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-brand-charcoal text-white p-7 sm:p-10 lg:p-12 relative overflow-hidden shadow-soft-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
                  <Award className="w-3.5 h-3.5 text-brand-forestLight" />
                  Fair Scoring System
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white leading-tight">
                  No Zero-Score Penalties.{' '}
                  <span className="font-serif italic text-brand-forestLight font-normal block sm:inline">
                    Fair, Progressive Evaluation.
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#B8C2B8] leading-relaxed max-w-xl">
                  New users or candidates taking their first steps are never penalized with 0% scores on unattempted modules. Our mathematical formula dynamically redistributes category weights among your active data points.
                </p>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={ArrowRight}
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                    className="bg-brand-forestLight text-brand-primary hover:bg-white"
                  >
                    {isAuthenticated ? 'View Readiness Score' : 'Calculate Your Score'}
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#A0ACA0]">
                  5 Foundation Pillars
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white font-medium">Job Compatibility Match</span>
                    <span className="font-heading font-bold text-brand-forestLight">25% Weight</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white font-medium">ATS Resume Quality</span>
                    <span className="font-heading font-bold text-brand-forestLight">20% Weight</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white font-medium">Technical Skills Ratio</span>
                    <span className="font-heading font-bold text-brand-forestLight">20% Weight</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white font-medium">Mock Interview Performance</span>
                    <span className="font-heading font-bold text-brand-forestLight">20% Weight</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Learning Roadmap Progress</span>
                    <span className="font-heading font-bold text-brand-forestLight">15% Weight</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
