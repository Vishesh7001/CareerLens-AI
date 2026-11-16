import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Briefcase,
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ResumeSection from '../components/resume/ResumeSection';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 2 Resume Intelligence Live
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName || 'Professional'}!
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Your career platform is powered by secure authentication, automated PDF resume parsing, skill classification, and microservice connectivity.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={User}
            onClick={() => navigate('/profile')}
          >
            Manage Profile
          </Button>
        </div>
      </div>

      {/* Quick Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Auth Status */}
        <Card className="flex items-start gap-4 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Authentication
            </span>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Secure Session</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500">
              HTTP-only JWT verified with MongoDB Atlas
            </p>
          </div>
        </Card>

        {/* Card 2: Account Age */}
        <Card className="flex items-start gap-4 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Member Since
            </span>
            <div className="text-lg font-bold text-slate-900">
              {formatDate(user?.createdAt)}
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">
              {user?.email}
            </p>
          </div>
        </Card>

        {/* Card 3: Resume Intelligence */}
        <Card className="flex items-start gap-4 border-slate-200 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Resume Intelligence
            </span>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>PDF Parsing</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500">
              Rule-based skills & section extraction active
            </p>
          </div>
        </Card>
      </div>

      {/* Resume Management & Intelligence Section */}
      <ResumeSection />

      {/* Account Information & Phase 1 Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account Summary */}
        <Card className="lg:col-span-1 space-y-5 border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              Account Details
            </h3>
            <span className="text-xs text-brand-primary font-medium cursor-pointer" onClick={() => navigate('/profile')}>
              Edit
            </span>
          </div>

          <div className="space-y-3.5 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Full Name</span>
              <span className="font-semibold text-slate-800">{user?.fullName || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Email Address</span>
              <span className="font-medium text-slate-700">{user?.email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Unique User ID</span>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {user?.id || 'Active'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Account Role</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                Standard Candidate
              </span>
            </div>
          </div>
        </Card>

        {/* Right: Upcoming Features (Phase 2-6 Previews) */}
        <Card className="lg:col-span-2 space-y-4 border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Future Intelligence Capabilities
              </h3>
              <p className="text-xs text-slate-500">
                Modules slated for subsequent development phases
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Phase 2 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200/70 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Resume Intelligence
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated PDF parsing, categorized skill extraction, and candidate profiling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('resume-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-3 text-[11px] text-brand-primary font-semibold flex items-center gap-1 hover:underline text-left"
              >
                <span>Jump to Resume</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-indigo-50/40 border border-indigo-200/70 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <Briefcase className="w-4 h-4 text-brand-primary" />
                    Job Matching & Skill Gaps
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  5-pillar compatibility scoring (35/25/15/15/10) against employer job descriptions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/job-matching')}
                className="mt-3 text-[11px] text-brand-primary font-semibold flex items-center gap-1 hover:underline text-left"
              >
                <span>Launch Job Match</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-teal-50/40 border border-teal-200/70 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <Compass className="w-4 h-4 text-teal-600" />
                    Career Recommendations
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Data-backed entry-level career path matching across 12 tech domains for freshers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/career-recommendations')}
                className="mt-3 text-[11px] text-teal-700 font-semibold flex items-center gap-1 hover:underline text-left"
              >
                <span>Explore Roles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-sky-50/40 border border-sky-200/70 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Learning Roadmap
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Personalized 4-week practical milestone schedules with interactive progress tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/roadmaps')}
                className="mt-3 text-[11px] text-sky-700 font-semibold flex items-center gap-1 hover:underline text-left"
              >
                <span>View Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

