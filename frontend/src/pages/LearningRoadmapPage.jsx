import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Map,
  Sparkles,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import jobService from '../services/jobService';
import resumeService from '../services/resumeService';
import RoadmapProgressCard from '../components/roadmap/RoadmapProgressCard';

const LearningRoadmapPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(queryJobId || '');
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [updatingWeeks, setUpdatingWeeks] = useState({});

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Initial Load: Jobs list & Roadmap
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setIsLoading(true);
      setError('');

      try {
        const jobsRes = await jobService.getJobs().catch(() => null);
        if (!isMounted) return;

        const userJobs = jobsRes?.jobs || [];
        setJobs(userJobs);

        let activeJobId = queryJobId;
        if (!activeJobId && userJobs.length > 0) {
          activeJobId = userJobs[0]._id;
        }

        if (activeJobId) {
          setSelectedJobId(activeJobId);
          try {
            const roadmapRes = await jobService.getRoadmapByJobId(activeJobId);
            if (isMounted && roadmapRes?.success && roadmapRes.roadmap) {
              setRoadmap(roadmapRes.roadmap);
            } else if (isMounted) {
              // Try fetching latest user roadmap as fallback
              const allRoadmaps = await jobService.getRoadmaps().catch(() => null);
              if (isMounted && allRoadmaps?.roadmap) {
                setRoadmap(allRoadmaps.roadmap);
                if (allRoadmaps.roadmap.job) {
                  setSelectedJobId(allRoadmaps.roadmap.job);
                }
              } else {
                setRoadmap(null);
              }
            }
          } catch {
            // Check if any roadmap exists across jobs
            try {
              const allRoadmaps = await jobService.getRoadmaps();
              if (isMounted && allRoadmaps?.roadmap) {
                setRoadmap(allRoadmaps.roadmap);
                if (allRoadmaps.roadmap.job) {
                  setSelectedJobId(allRoadmaps.roadmap.job);
                }
              } else if (isMounted) {
                setRoadmap(null);
              }
            } catch {
              if (isMounted) setRoadmap(null);
            }
          }
        } else {
          // No jobs found or no activeJobId, check for standalone roadmaps
          try {
            const allRoadmaps = await jobService.getRoadmaps();
            if (isMounted && allRoadmaps?.roadmap) {
              setRoadmap(allRoadmaps.roadmap);
              if (allRoadmaps.roadmap.job) {
                setSelectedJobId(allRoadmaps.roadmap.job);
              }
            }
          } catch {
            // No saved roadmaps
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load learning roadmap data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [queryJobId]);

  // Handle job switcher
  const handleJobSelect = async (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    setRoadmap(null);
    setError('');
    setSuccessMessage('');

    if (newJobId) {
      navigate(`/roadmaps?jobId=${newJobId}`, { replace: true });
      try {
        const res = await jobService.getRoadmapByJobId(newJobId);
        if (res?.success && res.roadmap) {
          setRoadmap(res.roadmap);
        }
      } catch {
        // No saved roadmap for selected job
      }
    }
  };

  // Generate roadmap
  const handleGenerateRoadmap = async () => {
    if (!selectedJobId) {
      setError('Please select a target job to generate a roadmap.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await jobService.createRoadmap(selectedJobId, 4);
      if (res?.success && res.roadmap) {
        setRoadmap(res.roadmap);
        setSuccessMessage('Personalized 4-week roadmap generated successfully.');
      } else {
        throw new Error(res?.message || 'Failed to generate roadmap.');
      }
    } catch (err) {
      setError(err.message || 'Unable to generate roadmap. Please ensure you have an active resume uploaded.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Controlled week task completion toggle with immediate optimistic update and rollback
  const handleToggleWeek = async (weekNumber, completed) => {
    if (!roadmap?._id) return;

    // Prevent duplicate/conflicting updates from rapid clicks on the same week
    if (updatingWeeks[weekNumber]) return;

    setError('');
    const previousRoadmap = roadmap;

    // 1. Immediately apply optimistic update in local state
    const newCompleted = Boolean(completed);
    const updatedItems = (roadmap.items || []).map((it) => {
      if (it.weekNumber === weekNumber) {
        return {
          ...it,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : null,
        };
      }
      return it;
    });

    const totalWeeks = updatedItems.length || roadmap.totalWeeks || 4;
    const completedCount = updatedItems.filter((it) => it.completed).length;
    const progressPercentage = Math.round((completedCount / Math.max(1, totalWeeks)) * 100);

    setRoadmap({
      ...roadmap,
      items: updatedItems,
      progressPercentage,
    });

    setUpdatingWeeks((prev) => ({ ...prev, [weekNumber]: true }));
    setIsUpdatingProgress(true);

    // 2. Persist update in backend MongoDB
    try {
      const res = await jobService.updateRoadmapProgress(roadmap._id, weekNumber, newCompleted);
      if (res?.success && res.roadmap) {
        setRoadmap(res.roadmap);
      } else {
        throw new Error(res?.message || 'Server rejected progress update.');
      }
    } catch (err) {
      // Revert optimistic update on failure
      setRoadmap(previousRoadmap);
      setError(err.message || 'Failed to update progress. Reverting changes.');
    } finally {
      setUpdatingWeeks((prev) => {
        const next = { ...prev };
        delete next[weekNumber];
        return next;
      });
      setIsUpdatingProgress(false);
    }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading learning roadmap intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium">
            <Map className="w-3.5 h-3.5" />
            Phase 4.6 Personalized Learning Roadmap
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Personalized Learning Roadmap
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Turn skill gaps into actionable weekly milestones. Follow a structured sequence of concepts, hands-on exercises, and portfolio mini-projects tailored to your target job.
          </p>
        </div>

        {roadmap && (
          <Button
            variant="secondary"
            size="md"
            icon={Sparkles}
            isLoading={isGenerating}
            onClick={handleGenerateRoadmap}
            className="flex-shrink-0"
          >
            Regenerate Plan
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Target Job Selector Bar */}
      {jobs.length > 0 ? (
        <Card className="border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Job Curriculum
              </label>
              <select
                value={selectedJobId}
                onChange={handleJobSelect}
                className="w-full max-w-md px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900 font-medium"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.companyName} — {job.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            {!roadmap && (
              <Button
                variant="secondary"
                size="md"
                icon={Sparkles}
                isLoading={isGenerating}
                onClick={handleGenerateRoadmap}
                disabled={!selectedJobId || isGenerating}
                className="self-start sm:self-auto"
              >
                Generate 4-Week Roadmap
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <Building className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Target Jobs Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please save a target job description first to generate a personalized learning roadmap.
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
      )}

      {/* Roadmap Component */}
      {roadmap ? (
        <RoadmapProgressCard
          roadmap={roadmap}
          onToggleWeek={handleToggleWeek}
          isUpdating={isUpdatingProgress}
          updatingWeeks={updatingWeeks}
        />
      ) : selectedJob && (
        <div className="p-12 text-center rounded-2xl bg-sky-50/50 border border-sky-100 space-y-4">
          <BookOpen className="w-10 h-10 text-brand-primary mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Curriculum Ready to Generate
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              We will compare your resume against {selectedJob.companyName}&apos;s {selectedJob.jobTitle} position and build a 4-week practical learning schedule.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            icon={Sparkles}
            isLoading={isGenerating}
            onClick={handleGenerateRoadmap}
          >
            Generate Personalized Roadmap
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearningRoadmapPage;
