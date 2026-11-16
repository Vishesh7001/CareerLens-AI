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
      // First check if resume exists
      const resumeRes = await resumeService.getResume();
      if (!resumeRes?.success || !resumeRes.resume) {
        setIsLoading(false);
        return;
      }

      // Check saved recommendations
      try {
        const savedRes = await jobService.getSavedCareerRecommendations();
        if (savedRes?.success && savedRes.recommendations) {
          setRecommendations(savedRes.recommendations);
          setIsLoading(false);
          return;
        }
      } catch {
        // No saved recommendations yet, generate fresh
      }

      // Generate initial recommendations
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
        <p className="text-sm font-medium text-slate-600">
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
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-medium">
            <Compass className="w-3.5 h-3.5" />
            Phase 4.5 Career Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Career Path Recommendations
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Data-backed career paths for students and freshers. Evaluated across 12 standard engineering roles with personalized project ideas and preparation priorities.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={Sparkles}
          isLoading={isGenerating}
          onClick={handleRefresh}
          className="flex-shrink-0"
        >
          {isGenerating ? 'Evaluating Paths...' : 'Refresh Career Paths'}
        </Button>
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

      {/* Student Guidance Callout */}
      {recommendations?.studentAdvice && (
        <Card className="border border-teal-200 bg-teal-50/30 shadow-xs">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-teal-950">
                Fresher & Student Career Guidance
              </h4>
              <p className="text-xs sm:text-sm text-teal-900 leading-relaxed">
                {recommendations.studentAdvice}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Primary Career Paths */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Primary Career Recommendations
          </h2>
          <p className="text-xs text-slate-500">
            Top roles with maximum skill overlap and natural trajectory from your existing background
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {primary.map((item, idx) => (
            <Card
              key={idx}
              className="border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider block">
                      Rank #{idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {item.role}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex-shrink-0">
                    {item.recommendationScore}% Fit
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.whyRecommended}
                </p>

                {/* Existing Skills */}
                {item.relevantExistingSkills && item.relevantExistingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Existing Matching Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.relevantExistingSkills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
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
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Skills to Acquire:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.missingSkills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Ideas */}
                {item.suggestedProjects && item.suggestedProjects.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                      Suggested Showcase Projects:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {item.suggestedProjects.map((p, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/analysis`)}
                  icon={ArrowRight}
                >
                  Analyze Resume for this Role
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Alternative Career Paths */}
      {alternative.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Alternative & Complementary Paths
            </h2>
            <p className="text-xs text-slate-500">
              Viable secondary careers you can pivot to with targeted short-term learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alternative.map((item, idx) => (
              <Card
                key={idx}
                className="border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{item.role}</h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {item.recommendationScore}% Fit
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  {item.whyRecommended}
                </p>

                {item.missingSkills && item.missingSkills.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    <strong className="text-slate-700">Next to learn: </strong>
                    {item.missingSkills.join(', ')}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRecommendationsPage;
