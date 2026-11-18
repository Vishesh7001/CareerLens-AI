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
    return entries;
  };

  const breakdownEntries = getBreakdownEntries();

  const toggleQuestionAccordion = (id) => {
    setExpandedQuestion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Award className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Comprehensive Evaluation Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Interview Performance Report
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Detailed assessment for <strong className="text-white">{displayRole}</strong> ({interviewType}, {difficulty} level). Completed on {formatDate(completedAt || createdAt)}.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => navigate('/mock-interview')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-heading font-medium"
          >
            Practice Again
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={History}
            onClick={() => navigate('/interview-history')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-heading font-medium"
          >
            All Sessions
          </Button>
        </div>
      </div>

      {/* Main Score & Rubric Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Score Dial */}
        <Card className="lg:col-span-5 border-brand-border p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-heading font-bold text-brand-muted uppercase tracking-wider">
            Overall Interview Score
          </span>

          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-brand-border bg-brand-bg shadow-soft-xs">
            <div className="text-center">
              <span className={`text-5xl font-heading font-black ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-xs text-brand-muted block font-heading font-bold -mt-1">
                out of 100
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-heading font-bold border ${getLabelBadge(
                performanceLabel
              )}`}
            >
              {performanceLabel}
            </span>
            <p className="text-xs text-brand-muted max-w-xs pt-1">
              Answered {answeredCount} of {totalQuestions} questions successfully
            </p>
          </div>
        </Card>

        {/* Dimension Breakdown Meters */}
        <Card className="lg:col-span-7 border-brand-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Rubric Dimension Breakdown
            </h3>
            <span className="text-xs text-brand-muted font-heading">
              Average Across Questions
            </span>
          </div>

          {breakdownEntries.length > 0 ? (
            <div className="space-y-3.5 pt-1">
              {breakdownEntries.map(([dim, val]) => (
                <div key={dim} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-semibold text-brand-charcoal capitalize">
                      {dim.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-brand-charcoal">{val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-brand-bg border border-brand-border/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressColor(val)}`}
                      style={{ width: `${Math.max(5, val)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-brand-muted italic py-6 text-center">
              Dimension breakdown will populate as more questions are evaluated.
            </p>
          )}
        </Card>
      </div>

      {/* Strengths & Improvement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-brand-border p-6 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/70 text-brand-primary">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-heading font-bold text-brand-charcoal">
              Consolidated Strengths
            </h3>
          </div>
          {summaryFeedback?.strengths?.length > 0 ? (
            <ul className="space-y-2 text-xs text-brand-slate leading-relaxed">
              {summaryFeedback.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-primary font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-muted italic">Clear baseline communication maintained.</p>
          )}
        </Card>

        <Card className="border-brand-border p-6 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/70 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-heading font-bold text-brand-charcoal">
              Priority Improvement Areas
            </h3>
          </div>
          {summaryFeedback?.areasForImprovement?.length > 0 ? (
            <ul className="space-y-2 text-xs text-brand-slate leading-relaxed">
              {summaryFeedback.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-muted italic">No critical deficiencies identified.</p>
          )}
        </Card>
      </div>

      {/* Question-by-Question Review Accordion */}
      <Card className="border-brand-border p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Detailed Question-by-Question Review
            </h3>
            <p className="text-xs text-brand-muted">
              Inspect your answers, rubric scores, missing concepts, and ideal benchmark responses
            </p>
          </div>
          <span className="text-xs font-heading font-semibold text-brand-muted">
            {answeredQuestions.length} Evaluated
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestion === q._id;
            const evalData = q.evaluation;
            const score = evalData?.overallScore || 0;

            return (
              <div
                key={q._id || idx}
                className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-soft-xs transition-all duration-150"
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleQuestionAccordion(q._id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-brand-bg transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider">
                        Question {idx + 1}
                      </span>
                      <span className="text-brand-muted">•</span>
                      <span className="text-[11px] font-heading font-medium text-brand-primary">
                        {q.category || 'Technical'}
                      </span>
                    </div>
                    <h4 className="text-sm font-heading font-bold text-brand-charcoal truncate max-w-xl">
                      {q.questionText}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {evalData && (
                      <span className={`text-xs font-heading font-bold ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-brand-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brand-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-brand-border/70 bg-brand-bg space-y-4 text-xs leading-relaxed animate-in fade-in-50">
                    {/* Full Question */}
                    <div>
                      <span className="font-heading font-bold text-brand-charcoal block mb-1">
                        Question Prompt:
                      </span>
                      <p className="text-brand-slate bg-white p-3 rounded-xl border border-brand-border">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Candidate's Answer */}
                    <div>
                      <span className="font-heading font-bold text-brand-charcoal block mb-1">
                        Your Submitted Response:
                      </span>
                      <p className="text-brand-slate bg-white p-3 rounded-xl border border-brand-border whitespace-pre-wrap">
                        {q.answer || 'No answer submitted'}
                      </p>
                    </div>

                    {/* Benchmark Sample Answer */}
                    {evalData?.improvedSampleAnswer && (
                      <div className="p-4 rounded-xl bg-brand-forestLight/50 border border-brand-sageBorder/50 space-y-1.5">
                        <span className="font-heading font-bold text-brand-primary flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Ideal Benchmark Response:
                        </span>
                        <p className="text-brand-charcoal whitespace-pre-wrap">
                          {evalData.improvedSampleAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default InterviewReportView;
