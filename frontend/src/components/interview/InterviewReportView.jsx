import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  History,
  FileCheck2,
  Clock,
  Compass,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const InterviewReportView = ({ report }) => {
  const navigate = useNavigate();
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  if (!report) return null;

  const {
    role = 'Software Developer',
    customRole,
    interviewType = 'Technical Interview',
    difficulty = 'Intermediate',
    totalQuestions = 5,
    overallScore = 0,
    performanceLabel = 'Needs Improvement',
    completionPercentage = 0,
    performanceBreakdown = {},
    summaryFeedback = {},
    questions = [],
    createdAt,
    completedAt,
  } = report;

  const displayRole = customRole || role;

  const answeredQuestions = questions.filter((q) => q.status === 'answered');
  const answeredCount = answeredQuestions.length;
  const skippedCount = Math.max(0, totalQuestions - answeredCount);

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

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const getBreakdownEntries = () => {
    if (!performanceBreakdown) return [];
    let entries = [];
    if (performanceBreakdown instanceof Map) {
      entries = Array.from(performanceBreakdown.entries());
    } else if (typeof performanceBreakdown === 'object') {
      entries = Object.entries(performanceBreakdown);
    }
    return entries
      .filter(([_, val]) => val !== null && val !== undefined && !isNaN(val))
      .map(([key, val]) => [key, Math.round(Number(val))]);
  };

  const breakdownEntries = getBreakdownEntries();

  const formatCriterionLabel = (key) => {
    const labels = {
      technicalAccuracy: 'Technical Accuracy',
      technical_accuracy: 'Technical Accuracy',
      relevance: 'Relevance',
      completeness: 'Completeness',
      clarity: 'Clarity',
      structureAndCommunication: 'Structure & Communication',
      structure_and_communication: 'Structure & Communication',
      examplesAndSpecificity: 'Examples & Specificity',
      examples_and_specificity: 'Examples & Specificity',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-navy to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium">
            <Award className="w-3.5 h-3.5" />
            Phase 5 Mock Interview Performance Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Interview Performance: {displayRole}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              {interviewType}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Difficulty: <strong className="text-white">{difficulty}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              {formatDate(completedAt || createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={History}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/interview-history')}
          >
            All Interviews
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => navigate('/mock-interview')}
          >
            New Interview
          </Button>
        </div>
      </div>

      {/* SECTION 2 & 3: Overall Performance & Rubric Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <Card className="flex flex-col items-center justify-center p-6 text-center space-y-4 border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Interview Score
          </span>
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-50 shadow-inner">
            <div className="text-center">
              <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="block text-[11px] font-semibold text-slate-400">/100</span>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getLabelBadge(
                performanceLabel
              )}`}
            >
              <Award className="w-3.5 h-3.5" />
              {performanceLabel}
            </span>
          </div>
          <div className="w-full pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="text-slate-400 block">Total</span>
              <strong className="text-slate-700 font-bold">{totalQuestions}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Answered</span>
              <strong className="text-emerald-600 font-bold">{answeredCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Completion</span>
              <strong className="text-sky-600 font-bold">{completionPercentage}%</strong>
            </div>
          </div>
        </Card>

        {/* Performance Breakdown across Criteria */}
        <Card className="lg:col-span-2 p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-primary" />
                Performance Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Average score achieved across evaluated rubric dimensions
              </p>
            </div>
          </div>

          {breakdownEntries.length > 0 ? (
            <div className="space-y-3 pt-2">
              {breakdownEntries.map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span className="font-semibold text-slate-800">
                      {formatCriterionLabel(key)}
                    </span>
                    <span className="font-bold text-slate-900">{val}/100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
                        val
                      )}`}
                      style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                No evaluated rubric breakdown available.
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Rubric dimensions (such as Technical Accuracy, Relevance, Completeness, and Clarity) will populate here once questions are answered and evaluated.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* SECTION 4: Strengths & Weaknesses Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <Card className="p-6 border-emerald-200/80 bg-emerald-50/20 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Key Strengths Identified
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {(summaryFeedback.strengths || []).length > 0 ? (
              summaryFeedback.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific strengths recorded.</li>
            )}
          </ul>
        </Card>

        {/* Areas for Improvement */}
        <Card className="p-6 border-amber-200/80 bg-amber-50/20 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Areas for Technical & Structural Improvement
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {(summaryFeedback.weaknesses || []).length > 0 ? (
              summaryFeedback.weaknesses.map((wk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{wk}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific weaknesses recorded.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* SECTION 5: Interview Readiness Assessment */}
      <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          CareerLens AI Readiness Assessment
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          {summaryFeedback.readinessAssessment ||
            'Review the individual question feedback and sample answers below to reinforce your interview readiness.'}
        </p>
        <p className="text-xs text-slate-400 italic">
          Disclaimer: This mock evaluation evaluates conceptual breadth and communication clarity. It is designed for preparation and learning, not as an official hiring guarantee.
        </p>
      </Card>

      {/* SECTION 6: Question-by-Question Detailed Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-primary" />
            Question-by-Question Detailed Analysis
          </h3>
          <span className="text-xs text-slate-500">
            Click on any question to view candidate answer, score, and benchmark
          </span>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            const evalData = q.evaluation;
            const qScore = evalData?.overallScore ?? evalData?.overall_score ?? 0;

            return (
              <Card
                key={idx}
                className="border-slate-200 p-0 overflow-hidden transition-all duration-200"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between text-left gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        Q{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          q.category === 'technical'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {q.topic}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 self-center">
                    {q.status === 'answered' ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          qScore >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : qScore >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {qScore}/100
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
                        Skipped
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
                    {/* Candidate Answer */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Your Submitted Answer
                      </span>
                      <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                        {q.answer || (
                          <span className="text-slate-400 italic font-sans">
                            No answer submitted for this question.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Evaluation Details */}
                    {evalData && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {evalData.strengths?.length > 0 && (
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                              <span className="font-bold text-emerald-800 block mb-1">
                                Strengths:
                              </span>
                              <ul className="space-y-1 text-slate-700">
                                {evalData.strengths.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {evalData.weaknesses?.length > 0 && (
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <span className="font-bold text-amber-800 block mb-1">
                                Missing Concepts / Improvements:
                              </span>
                              <ul className="space-y-1 text-slate-700">
                                {evalData.weaknesses.map((w, i) => (
                                  <li key={i}>• {w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Benchmark Sample Answer */}
                        {evalData.improvedSampleAnswer && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                              Benchmark Sample Answer
                            </span>
                            <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                              {evalData.improvedSampleAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewReportView;
