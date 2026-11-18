import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  Building,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Map,
  Compass,
  ArrowRight,
  Plus,
  Target,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import resumeService from '../services/resumeService';
import jobService from '../services/jobService';
import JobMatchScoreCard from '../components/jobs/JobMatchScoreCard';
import SkillGapCard from '../components/jobs/SkillGapCard';
import JobRelevanceDetailsCard from '../components/jobs/JobRelevanceDetailsCard';

const JobMatchingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId');

  // Resume & Jobs state
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Match state
  const [currentMatch, setCurrentMatch] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  // Alerts
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Load initial resume and jobs list
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoadingInitial(true);
      setError('');

      try {
        const [resumeRes, jobsRes] = await Promise.all([
          resumeService.getResume().catch(() => null),
          jobService.getJobs().catch(() => null),
        ]);

        if (!isMounted) return;

        if (resumeRes?.success && resumeRes.resume) {
          setResume(resumeRes.resume);
        } else {
          setResume(null);
        }

        const userJobs = jobsRes?.jobs || [];
        setJobs(userJobs);

        let effectiveJobId = initialJobId;
        if (!effectiveJobId && userJobs.length > 0) {
          effectiveJobId = userJobs[0]._id;
        }

        if (effectiveJobId) {
          setSelectedJobId(effectiveJobId);
          try {
            const matchesRes = await jobService.getJobMatches(effectiveJobId);
            if (isMounted && matchesRes?.matches?.length > 0) {
              setCurrentMatch(matchesRes.matches[0]);
            }
          } catch {
            // No previous match
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to initialize job matching dashboard.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitial(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [initialJobId]);

  // 2. Handle switching selected job
  const handleJobSelectChange = async (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    setError('');
    setSuccessMessage('');
    setCurrentMatch(null);

    if (!jobId) return;

    try {
      const res = await jobService.getJobMatches(jobId);
      if (res?.matches?.length > 0) {
        setCurrentMatch(res.matches[0]);
      }
    } catch {
      // Ignore
    }
  };

  // 3. Run Job Matching
  const handleRunMatch = async () => {
    if (!resume?._id) {
      setError('Please upload a resume first before running job matching.');
      return;
    }
    if (!selectedJobId) {
      setError('Please select a target job to match against.');
      return;
    }

    setIsMatching(true);
    setError('');
    setSuccessMessage('');

    try {
      const matchFn = typeof jobService.runJobMatch === 'function'
        ? jobService.runJobMatch.bind(jobService)
        : jobService.matchJob.bind(jobService);
      const res = await matchFn(selectedJobId);
      const matchObj = res?.matchResult || res?.match;
      if (res?.success && matchObj) {
        setCurrentMatch(matchObj);
        setSuccessMessage(
          `Matching completed successfully! Overall compatibility: ${matchObj.overallScore}%.`
        );

        setTimeout(() => {
          const el = document.getElementById('match-results');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(res?.message || 'Failed to run job matching analysis.');
      }
    } catch (err) {
      setError(err.message || 'Job matching analysis failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Loading job matching intelligence...
        </p>
      </div>
    );
  }

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Target className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Smart Job Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Job Description Matching
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Compare your resume with a job description to see how well you match the role and which skills you need to improve.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={Briefcase}
            onClick={() => navigate('/jobs')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-heading font-medium"
          >
            Manage Target Jobs
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-3 animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-brand-forestLight border border-brand-sageBorder/60 text-brand-primary text-sm flex items-start gap-3 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-semibold">{successMessage}</div>
        </div>
      )}

      {/* Missing Resume Warning State */}
      {!resume && (
        <Card className="p-6 border-brand-border bg-amber-50/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-brand-charcoal">
                  Resume Required for Compatibility Matching
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Upload your PDF resume on the workspace dashboard to compare your qualifications against jobs.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard#resume-section')}
            >
              Upload Resume
            </Button>
          </div>
        </Card>
      )}

      {/* Job Selection & Action Bar */}
      <Card className="border-brand-border p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1 flex-1 max-w-xl">
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-muted">
              Select Target Job Posting
            </label>
            {jobs.length > 0 ? (
              <div className="flex items-center gap-3">
                <select
                  value={selectedJobId}
                  onChange={handleJobSelectChange}
                  className="w-full text-xs sm:text-sm bg-white border border-brand-border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal font-medium shadow-soft-xs"
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.jobTitle} — {job.companyName} ({job.location || 'Remote'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs text-brand-muted">
                No jobs saved yet.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="text-brand-primary font-heading font-bold underline"
                >
                  Create your first target job posting
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              isLoading={isMatching}
              disabled={isMatching || !selectedJobId || !resume}
              onClick={handleRunMatch}
              className="font-heading font-semibold"
            >
              {currentMatch ? 'Re-Run Compatibility Match' : 'Run Compatibility Match'}
            </Button>
          </div>
        </div>

        {/* Selected Job Quick Preview */}
        {selectedJob && (
          <div className="pt-4 border-t border-brand-border/70 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-muted">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-muted" />
              Company: <strong className="text-brand-charcoal">{selectedJob.companyName}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-muted" />
              Location: <strong className="text-brand-charcoal">{selectedJob.location || 'Remote'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-brand-primary" />
              Candidate Profile:{' '}
              <strong className="text-brand-charcoal">{resume?.originalFileName || 'Active'}</strong>
            </span>
          </div>
        )}
      </Card>

      {/* Match Results Display */}
      {currentMatch && (
        <div id="match-results" className="space-y-8 animate-in fade-in-50 duration-200">
          {/* 1. Score Card */}
          <JobMatchScoreCard match={currentMatch} />

          {/* 2. Skill Gap Card */}
          <SkillGapCard
            matchedSkills={currentMatch.matchedSkills}
            missingRequiredSkills={currentMatch.missingRequiredSkills}
            missingPreferredSkills={currentMatch.missingPreferredSkills}
          />

          {/* 3. Relevance Details */}
          <JobRelevanceDetailsCard
            projectEvaluation={currentMatch.projectEvaluation}
            educationEvaluation={currentMatch.educationEvaluation}
            experienceEvaluation={currentMatch.experienceEvaluation}
          />

          {/* Next Steps Card: Career Paths & Roadmaps */}
          <Card className="border-brand-border bg-white p-6 sm:p-7 shadow-soft-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <span className="text-xs font-heading font-bold text-brand-primary uppercase tracking-wider block">
                  NEXT STEPS
                </span>
                <h3 className="text-xl font-heading font-bold text-brand-charcoal tracking-tight">
                  Improve Your Job Match
                </h3>
                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-sans">
                  Build the skills you're missing with a learning roadmap or practice relevant interview questions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  icon={Map}
                  onClick={() => navigate('/roadmaps')}
                  className="font-heading font-semibold"
                >
                  View Roadmaps
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={ArrowRight}
                  onClick={() => navigate('/mock-interview')}
                  className="font-heading font-medium"
                >
                  Start Mock Interview
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobMatchingPage;
