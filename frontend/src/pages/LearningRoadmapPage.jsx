import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  Compass,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import jobService from '../services/jobService';
import resumeService from '../services/resumeService';
import RoadmapProgressCard from '../components/roadmap/RoadmapProgressCard';

const LearningRoadmapPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryJobId = searchParams.get('jobId') || '';
  const queryRole = searchParams.get('role') || searchParams.get('targetRole') || location.state?.role || '';
  const autoGenerate = Boolean(location.state?.autoGenerate);

  const [jobs, setJobs] = useState([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [selectedRole, setSelectedRole] = useState(queryRole);
  const [selectedJobId, setSelectedJobId] = useState(queryJobId);
  const [roadmap, setRoadmap] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [updatingWeeks, setUpdatingWeeks] = useState({});

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Initial Load & Role/Job Resolution
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [jobsRes, roadmapsRes] = await Promise.all([
          jobService.getJobs().catch(() => null),
          jobService.getRoadmaps().catch(() => null),
        ]);

        if (!isMounted) return;

        const userJobs = jobsRes?.jobs || [];
        const userRoadmaps = roadmapsRes?.roadmaps || [];
        setJobs(userJobs);
        setSavedRoadmaps(userRoadmaps);

        // Scenario A: Specific role requested via URL (e.g. /roadmaps?role=Backend%20Developer)
        if (queryRole) {
          const cleanRole = queryRole.trim();
          setSelectedRole(cleanRole);
          setSelectedJobId('');

          // 1. Check if user already has a saved roadmap for this exact role
          const existingInList = userRoadmaps.find(
            (r) => r.targetRole && r.targetRole.trim().toLowerCase() === cleanRole.toLowerCase()
          );

          if (existingInList) {
            setRoadmap(existingInList);
            return;
          }

          // 2. Try fetching from role endpoint
          let existingRoleRoadmap = null;
          try {
            const roleRes = await jobService.getRoadmapByRole(cleanRole);
            if (isMounted && roleRes?.success && roleRes.roadmap) {
              existingRoleRoadmap = roleRes.roadmap;
            }
          } catch {
            // Not yet created
          }

          if (existingRoleRoadmap) {
            setRoadmap(existingRoleRoadmap);
            return;
          }

          // 3. If autoGenerate flag was passed from Career Recommendations card button
          if (autoGenerate) {
            setIsGenerating(true);
            try {
              const genRes = await jobService.createRoadmap({
                targetRole: cleanRole,
                durationWeeks: 4,
                missingSkills: location.state?.missingSkills || null,
              });

              if (isMounted && genRes?.success && genRes.roadmap) {
                setRoadmap(genRes.roadmap);
                setSavedRoadmaps((prev) => [
                  genRes.roadmap,
                  ...prev.filter(
                    (r) => r.targetRole?.toLowerCase() !== genRes.roadmap.targetRole?.toLowerCase()
                  ),
                ]);
                setSuccessMessage(`Personalized roadmap for ${cleanRole} generated successfully!`);
                return;
              }
            } catch (genErr) {
              if (isMounted) {
                setError(genErr.message || `Unable to generate roadmap for ${cleanRole}. Ensure you have an active resume uploaded.`);
              }
            } finally {
              if (isMounted) setIsGenerating(false);
            }
          }

          // No roadmap exists yet and not auto-generated
          setRoadmap(null);
          return;
        }

        // Scenario B: Specific jobId requested via URL (e.g. /roadmaps?jobId=123)
        if (queryJobId) {
          setSelectedJobId(queryJobId);
          const currentJob = userJobs.find((j) => j._id === queryJobId);
          if (currentJob) setSelectedRole(currentJob.jobTitle);

          try {
            const jobRoadmapRes = await jobService.getRoadmapByJobId(queryJobId);
            if (isMounted && jobRoadmapRes?.success && jobRoadmapRes.roadmap) {
              setRoadmap(jobRoadmapRes.roadmap);
              return;
            }
          } catch {
            // No roadmap for this job
          }
          setRoadmap(null);
          return;
        }

        // Scenario C: No parameters in URL (/roadmaps)
        // If user already has any roadmaps, load the most recent one
        if (userRoadmaps.length > 0) {
          const latestRoadmap = userRoadmaps[0];
          setRoadmap(latestRoadmap);
          setSelectedRole(latestRoadmap.targetRole || '');
          if (latestRoadmap.job) setSelectedJobId(latestRoadmap.job);
          return;
        }

        // If no roadmaps exist, check if user has target jobs
        if (userJobs.length > 0) {
          const firstJob = userJobs[0];
          setSelectedJobId(firstJob._id);
          setSelectedRole(firstJob.jobTitle);
          return;
        }

        // Neither roadmaps nor jobs exist
        setRoadmap(null);
        setSelectedRole('');
        setSelectedJobId('');
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

    loadData();

    return () => {
      isMounted = false;
    };
  }, [queryRole, queryJobId, autoGenerate]);

  // Handle switching curriculum from dropdown
  const handleCurriculumSelect = async (e) => {
    const value = e.target.value;
    setError('');
    setSuccessMessage('');

    if (!value) return;

    if (value.startsWith('role:')) {
      const roleName = value.replace('role:', '');
      setSelectedRole(roleName);
      setSelectedJobId('');
      navigate(`/roadmaps?role=${encodeURIComponent(roleName)}`);
    } else if (value.startsWith('job:')) {
      const jobId = value.replace('job:', '');
      setSelectedJobId(jobId);
      const matchedJob = jobs.find((j) => j._id === jobId);
      if (matchedJob) setSelectedRole(matchedJob.jobTitle);
      navigate(`/roadmaps?jobId=${jobId}`);
    }
  };

  // Generate or Regenerate Roadmap for current target role or job
  const handleGenerateRoadmap = async () => {
    const roleToGenerate = (selectedRole || roadmap?.targetRole || selectedJob?.jobTitle || '').trim();

    if (!selectedJobId && !roleToGenerate) {
      setError('Please select a target role or job description to generate a roadmap.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = selectedJobId
        ? { jobId: selectedJobId, targetRole: roleToGenerate, durationWeeks: 4 }
        : { targetRole: roleToGenerate, durationWeeks: 4 };

      const res = await jobService.createRoadmap(payload);
      if (res?.success && res.roadmap) {
        setRoadmap(res.roadmap);
        setSavedRoadmaps((prev) => [
          res.roadmap,
          ...prev.filter(
            (r) => r._id !== res.roadmap._id && r.targetRole?.toLowerCase() !== res.roadmap.targetRole?.toLowerCase()
          ),
        ]);
        setSuccessMessage(
          `Personalized 4-week roadmap for ${res.roadmap.targetRole || roleToGenerate} generated successfully!`
        );
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

    const updatedRoadmapDoc = {
      ...roadmap,
      items: updatedItems,
      progressPercentage,
    };

    setRoadmap(updatedRoadmapDoc);
    setSavedRoadmaps((prev) =>
      prev.map((r) => (r._id === roadmap._id ? updatedRoadmapDoc : r))
    );

    setUpdatingWeeks((prev) => ({ ...prev, [weekNumber]: true }));
    setIsUpdatingProgress(true);

    // 2. Persist update in backend MongoDB
    try {
      const res = await jobService.updateRoadmapProgress(roadmap._id, weekNumber, newCompleted);
      if (res?.success && res.roadmap) {
        setRoadmap(res.roadmap);
        setSavedRoadmaps((prev) =>
          prev.map((r) => (r._id === res.roadmap._id ? res.roadmap : r))
        );
      } else {
        throw new Error(res?.message || 'Server rejected progress update.');
      }
    } catch (err) {
      setRoadmap(previousRoadmap);
      setSavedRoadmaps((prev) =>
        prev.map((r) => (r._id === previousRoadmap._id ? previousRoadmap : r))
      );
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
  const displayedRoleTitle = roadmap?.targetRole || selectedRole || selectedJob?.jobTitle || '';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Loading learning roadmap intelligence...
        </p>
      </div>
    );
  }

  // Calculate current dropdown value
  let selectValue = '';
  if (selectedRole && savedRoadmaps.some((r) => r.targetRole?.toLowerCase() === selectedRole.toLowerCase())) {
    selectValue = `role:${selectedRole}`;
  } else if (selectedJobId) {
    selectValue = `job:${selectedJobId}`;
  } else if (selectedRole) {
    selectValue = `role:${selectedRole}`;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner with Dynamic Role Title */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Map className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Targeted Skill Progression</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            {displayedRoleTitle ? `Learning Roadmap – ${displayedRoleTitle}` : 'Personalized Learning Roadmap'}
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            {displayedRoleTitle
              ? `Structured 4-week execution curriculum tailored specifically for ${displayedRoleTitle}. Follow weekly hands-on milestones to eliminate skill gaps and build portfolio evidence.`
              : 'Turn skill gaps into actionable weekly milestones. Follow a structured sequence of concepts, hands-on exercises, and portfolio mini-projects.'}
          </p>
        </div>

        {roadmap && (
          <Button
            variant="secondary"
            size="md"
            icon={Sparkles}
            isLoading={isGenerating}
            onClick={handleGenerateRoadmap}
            className="flex-shrink-0 font-heading font-semibold"
          >
            Regenerate Plan
          </Button>
        )}
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

      {/* Curriculum Switcher Bar */}
      {(savedRoadmaps.length > 0 || jobs.length > 0 || selectedRole) && (
        <Card className="border border-brand-border bg-white shadow-soft-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-brand-muted">
                Active Learning Curriculum
              </label>
              <select
                value={selectValue}
                onChange={handleCurriculumSelect}
                className="w-full max-w-md px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-charcoal font-medium font-sans shadow-soft-xs transition-colors"
              >
                {/* 1. Saved Role Roadmaps */}
                {savedRoadmaps.length > 0 && (
                  <optgroup label="Saved Career Roadmaps">
                    {savedRoadmaps.map((r) => (
                      <option key={r._id} value={`role:${r.targetRole}`}>
                        {r.targetRole} ({r.progressPercentage || 0}% completed)
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 2. Currently Selected Role (if not yet saved) */}
                {selectedRole && !savedRoadmaps.some((r) => r.targetRole?.toLowerCase() === selectedRole.toLowerCase()) && (
                  <optgroup label="Pending Career Role">
                    <option value={`role:${selectedRole}`}>
                      {selectedRole} (Ready to Generate)
                    </option>
                  </optgroup>
                )}

                {/* 3. Target Job Descriptions */}
                {jobs.length > 0 && (
                  <optgroup label="Target Job Descriptions">
                    {jobs.map((job) => (
                      <option key={job._id} value={`job:${job._id}`}>
                        {job.companyName} — {job.jobTitle}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={Compass}
                onClick={() => navigate('/career-recommendations')}
                className="text-xs font-heading font-medium"
              >
                Explore Other Roles
              </Button>

              {!roadmap && displayedRoleTitle && (
                <Button
                  variant="primary"
                  size="md"
                  icon={Sparkles}
                  isLoading={isGenerating}
                  onClick={handleGenerateRoadmap}
                  disabled={isGenerating}
                  className="font-heading font-semibold"
                >
                  Generate {displayedRoleTitle} Roadmap
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Roadmap Component */}
      {roadmap ? (
        <RoadmapProgressCard
          roadmap={roadmap}
          onToggleWeek={handleToggleWeek}
          isUpdating={isUpdatingProgress}
          updatingWeeks={updatingWeeks}
        />
      ) : displayedRoleTitle ? (
        <div className="p-12 text-center rounded-3xl bg-brand-forestLight/40 border border-brand-sageBorder/50 shadow-soft-xs space-y-4">
          <BookOpen className="w-10 h-10 text-brand-primary mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Curriculum Ready to Generate for {displayedRoleTitle}
            </h3>
            <p className="text-xs text-brand-slate max-w-md mx-auto leading-relaxed">
              We will compare your resume against core qualifications for {displayedRoleTitle} and build a structured 4-week practical learning schedule.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            isLoading={isGenerating}
            onClick={handleGenerateRoadmap}
            className="font-heading font-semibold"
          >
            Generate {displayedRoleTitle} Roadmap
          </Button>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-brand-surface border border-brand-border shadow-soft-xs space-y-4">
          <Building className="w-10 h-10 text-brand-muted mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-heading font-bold text-brand-charcoal">No Curriculum Selected</h3>
            <p className="text-xs text-brand-muted max-w-md mx-auto">
              Please choose a career role from Career Recommendations or add a target job to build your personalized learning roadmap.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Compass}
            onClick={() => navigate('/career-recommendations')}
            className="font-heading font-semibold"
          >
            Explore Career Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearningRoadmapPage;
