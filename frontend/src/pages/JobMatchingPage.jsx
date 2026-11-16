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

        // Preselect job if specified or first in list
        let effectiveJobId = initialJobId;
        if (!effectiveJobId && userJobs.length > 0) {
          effectiveJobId = userJobs[0]._id;
        }

        if (effectiveJobId) {
          setSelectedJobId(effectiveJobId);
          // Try loading previous matches for this job
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

  // Handle switching selected job
  const handleJobChange = async (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    setCurrentMatch(null);
    setError('');
    setSuccessMessage('');

    if (newJobId) {
      try {
        const matchesRes = await jobService.getJobMatches(newJobId);
        if (matchesRes?.matches?.length > 0) {
          setCurrentMatch(matchesRes.matches[0]);
        }
      } catch {
        // No previous matches
      }
    }
  };

  // Run job match evaluation
  const handleRunMatch = async () => {
    if (!selectedJobId) {
      setError('Please select a target job description to match against.');
      return;
    }
    if (!resume) {
      setError('Please upload a resume first before running job matching.');
      return;
    }

    setIsMatching(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await jobService.matchJob(selectedJobId);
      if (res?.success && res.match) {
        setCurrentMatch(res.match);
        setSuccessMessage(`Job compatibility calculated: ${res.match.overallScore}% (${res.match.matchClassification}).`);

        setTimeout(() => {
          const el = document.getElementById('match-results');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(res?.message || 'Matching failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to execute job matching.');
    } finally {
      setIsMatching(false);
    }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  // Loading state
  if (isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading job matching intelligence...
        </p>
      </div>
    );
  }

  // Missing Resume state
  if (!resume) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Resume Required for Matching</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Please upload your PDF resume on the dashboard before running job compatibility matching.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/dashboard')}
        >
          Go to Resume Upload
        </Button>
      </div>
    );
  }

  // No Jobs Saved state
  if (jobs.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200 shadow-sm">
          <Building className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">No Target Jobs Saved</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Save a job description from LinkedIn, Naukri, or an employer portal to begin matching against your resume.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={() => navigate('/jobs')}
        >
          Add a Job Description
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 4 Intelligent Job Matching Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Job Compatibility & Skill Gap Matching
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Evaluate your resume against specific company job descriptions using a 5-pillar weighted rubric (35% Technical, 25% Projects, 15% Education, 15% Experience, 10% Preferred Skills).
          </p>
        </div>

        {/* Current Resume Pill */}
        <div className="flex-shrink-0 bg-white/10 border border-white/10 backdrop-blur-sm rounded-xl p-3.5 flex items-center gap-3">
          <FileCheck2 className="w-6 h-6 text-indigo-300 flex-shrink-0" />
          <div className="text-xs">
            <span className="block text-slate-300 font-medium">Active Candidate Resume</span>
            <span className="font-semibold text-white truncate max-w-[180px] block">
              {resume.originalFileName}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Job Selection Control Bar */}
      <Card className="border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Target Job Posting
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedJobId}
                onChange={handleJobChange}
                className="w-full max-w-md px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900 font-medium"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.companyName} — {job.jobTitle} ({job.jobType})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="text-xs text-brand-primary hover:underline font-semibold whitespace-nowrap"
              >
                + Manage Jobs
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              isLoading={isMatching}
              disabled={isMatching || !selectedJobId}
              onClick={handleRunMatch}
              className="px-6 py-2.5 font-semibold"
            >
              {isMatching
                ? 'Evaluating Compatibility...'
                : currentMatch
                ? 'Re-Run Compatibility Match'
                : 'Run Compatibility Match'}
            </Button>
          </div>
        </div>

        {/* Selected Job Quick Details */}
        {selectedJob && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
            <span>
              <strong className="text-slate-800">Company: </strong>
              {selectedJob.companyName}
            </span>
            <span>
              <strong className="text-slate-800">Role: </strong>
              {selectedJob.jobTitle}
            </span>
            <span>
              <strong className="text-slate-800">Type: </strong>
              {selectedJob.jobType}
            </span>
            <span>
              <strong className="text-slate-800">Location: </strong>
              {selectedJob.location || 'Remote / Hybrid'}
            </span>
          </div>
        )}
      </Card>

      {/* Match Results */}
      {currentMatch ? (
        <div id="match-results" className="space-y-8 animate-fadeIn">
          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Compatibility & Gap Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Evaluation for {currentMatch.jobTitle} at {currentMatch.companyName}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                icon={Map}
                onClick={() => navigate(`/roadmaps?jobId=${selectedJobId}`)}
              >
                Learning Roadmap
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Compass}
                onClick={() => navigate(`/career-recommendations?jobId=${selectedJobId}`)}
              >
                Career Paths
              </Button>
            </div>
          </div>

          {/* 1. Score Overview Card (Weighted Rubric) */}
          <JobMatchScoreCard match={currentMatch} />

          {/* 2. Skill Gap Analysis (Matched, Missing Required, Missing Preferred) */}
          <SkillGapCard
            matchedSkills={currentMatch.matchedSkills}
            missingRequiredSkills={currentMatch.missingRequiredSkills}
            missingPreferredSkills={currentMatch.missingPreferredSkills}
          />

          {/* 3. Detailed Evaluations (Projects, Education, Experience) */}
          <JobRelevanceDetailsCard
            projectEvaluation={currentMatch.projectEvaluation}
            educationEvaluation={currentMatch.educationEvaluation}
            experienceEvaluation={currentMatch.experienceEvaluation}
          />
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Ready to Match</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click &quot;Run Compatibility Match&quot; above to compare your resume against {selectedJob?.companyName}&apos;s requirements.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobMatchingPage;
