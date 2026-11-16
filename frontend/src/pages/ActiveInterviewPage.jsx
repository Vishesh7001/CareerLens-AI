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

  // Load session from server
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

          // If session already completed, redirect to report
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

  // Calculate live word count
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = answerText.length;

  // Save Draft handler
  const handleSaveDraft = async () => {
    if (!interview || isAnswered) return;
    setIsSavingDraft(true);
    setError('');
    setDraftSavedMessage('');

    try {
      await interviewService.saveDraft(interviewId, answerText, currentIdx);
      setDraftSavedMessage('Draft saved successfully.');
      setTimeout(() => setDraftSavedMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit Answer handler
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setError('Please write an answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await interviewService.submitAnswer(interviewId, answerText, currentIdx);
      if (res?.success && res.question) {
        // Update local session state with evaluation
        const updatedQuestions = [...interview.questions];
        updatedQuestions[currentIdx] = res.question;

        setInterview({
          ...interview,
          questions: updatedQuestions,
          completionPercentage: res.completionPercentage || interview.completionPercentage,
        });
      } else {
        throw new Error(res?.message || 'Failed to evaluate answer.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer for evaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next Question handler
  const handleNextQuestion = async () => {
    setError('');

    if (isLastQuestion) {
      // Complete interview and go to report
      try {
        setIsSubmitting(true);
        await interviewService.completeInterview(interviewId);
        navigate(`/mock-interview/${interviewId}/report`);
      } catch (err) {
        setError(err.message || 'Failed to complete interview.');
        setIsSubmitting(false);
      }
      return;
    }

    try {
      await interviewService.nextQuestion(interviewId);
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);

      const nextQ = interview.questions[nextIdx];
      setAnswerText(nextQ?.answer || nextQ?.draftAnswer || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to advance to next question.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Preparing your active mock interview room...
        </p>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unable to Load Interview</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <Button onClick={() => navigate('/mock-interview')}>
          Configure New Interview
        </Button>
      </div>
    );
  }

  const totalQ = interview?.totalQuestions || 5;
  const progressPercent = Math.round(((currentIdx + (isAnswered ? 1 : 0)) / totalQ) * 100);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Header & Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-brand-navy">
              {interview.customRole || interview.role}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {interview.interviewType}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {interview.difficulty}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Question <strong className="text-slate-800">{currentIdx + 1}</strong> of{' '}
            <strong className="text-slate-800">{totalQ}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Progress bar */}
          <div className="flex items-center gap-2.5 flex-1 sm:w-40">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600 min-w-[32px]">
              {progressPercent}%
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={LogOut}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => setShowExitModal(true)}
          >
            Exit
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Question Card */}
      {currentQuestion && (
        <Card className="p-6 sm:p-7 border-slate-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                  currentQuestion.category === 'technical'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {currentQuestion.category} Question
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Topic: <strong>{currentQuestion.topic}</strong>
              </span>
            </div>

            {isAnswered && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Answer Evaluated
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          {/* Answer Editor Area */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold text-slate-700">
                {isAnswered ? 'Your Submitted Answer' : 'Your Answer (Text Response)'}
              </label>
              <div className="flex items-center gap-3">
                {draftSavedMessage && (
                  <span className="text-emerald-600 font-medium animate-pulse">
                    {draftSavedMessage}
                  </span>
                )}
                <span>
                  Words: <strong className="text-slate-700">{wordCount}</strong> | Characters:{' '}
                  <strong className="text-slate-700">{charCount}</strong>
                </span>
              </div>
            </div>

            <textarea
              rows={7}
              disabled={isAnswered || isSubmitting}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder={
                currentQuestion.category === 'technical'
                  ? 'Explain the technical concepts, architecture, and practical use cases clearly...'
                  : 'Structure your answer using the STAR method: Situation, Task, Action, Result...'
              }
              className={`w-full p-4 rounded-xl border text-sm leading-relaxed font-mono transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                isAnswered
                  ? 'bg-slate-50/80 border-slate-200 text-slate-800 cursor-not-allowed'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div>
              {!isAnswered && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Save}
                  isLoading={isSavingDraft}
                  disabled={isSavingDraft || isSubmitting || !answerText.trim()}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {!isAnswered ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={CheckCircle2}
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !answerText.trim()}
                  onClick={handleSubmitAnswer}
                  className="w-full sm:w-auto px-6"
                >
                  Submit Answer & Evaluate
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  icon={ArrowRight}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-6"
                >
                  {isLastQuestion ? 'Complete Interview & View Report' : 'Next Question'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* AI Evaluation Card (Shows after submission) */}
      {isAnswered && currentQuestion.evaluation && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            AI Evaluation & Feedback
          </div>
          <AnswerEvaluationCard
            evaluation={currentQuestion.evaluation}
            category={currentQuestion.category}
          />

          {/* Bottom Next Question CTA */}
          <div className="flex justify-end pt-3">
            <Button
              variant="secondary"
              size="lg"
              icon={ArrowRight}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleNextQuestion}
              className="px-8 shadow-sm"
            >
              {isLastQuestion ? 'Complete Interview & View Report' : 'Proceed to Next Question'}
            </Button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 border-slate-200 shadow-xl bg-white animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-amber-600" />
              Exit Mock Interview?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your answered questions and saved drafts are stored safely in MongoDB. You can resume this session anytime from your <strong>Interview History</strong> page.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitModal(false)}
              >
                Continue Interview
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('/interview-history')}
              >
                Exit to History
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ActiveInterviewPage;
