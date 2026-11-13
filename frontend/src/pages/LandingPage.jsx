import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  Briefcase,
  Target,
  Compass,
  MessageSquareCode,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import useAuth from '../hooks/useAuth';

const features = [
  {
    icon: FileCheck2,
    title: 'Resume Intelligence',
    description: 'Deep automated structural review, keyword alignment, and ATS compatibility scoring tailored to your target industry.',
    badge: 'Phase 2 Preview',
  },
  {
    icon: Briefcase,
    title: 'Intelligent Job Matching',
    description: 'Smart semantic matching algorithms connecting your verified competencies to high-signal employment opportunities.',
    badge: 'Phase 3 Preview',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description: 'Pinpoint precise technical and leadership gaps between your current trajectory and senior target roles.',
    badge: 'Phase 4 Preview',
  },
  {
    icon: Compass,
    title: 'AI Career Guidance',
    description: 'Personalized step-by-step career path projections based on macroeconomic hiring trends and industry data.',
    badge: 'Phase 5 Preview',
  },
  {
    icon: MessageSquareCode,
    title: 'Interview Preparation',
    description: 'Interactive AI-driven behavioral and technical simulation sessions designed for realistic interview practice.',
    badge: 'Phase 6 Preview',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Register securely in seconds with encrypted credentials and seamless session management.',
  },
  {
    number: '02',
    title: 'Build Your Profile',
    description: 'Configure your professional identity and foundational profile preferences with zero friction.',
  },
  {
    number: '03',
    title: 'Discover Your Career Potential',
    description: 'Unlock future AI analytics, automated resume intelligence, and precision career recommendations.',
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 1 Live — Foundation & Authentication
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Build Your Career <br className="hidden sm:inline" />
                <span className="text-brand-primary">With Intelligence.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                CareerLens AI empowers modern job seekers with advanced AI analytics, deep resume intelligence, and precision skill mapping.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    icon={ArrowRight}
                    onClick={() => navigate('/dashboard')}
                  >
                    Open Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      icon={ArrowRight}
                      onClick={() => navigate('/register')}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      Sign In to Account
                    </Button>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Secure JWT & HTTP-Only Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>MongoDB Atlas Integration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>FastAPI Microservice Ready</span>
                </div>
              </div>
            </div>

            {/* Right Graphic / Interactive UI Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-primary to-sky-400 opacity-20 blur-xl" />

                {/* Dashboard Card Preview */}
                <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden p-6 space-y-6">
                  {/* Top Bar of card */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white font-bold text-sm">
                        CL
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">CareerLens Dashboard</div>
                        <div className="text-xs text-slate-400">Phase 1 Architecture</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      System Online
                    </span>
                  </div>

                  {/* Microservice Status Preview */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 text-brand-primary" />
                        <div>
                          <div className="text-xs font-semibold text-slate-700">Express Main Backend</div>
                          <div className="text-[11px] text-slate-400">JWT & MongoDB Atlas Connected</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-emerald-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Port 5000
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-sky-600" />
                        <div>
                          <div className="text-xs font-semibold text-slate-700">FastAPI AI Microservice</div>
                          <div className="text-[11px] text-slate-400">Health Endpoint Active</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-emerald-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Port 8000
                      </span>
                    </div>
                  </div>

                  {/* Sample Metric */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">Profile Readiness</span>
                      <span className="text-xs font-bold text-sky-400">100% Secure</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-sky-400 h-2 rounded-full w-full" />
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Ready for Phase 2 Resume Analysis Engine
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section id="features" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Upcoming Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Future Platform Previews
            </h3>
            <p className="text-slate-600 text-base">
              Here is what CareerLens AI is designed to unlock across upcoming development phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  hoverEffect
                  className="flex flex-col justify-between border-slate-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-brand-primary/10">
                        <Icon className="w-5 h-5 text-brand-primary" />
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {feature.badge}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Feature Preview</span>
                    <span className="text-brand-primary font-medium">Coming in Roadmap</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Simple Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">
              How CareerLens AI Works
            </h3>
            <p className="text-slate-600 text-base">
              A structured and seamless journey from profile setup to AI-driven career acceleration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="text-3xl font-black text-brand-primary/30 font-mono">
                  {step.number}
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
            About the Architecture
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            Engineered for Modern Enterprise Scale
          </h3>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl mx-auto">
            CareerLens AI couples a resilient React frontend with an Express authentication core and a Python FastAPI service. Built on clean modular principles, secure HTTP-only cookies, and MongoDB Atlas.
          </p>
          <div className="pt-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

