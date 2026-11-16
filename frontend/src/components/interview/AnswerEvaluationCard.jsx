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

  // Label color styling
  const getLabelBadge = (label) => {
    switch (label) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Good':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Average':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-sky-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-sky-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatCriterionName = (key) => {
    const map = {
      technicalAccuracy: 'Technical Accuracy (40%)',
      technical_accuracy: 'Technical Accuracy (40%)',
      relevance: category === 'technical' ? 'Relevance (25%)' : 'Relevance (25%)',
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
    <Card className="border-slate-200 bg-white shadow-sm space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Banner: Score & Performance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0">
            <span className={`text-2xl font-black ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="text-[10px] text-slate-400 absolute bottom-1 font-semibold">
              /100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLabelBadge(
                  performanceLabel
                )}`}
              >
                <Award className="w-3 h-3" />
                {performanceLabel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {provider === 'rule-based-fallback' ? 'Rule-Based Fallback' : 'AI Microservice'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 mt-1">{explanation}</p>
          </div>
        </div>

        <button
          onClick={() => setShowCriteria(!showCriteria)}
          className="text-xs font-medium text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 self-end sm:self-center"
        >
          {showCriteria ? 'Hide Rubric Breakdown' : 'Show Rubric Breakdown'}
          {showCriteria ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Criterion-wise Rubric Progress Bars */}
      {showCriteria && scoresList.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-primary" />
            Evaluation Criteria Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {scoresList.map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span className="capitalize">{formatCriterionName(key)}</span>
                  <span className="font-bold">{val}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(val)}`}
                    style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            Key Strengths
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-slate-700">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific strengths identified.</p>
          )}
        </div>

        {/* Missing Concepts & Areas for Improvement */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            Missing Concepts & Gaps
          </div>
          {missingConcepts.length > 0 || weaknesses.length > 0 ? (
            <div className="space-y-2 text-xs">
              {missingConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {missingConcepts.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 font-medium border border-amber-200 text-[11px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {weaknesses.length > 0 && (
                <ul className="space-y-1.5 text-slate-700">
                  {weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 font-medium">All core concepts were successfully addressed!</p>
          )}
        </div>
      </div>

      {/* Actionable Improvement Suggestions */}
      {improvementSuggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-800">
            <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
            Actionable Improvement Suggestions
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {improvementSuggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-sky-500 font-bold">→</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Sample Answer */}
      {improvedSampleAnswer && (
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <BookOpen className="w-4 h-4" />
              Improved Sample Answer (Benchmark)
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            {improvedSampleAnswer}
          </p>
          <p className="text-[11px] text-slate-400 italic">
            Tip: Use this sample answer as inspiration for depth and structure. Personalize it with your own project experiences.
          </p>
        </div>
      )}
    </Card>
  );
};

export default AnswerEvaluationCard;
