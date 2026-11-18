import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquareCode,
  Sparkles,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Compass,
  Award,
  LogOut,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AnswerEvaluationCard from '../components/interview/AnswerEvaluationCard';
import interviewService from '../services/interviewService';

const ActiveInterviewPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  // Session state
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answer editor states
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');

  // Status & modal states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      setIsLoading(true);
      setError('');

      try {
        const res = await interviewService.getInterviewById(interviewId);
        if (!isMounted) return;

        if (res?.success && res.interview) {
          const session = res.interview;
          setInterview(session);

          if (session.status === 'completed') {
            navigate(`/mock-interview/${interviewId}/report`, { replace: true });
            return;
          }

          const activeIdx = session.currentQuestionIndex || 0;
          setCurrentIdx(activeIdx);

          const curQ = session.questions[activeIdx];
          if (curQ) {
            setAnswerText(curQ.answer || curQ.draftAnswer || '');
          }
        } else {
          throw new Error(res?.message || 'Interview session not found.');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load interview session.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [interviewId, navigate]);

  const currentQuestion = interview?.questions?.[currentIdx];
  const isAnswered = currentQuestion?.status === 'answered' && Boolean(currentQuestion.evaluation);
  const isLastQuestion = interview?.questions && currentIdx >= interview.questions.length - 1;

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = answerText.length;

  const handleSaveDraft = async () => {
    if (!interview || isAnswered) return;
    setIsSavingDraft(true);
    setDraftSavedMessage('');

    try {
      await interviewService.saveDraft(interviewId, answerText, currentIdx);
      setDraftSavedMessage('Draft saved');
      setTimeout(() => setDraftSavedMessage(''), 3000);
    } catch {
      // Soft fail
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || answerText.trim().length < 10) {
      setError('Your answer should be at least 10 characters long to provide meaningful evaluation.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await interviewService.submitAnswer(
        interviewId,
        answerText.trim(),
        currentIdx
      );

      if (res?.success && res.interview) {
        setInterview(res.interview);
      } else {
        throw new Error(res?.message || 'Failed to evaluate answer.');
      }
    } catch (err) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setError('');
    try {
      const res = await interviewService.nextQuestion(interviewId, currentQuestion._id);
      if (res?.success && res.interview) {
        setInterview(res.interview);
        const nextIdx = res.interview.currentQuestionIndex || currentIdx + 1;
        setCurrentIdx(nextIdx);

        const nextQ = res.interview.questions[nextIdx];
        if (nextQ) {
          setAnswerText(nextQ.answer || nextQ.draftAnswer || '');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to navigate to next question.');
    }
  };

  const handleCompleteInterview = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await interviewService.completeInterview(interviewId);
      if (res?.success) {
        navigate(`/mock-interview/${interviewId}/report`);
      } else {
        throw new Error(res?.message || 'Failed to finalize report.');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Loading interview simulation...
        </p>
      </div>
    );
  }

  const answeredCount = interview?.questions?.filter((q) => q.status === 'answered').length || 0;
  const totalCount = interview?.questions?.length || 1;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Session Progress Bar */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-primary">
              {interview?.role}
            </span>
            <span className="text-brand-muted">•</span>
            <span className="text-xs text-brand-muted font-medium">
              {interview?.interviewType}
            </span>
            <span className="text-brand-muted">•</span>
            <span className="text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60">
              {interview?.difficulty}
            </span>
          </div>
          <div className="text-sm font-heading font-bold text-brand-charcoal">
            Question {currentIdx + 1} of {totalCount}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-heading font-bold text-brand-charcoal">
              {progressPercent}% Complete
            </span>
            <div className="w-32 bg-brand-bg rounded-full h-2 mt-1 border border-brand-border/60 overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="text-xs font-heading font-semibold text-brand-muted hover:text-brand-danger flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-red-50/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-3 animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-medium">{error}</div>
        </div>
      )}

      {/* Question Presentation Card */}
      <Card className="border-brand-border p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/70 text-xs text-brand-muted font-heading font-semibold">
          <span>Question Prompt</span>
          <span className="text-brand-primary">Category: {currentQuestion?.category || 'Technical'}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-heading font-bold text-brand-charcoal leading-snug">
          {currentQuestion?.questionText}
        </h2>

        {/* Tip / Guidance Banner */}
        <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border flex items-start gap-2.5 text-xs text-brand-slate leading-relaxed">
          <BookOpen className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-charcoal font-heading font-semibold">Evaluation Insight: </strong>
            Structure your answer using concrete principles, edge case considerations, and trade-offs. For behavioral questions, apply the STAR framework (Situation, Task, Action, Result).
          </div>
        </div>
      </Card>

      {/* Response Workspace Card */}
      {!isAnswered ? (
        <Card className="border-brand-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-heading font-bold uppercase tracking-wider text-brand-muted">
              Your Professional Response
            </span>
            <div className="flex items-center gap-3 text-brand-muted">
              {draftSavedMessage && (
                <span className="text-brand-primary font-heading font-semibold flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {draftSavedMessage}
                </span>
              )}
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          <textarea
            rows={8}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your structured answer here. Speak as you would in a real technical or behavioral interview..."
            className="w-full p-4 text-sm bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal placeholder-brand-muted/70 leading-relaxed shadow-soft-xs transition-colors"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Save}
              isLoading={isSavingDraft}
              disabled={isSubmitting || !answerText.trim()}
              onClick={handleSaveDraft}
              className="text-xs font-heading font-medium"
            >
              Save Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={Sparkles}
              isLoading={isSubmitting}
              disabled={isSubmitting || answerText.trim().length < 10}
              onClick={handleSubmitAnswer}
              className="font-heading font-semibold w-full sm:w-auto"
            >
              Submit Answer for Evaluation
            </Button>
          </div>
        </Card>
      ) : (
        /* Evaluation View after Answer Submission */
        <div className="space-y-6">
          <AnswerEvaluationCard
            evaluation={currentQuestion.evaluation}
            category={currentQuestion.category}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-brand-muted font-heading">
              Evaluated via Multi-Criteria Rubric
            </div>

            {!isLastQuestion ? (
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                onClick={handleNextQuestion}
                className="font-heading font-semibold"
              >
                Proceed to Question {currentIdx + 2}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={Award}
                isLoading={isSubmitting}
                onClick={handleCompleteInterview}
                className="font-heading font-semibold"
              >
                Complete & View Performance Report
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-brand-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h4 className="text-base font-heading font-bold text-brand-charcoal">
                Exit Interview Simulation?
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Your submitted evaluations and drafts are saved automatically. You can resume this session anytime from your Interview History page.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/70">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitModal(false)}
              >
                Resume Interview
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('/interview-history')}
              >
                Confirm Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveInterviewPage;
