import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import Card from '../common/Card';

const AnswerEvaluationCard = ({ evaluation, category = 'technical' }) => {
  const [copied, setCopied] = useState(false);
  const [showCriteria, setShowCriteria] = useState(true);

  if (!evaluation) return null;

  const {
    overallScore = 0,
    performanceLabel = 'Needs Improvement',
    criterionScores = {},
    strengths = [],
    weaknesses = [],
    missingConcepts = [],
    improvementSuggestions = [],
    improvedSampleAnswer = '',
    explanation = '',
    provider = 'fastapi-ai-engine',
  } = evaluation;

  const handleCopy = () => {
    if (!improvedSampleAnswer) return;
    navigator.clipboard.writeText(improvedSampleAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLabelBadge = (label) => {
    switch (label) {
      case 'Excellent':
        return 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60';
      case 'Good':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Average':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-red-50 text-brand-danger border-red-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-brand-primary';
    if (score >= 70) return 'text-emerald-700';
    if (score >= 50) return 'text-amber-700';
    return 'text-brand-danger';
  };

  const getProgressColor = (score) => {
    if (score >= 85) return 'bg-brand-primary';
    if (score >= 70) return 'bg-emerald-600';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-brand-danger';
  };

  const formatCriterionName = (key) => {
    const map = {
      technicalAccuracy: 'Technical Accuracy (40%)',
      technical_accuracy: 'Technical Accuracy (40%)',
      relevance: 'Relevance (25%)',
      completeness: 'Completeness (20%)',
      clarity: category === 'technical' ? 'Clarity (15%)' : 'Clarity (25%)',
      structureAndCommunication: 'Structure & Communication (15%)',
      structure_and_communication: 'Structure & Communication (15%)',
      examplesAndSpecificity: 'Examples & Specificity (15%)',
      examples_and_specificity: 'Examples & Specificity (15%)',
    };
    return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  };

  const scoresList = Object.entries(criterionScores || {});

  return (
    <Card className="border-brand-border bg-white shadow-soft space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner: Score & Performance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-brand-border/70">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex-shrink-0 shadow-soft-xs">
            <span className={`text-2xl font-heading font-black ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="text-[10px] text-brand-muted absolute bottom-1 font-heading font-bold">
              /100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-heading font-bold text-brand-charcoal">
                Multi-Factor Answer Evaluation
              </h3>
              <span
                className={`text-xs font-heading font-bold px-2.5 py-0.5 rounded-full border ${getLabelBadge(
                  performanceLabel
                )}`}
              >
                {performanceLabel}
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Evaluated against real-time interview rubrics
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCriteria(!showCriteria)}
          className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 self-end sm:self-auto transition-colors"
        >
          <span>{showCriteria ? 'Hide Rubric Breakdown' : 'Show Rubric Breakdown'}</span>
          {showCriteria ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Criterion Breakdown Progress Bars */}
      {showCriteria && scoresList.length > 0 && (
        <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-3 animate-in fade-in-50">
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted block">
            Rubric Dimensions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scoresList.map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-charcoal font-heading font-semibold">
                    {formatCriterionName(key)}
                  </span>
                  <span className="font-mono font-bold text-brand-charcoal">{val}/100</span>
                </div>
                <div className="w-full bg-white h-2 rounded-full border border-brand-border/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(val)}`}
                    style={{ width: `${Math.max(5, val)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identified Strengths */}
        <div className="p-4 rounded-xl bg-brand-forestLight/40 border border-brand-sageBorder/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-brand-primary">
            <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span>Identified Strengths</span>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-brand-charcoal leading-relaxed">
              {strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-brand-primary font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-muted italic">Clear baseline articulation detected.</p>
          )}
        </div>

        {/* Priority Areas for Improvement */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Areas for Improvement</span>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-brand-charcoal leading-relaxed">
              {weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-muted italic">No major red flags detected.</p>
          )}
        </div>
      </div>

      {/* Missing Concepts Chips */}
      {missingConcepts.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-heading font-bold text-brand-charcoal uppercase tracking-wider block">
            Missing Key Concepts to Mention
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="text-xs font-heading font-medium px-2.5 py-1 rounded-xl bg-brand-bg text-brand-danger border border-brand-danger/30 shadow-soft-xs"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ideal Sample Benchmark Answer */}
      {improvedSampleAnswer && (
        <div className="p-5 rounded-2xl bg-brand-bg border border-brand-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-charcoal">
                Ideal Benchmark Answer
              </h4>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Benchmark</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed whitespace-pre-line font-sans">
            {improvedSampleAnswer}
          </p>
        </div>
      )}
    </Card>
  );
};

export default AnswerEvaluationCard;
