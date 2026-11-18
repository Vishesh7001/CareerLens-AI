import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Upload,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileCheck2,
  Target,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { resumeService } from '../services/resumeService';
import { analysisService, PREDEFINED_ROLES } from '../services/analysisService';
import RoleSelector from '../components/analysis/RoleSelector';
import ScoreOverviewCard from '../components/analysis/ScoreOverviewCard';
import StrengthsWeaknessesCard from '../components/analysis/StrengthsWeaknessesCard';
import TechnicalSkillsCard from '../components/analysis/TechnicalSkillsCard';
import ProjectExperienceCard from '../components/analysis/ProjectExperienceCard';

const AnalysisPage = () => {
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoadingResume(true);
      setError('');

      try {
        const resumeRes = await resumeService.getResume();
        if (!isMounted) return;

        if (resumeRes?.success && resumeRes.resume) {
          const userResume = resumeRes.resume;
          setResume(userResume);

          try {
            const analysisRes = await analysisService.getAnalysis(userResume._id);
            if (isMounted && analysisRes?.success && analysisRes.analysis) {
              const savedAnalysis = analysisRes.analysis;
              setAnalysis(savedAnalysis);

              if (PREDEFINED_ROLES.includes(savedAnalysis.targetRole)) {
                setSelectedRole(savedAnalysis.targetRole);
              } else {
                setSelectedRole('Custom Role');
                setCustomRole(savedAnalysis.targetRole);
              }
              if (savedAnalysis.jobDescription) {
                setJobDescription(savedAnalysis.jobDescription);
              }
            }
          } catch {
            // Not fatal: no saved analysis yet
          }
        } else {
          setResume(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load resume details.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingResume(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnalyze = async () => {
    if (!resume?._id) {
      setError('No active resume found to analyze.');
      return;
    }

    const effectiveRole =
      selectedRole === 'Custom Role' ? customRole.trim() : selectedRole;

    if (!effectiveRole || effectiveRole.length < 2) {
      setError('Please provide a valid career role title (at least 2 characters).');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsAnalyzing(true);

    try {
      const res = await analysisService.runAnalysis(
        resume._id,
        effectiveRole,
        jobDescription
      );

      if (res?.success && res.analysis) {
        setAnalysis(res.analysis);
        setSuccessMessage(
          `Analysis successfully generated for "${res.analysis.targetRole}".`
        );

        setTimeout(() => {
          const el = document.getElementById('analysis-results');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        throw new Error(res?.message || 'Failed to generate analysis.');
      }
    } catch (err) {
      setError(
        err.message ||
          'Analysis failed. Please check your inputs or try again shortly.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAnalysis = async () => {
    if (!resume?._id || !analysis) return;

    if (!window.confirm('Are you sure you want to delete this resume analysis?')) {
      return;
    }

    setIsDeleting(true);
    setError('');
    try {
      await analysisService.deleteAnalysis(resume._id, analysis.targetRole);
      setAnalysis(null);
      setSuccessMessage('Resume analysis removed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete analysis record.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingResume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Loading your resume intelligence profile...
        </p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-forestLight text-brand-primary flex items-center justify-center mx-auto border border-brand-sageBorder/60 shadow-soft-xs">
          <FileText className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-brand-charcoal tracking-tight">
            No Resume Found
          </h2>
          <p className="text-sm text-brand-slate max-w-md mx-auto leading-relaxed">
            Upload your PDF resume on the workspace dashboard to unlock AI-powered ATS scoring, skills breakdown, and personalized recommendations.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            icon={Upload}
            onClick={() => navigate('/dashboard#resume-section')}
          >
            Upload Resume Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Target className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Intelligent ATS Review & Benchmarking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Resume Intelligence & ATS Scoring
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Benchmark your resume against specific target engineering roles or custom job descriptions. Get transparent scoring across 6 key categories, evidence-based strengths, and high-impact missing skills.
          </p>
        </div>

        {/* Current Resume Pill */}
        <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-soft-xs">
          <FileCheck2 className="w-6 h-6 text-brand-forestLight flex-shrink-0" />
          <div className="text-xs">
            <span className="block text-[#A4B0A4] font-medium">Active Candidate Resume</span>
            <span className="font-heading font-bold text-white truncate max-w-[180px] block">
              {resume.originalFileName}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
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

      {/* Role Selection & Analysis Configuration */}
      <RoleSelector
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        customRole={customRole}
        setCustomRole={setCustomRole}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        hasExistingAnalysis={Boolean(analysis)}
      />

      {/* Analysis Results Display */}
      {analysis && (
        <div id="analysis-results" className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Header Action Bar for Results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-xl font-heading font-bold text-brand-charcoal tracking-tight">
                Analysis Results & Recommendations
              </h2>
              <p className="text-xs text-brand-muted">
                Detailed evaluation for{' '}
                <strong className="text-brand-charcoal">{analysis.targetRole}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={handleDeleteAnalysis}
                isLoading={isDeleting}
                className="text-brand-danger hover:border-red-300 hover:bg-red-50/50"
              >
                Delete Analysis
              </Button>
            </div>
          </div>

          {/* 1. Score Overview Card (Rubric Breakdown) */}
          <ScoreOverviewCard analysis={analysis} />

          {/* 2. Strengths and Weaknesses */}
          <StrengthsWeaknessesCard
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
          />

          {/* 3. Technical Skills & Missing Skills with Priority */}
          <TechnicalSkillsCard
            technicalSkillsAnalysis={analysis.technicalSkillsAnalysis}
            missingSkills={analysis.missingSkills}
          />

          {/* 4. Projects & Experience Analysis */}
          <ProjectExperienceCard
            projectAnalysis={analysis.projectAnalysis}
            experienceAnalysis={analysis.experienceAnalysis}
          />
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
