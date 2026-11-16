import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareCode,
  Sparkles,
  Layers,
  Compass,
  FileText,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Award,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import interviewService from '../services/interviewService';
import resumeService from '../services/resumeService';
import jobService from '../services/jobService';

const PREDEFINED_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Software Developer',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'Python Developer',
  'Java Developer',
  'DevOps Engineer',
  'Database Administrator',
  'Custom Role',
];

const INTERVIEW_TYPES = [
  {
    type: 'Technical Interview',
    desc: 'Core programming, algorithms, databases, APIs, frameworks, and architecture.',
  },
  {
    type: 'HR Interview',
    desc: 'Behavioral, teamwork, leadership, conflict resolution, and career motivation.',
  },
  {
    type: 'Mixed Interview',
    desc: 'Comprehensive combination of role-specific technical and behavioral questions.',
  },
];

const DIFFICULTIES = [
  { level: 'Beginner', desc: 'Foundational concepts and definitions' },
  { level: 'Intermediate', desc: 'Practical workflows, design, and mechanisms' },
  { level: 'Advanced', desc: 'Architecture, scalability, and deep internals' },
];

const QUESTION_COUNTS = [5, 10, 15];

const InterviewSetupPage = () => {
  const navigate = useNavigate();

  // Form states
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Resume & Job context states
  const [resume, setResume] = useState(null);
  const [useResume, setUseResume] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  // UI status states
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadContext = async () => {
      try {
        const [resumeRes, jobsRes] = await Promise.all([
          resumeService.getResume().catch(() => null),
          jobService.getJobs().catch(() => null),
        ]);

        if (!isMounted) return;

        if (resumeRes?.success && resumeRes.resume) {
          setResume(resumeRes.resume);
          setUseResume(true);
        } else {
          setUseResume(false);
        }

        if (jobsRes?.jobs) {
          setJobs(jobsRes.jobs);
        }
      } catch (err) {
        // Soft fallback for initial load
      } finally {
        if (isMounted) setIsLoadingInitial(false);
      }
    };

    loadContext();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'Custom Role' && !customRole.trim()) {
      setError('Please specify the name of your custom role.');
      return;
    }

    setIsStarting(true);

    try {
      const payload = {
        role: selectedRole,
        customRole: selectedRole === 'Custom Role' ? customRole.trim() : null,
        interviewType,
        difficulty,
        totalQuestions,
        resumeId: useResume && resume?._id ? resume._id : null,
        jobId: selectedJobId || null,
      };

      const res = await interviewService.createInterview(payload);
      if (res?.success && res.interview?._id) {
        navigate(`/mock-interview/${res.interview._id}`);
      } else {
        throw new Error(res?.message || 'Failed to initialize interview session.');
      }
    } catch (err) {
      setError(err.message || 'Unable to start mock interview. Please try again.');
      setIsStarting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading your candidate profile and mock interview settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium">
            <MessageSquareCode className="w-3.5 h-3.5" />
            Phase 5 AI Mock Interview System
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Configure Your Mock Interview
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Simulate realistic technical and HR interview rounds tailored to your target job role, difficulty level, and resume experience.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 self-start md:self-auto"
          onClick={() => navigate('/interview-history')}
        >
          View Interview History
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="space-y-6">
        {/* Module A1: Target Job Role Selection */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-primary" />
                1. Select Target Job Role
              </h3>
              <p className="text-xs text-slate-500">
                Choose the engineering or analyst role you want to practice for
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
            {PREDEFINED_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  selectedRole === role
                    ? 'border-brand-primary bg-sky-50 text-brand-navy shadow-xs ring-1 ring-brand-primary'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {selectedRole === 'Custom Role' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Custom Role Title *
              </label>
              <input
                type="text"
                required
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Cloud Security Architect, iOS Engineer, QA Automation"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
          )}
        </Card>

        {/* Module A2: Interview Type */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" />
              2. Interview Round Type
            </h3>
            <p className="text-xs text-slate-500">
              Select technical assessment, behavioral/HR round, or a mixed screen
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {INTERVIEW_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setInterviewType(t.type)}
                className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                  interviewType === t.type
                    ? 'border-brand-primary bg-sky-50 shadow-xs ring-1 ring-brand-primary'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{t.type}</span>
                  {interviewType === t.type && (
                    <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Module A3 & A4: Difficulty & Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-primary" />
                3. Difficulty Level
              </h3>
              <p className="text-xs text-slate-500">
                Calibrate question complexity to match your experience
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.level}
                  type="button"
                  onClick={() => setDifficulty(d.level)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    difficulty === d.level
                      ? 'border-brand-primary bg-sky-50 shadow-xs ring-1 ring-brand-primary'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {d.level}
                    </span>
                    <span className="text-xs text-slate-500">{d.desc}</span>
                  </div>
                  {difficulty === d.level && (
                    <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Number of Questions */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                4. Number of Questions
              </h3>
              <p className="text-xs text-slate-500">
                Choose the length of your mock interview session
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setTotalQuestions(cnt)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    totalQuestions === cnt
                      ? 'border-brand-primary bg-sky-50 shadow-xs ring-1 ring-brand-primary'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl font-black text-brand-navy block">
                    {cnt}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Questions</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic pt-2">
              Tip: A 5-question session takes ~15 minutes. A 10 or 15-question session provides comprehensive multi-topic preparation.
            </p>
          </Card>
        </div>

        {/* Module A5: Personalization (Resume & Target Job) */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-primary" />
              5. Personalization Context (Optional)
            </h3>
            <p className="text-xs text-slate-500">
              Personalize question generation using your uploaded resume and saved target job descriptions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Resume Personalization */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!resume}
                  checked={useResume && Boolean(resume)}
                  onChange={(e) => setUseResume(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"
                />
                <span>Personalize with My Uploaded Resume</span>
              </label>

              {resume ? (
                <p className="text-xs text-slate-600 pl-6">
                  Active file: <strong className="text-slate-800">{resume.originalFileName}</strong>.
                  Questions will reflect your extracted projects and technical skills.
                </p>
              ) : (
                <p className="text-xs text-amber-700 pl-6">
                  No active resume uploaded. You can still practice general role-based interviews!
                </p>
              )}
            </div>

            {/* Target Job Personalization */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <label className="block text-sm font-semibold text-slate-800">
                Target Specific Job Description (Phase 4)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">None (Standard Role Curriculum)</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.jobTitle} - {job.companyName || 'Saved Job'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                If selected, questions will emphasize requirements specified in this job description.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isStarting}
            disabled={isStarting}
            className="w-full sm:w-auto px-8"
            icon={ArrowRight}
          >
            {isStarting ? 'Generating Interview Questions...' : 'Start Mock Interview'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetupPage;
