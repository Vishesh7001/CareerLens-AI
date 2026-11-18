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
  Target,
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
        if (isMounted) {
          setError(err.message || 'Failed to load background profile context.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitial(false);
        }
      }
    };

    loadContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartInterview = async () => {
    const isCustom = selectedRole === 'Custom Role';
    const effectiveRole = isCustom ? customRole.trim() : selectedRole;

    if (!effectiveRole || effectiveRole.length < 2) {
      setError('Please specify a valid role title (at least 2 characters).');
      return;
    }

    setIsStarting(true);
    setError('');

    try {
      const payload = {
        role: selectedRole,
        customRole: isCustom ? effectiveRole : undefined,
        interviewType,
        difficulty,
        totalQuestions,
        useResumeContext: useResume && Boolean(resume),
        jobId: selectedJobId || undefined,
      };

      const res = await interviewService.createInterview(payload);
      if (res?.success && res.interview?._id) {
        navigate(`/mock-interview/${res.interview._id}`);
      } else {
        throw new Error(res?.message || 'Failed to initialize interview session.');
      }
    } catch (err) {
      setError(err.message || 'Failed to start mock interview. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Configuring interactive interview room...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Target className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Interactive AI Simulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            AI-Powered Mock Interview Setup
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Configure a realistic interview simulation tailored to your target discipline. Every answer receives immediate, rubric-backed scoring, identified gaps, and an ideal benchmark response.
          </p>
        </div>

        <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-1 shadow-soft-xs">
          <span className="text-[#A4B0A4] block">Evaluation Framework</span>
          <span className="font-heading font-bold text-white block">Multi-Factor Rubric</span>
          <span className="text-[11px] text-[#A4B0A4] block">Technical Accuracy, STAR Method</span>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-3 animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-medium">{error}</div>
        </div>
      )}

      {/* 1. Target Role Selection */}
      <Card className="border-brand-border p-6 space-y-4">
        <div>
          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            1. Select Target Discipline
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Choose your focus area to generate tailored questions
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {PREDEFINED_ROLES.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-xl border text-center transition-all duration-150 text-xs ${
                  isSelected
                    ? 'border-brand-primary bg-brand-forestLight text-brand-primary font-heading font-bold shadow-soft-xs ring-1 ring-brand-primary'
                    : 'border-brand-border bg-white text-brand-slate hover:border-brand-borderDark hover:bg-brand-bg font-medium'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {selectedRole === 'Custom Role' && (
          <div className="pt-2 animate-in fade-in-50">
            <label className="block text-xs font-heading font-semibold text-brand-charcoal mb-1.5">
              Enter Custom Role Title <span className="text-brand-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems Engineer, QA Automation Architect"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal placeholder-brand-muted shadow-soft-xs"
            />
          </div>
        )}
      </Card>

      {/* 2. Interview Type */}
      <Card className="border-brand-border p-6 space-y-4">
        <div>
          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            2. Interview Format
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Specify the interview round structure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {INTERVIEW_TYPES.map((t) => {
            const isSelected = interviewType === t.type;
            return (
              <div
                key={t.type}
                onClick={() => setInterviewType(t.type)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 space-y-1.5 ${
                  isSelected
                    ? 'border-brand-primary bg-brand-forestLight/50 shadow-soft-xs ring-1 ring-brand-primary'
                    : 'border-brand-border bg-white hover:border-brand-borderDark hover:bg-brand-bg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-heading font-bold ${
                      isSelected ? 'text-brand-primary' : 'text-brand-charcoal'
                    }`}
                  >
                    {t.type}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary'
                        : 'border-brand-border bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Difficulty Level & Question Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-brand-border p-6 space-y-4">
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              3. Difficulty Level
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Match candidate seniority target
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {DIFFICULTIES.map((d) => {
              const isSelected = difficulty === d.level;
              return (
                <div
                  key={d.level}
                  onClick={() => setDifficulty(d.level)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-primary bg-brand-forestLight text-brand-primary font-heading font-bold shadow-soft-xs'
                      : 'border-brand-border bg-white text-brand-slate hover:border-brand-borderDark hover:bg-brand-bg font-medium'
                  }`}
                >
                  <span className="text-xs">{d.level}</span>
                  <span className="text-[11px] text-brand-muted">{d.desc}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-brand-border p-6 space-y-4">
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              4. Session Length
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Number of questions in this practice run
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {QUESTION_COUNTS.map((count) => {
              const isSelected = totalQuestions === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTotalQuestions(count)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-forestLight text-brand-primary font-heading font-bold shadow-soft-xs'
                      : 'border-brand-border bg-white text-brand-slate hover:border-brand-borderDark hover:bg-brand-bg font-medium'
                  }`}
                >
                  <span className="text-xl font-heading font-black block">{count}</span>
                  <span className="text-[11px] text-brand-muted block mt-0.5">Questions</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 5. Dynamic Context Integration */}
      <Card className="border-brand-border p-6 space-y-4">
        <div>
          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            5. Dynamic Context Integration
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Tailor questions using your uploaded resume profile and saved job postings
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {/* Resume Context Toggle */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-brand-border bg-brand-bg cursor-pointer">
            <input
              type="checkbox"
              checked={useResume && Boolean(resume)}
              disabled={!resume}
              onChange={(e) => setUseResume(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-primary focus:ring-brand-primary/20 border-brand-border"
            />
            <div className="text-xs">
              <span className="font-heading font-bold text-brand-charcoal block">
                Tailor Questions to Uploaded Resume
              </span>
              <span className="text-brand-muted block mt-0.5">
                {resume
                  ? `Incorporates technologies from "${resume.originalFileName}"`
                  : 'No resume uploaded yet (upload on dashboard to enable)'}
              </span>
            </div>
          </label>

          {/* Job Description Dropdown (Optional) */}
          {jobs.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-muted">
                Target Job Requirements Context (Optional)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-brand-border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal font-medium shadow-soft-xs"
              >
                <option value="">No specific job posting selected</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.jobTitle} — {j.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Start Button */}
      <div className="pt-2 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          isLoading={isStarting}
          onClick={handleStartInterview}
          className="w-full sm:w-auto font-heading font-semibold"
        >
          Initialize & Enter Interview Room
        </Button>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
