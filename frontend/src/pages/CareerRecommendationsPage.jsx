import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  ListChecks,
  Loader2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import jobService from '../services/jobService';
import resumeService from '../services/resumeService';

const CareerRecommendationsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');

  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError('');

    try {
      const resumeRes = await resumeService.getResume();
      if (!resumeRes?.success || !resumeRes.resume) {
        setIsLoading(false);
        return;
      }

      try {
        const savedRes = await jobService.getSavedCareerRecommendations();
        if (savedRes?.success && savedRes.recommendations) {
          setRecommendations(savedRes.recommendations);
          setIsLoading(false);
          return;
        }
      } catch {
        // No saved recommendations yet
      }

      const genRes = await jobService.generateCareerRecommendations(jobId || null);
      if (genRes?.success && genRes.recommendations) {
        setRecommendations(genRes.recommendations);
      }
    } catch (err) {
      setError(err.message || 'Failed to load career recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [jobId]);

  const handleRefresh = async () => {
    setIsGenerating(true);
    setError('');
    setSuccessMessage('');
    try {
      const genRes = await jobService.generateCareerRecommendations(jobId || null);
      if (genRes?.success && genRes.recommendations) {
        setRecommendations(genRes.recommendations);
        setSuccessMessage('Career recommendations updated successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate recommendations.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Analyzing career path alignments across 12 tech domains...
        </p>
      </div>
    );
  }

  const primary = recommendations?.primaryRecommendations || [];
  const alternative = recommendations?.alternativeRecommendations || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Compass className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Strategic Career Navigation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Career Path Recommendations
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Data-backed career pathways tailored for college students and freshers. Evaluated across 12 standard engineering roles with personalized project ideas and preparation priorities.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Sparkles}
          isLoading={isGenerating}
          onClick={handleRefresh}
          className="bg-brand-primary text-white hover:bg-brand-primaryHover flex-shrink-0 font-heading font-semibold"
        >
          {isGenerating ? 'Evaluating Paths...' : 'Refresh Career Paths'}
        </Button>
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

      {/* Student Guidance Callout */}
      {recommendations?.studentAdvice && (
        <Card className="border border-brand-border bg-brand-forestLight/30 shadow-soft-xs p-6">
          <div className="flex items-start gap-3.5">
            <TrendingUp className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-heading font-bold text-brand-charcoal">
                Fresher & Student Career Guidance
              </h4>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                {recommendations.studentAdvice}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Primary Career Paths */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-brand-charcoal">
            Primary Career Recommendations
          </h2>
          <p className="text-xs text-brand-muted">
            Top roles with maximum skill overlap and natural trajectory from your existing background
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {primary.map((item, idx) => (
            <Card
              key={idx}
              className="border border-brand-border shadow-soft hover:shadow-soft-md hover:border-brand-borderDark transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-brand-border/70">
                  <div>
                    <span className="text-[11px] font-heading font-bold text-brand-primary uppercase tracking-wider block">
                      Rank #{idx + 1}
                    </span>
                    <h3 className="text-base font-heading font-bold text-brand-charcoal mt-0.5 group-hover:text-brand-primary transition-colors">
                      {item.role}
                    </h3>
                  </div>
                  <span className="text-xs font-heading font-bold px-2.5 py-1 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60 flex-shrink-0">
                    {item.recommendationScore}% Fit
                  </span>
                </div>

                <p className="text-xs text-brand-slate leading-relaxed">
                  {item.whyRecommended}
                </p>

                {/* Existing Skills */}
                {item.relevantExistingSkills && item.relevantExistingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted">
                      Existing Matching Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.relevantExistingSkills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-heading font-medium px-2 py-0.5 rounded-lg bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {item.missingSkills && item.missingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted">
                      Skills to Acquire:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.missingSkills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-heading font-medium px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Ideas */}
                {item.suggestedProjects && item.suggestedProjects.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-brand-border/70">
                    <span className="block text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5 text-brand-muted" />
                      Suggested Showcase Projects:
                    </span>
                    <ul className="space-y-1 text-xs text-brand-slate">
                      {item.suggestedProjects.map((p, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-brand-primary font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-brand-border/70">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={ArrowRight}
                  onClick={() =>
                    navigate(`/roadmaps?role=${encodeURIComponent(item.role)}`, {
                      state: {
                        role: item.role,
                        missingSkills: item.missingSkills,
                        autoGenerate: true,
                      },
                    })
                  }
                  className="text-xs font-heading font-semibold"
                >
                  Generate Roadmap for {item.role}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Alternative Career Paths */}
      {alternative.length > 0 && (
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-lg font-heading font-bold text-brand-charcoal">
              Alternative & Adjacent Pathways
            </h2>
            <p className="text-xs text-brand-muted">
              Secondary roles that leverage your complementary technical foundations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alternative.map((item, idx) => (
              <Card
                key={idx}
                className="border border-brand-border shadow-soft p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-brand-border/70">
                    <h3 className="text-sm font-heading font-bold text-brand-charcoal">
                      {item.role}
                    </h3>
                    <span className="text-xs font-heading font-bold px-2 py-0.5 rounded-full bg-brand-bg text-brand-charcoal border border-brand-border">
                      {item.recommendationScore}% Fit
                    </span>
                  </div>

                  <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                    {item.whyRecommended}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border/70">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() =>
                      navigate(`/roadmaps?role=${encodeURIComponent(item.role)}`, {
                        state: {
                          role: item.role,
                          missingSkills: item.missingSkills,
                          autoGenerate: true,
                        },
                      })
                    }
                    className="text-xs font-heading font-medium"
                  >
                    Explore Roadmap for {item.role}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRecommendationsPage;
