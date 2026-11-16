import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  MessageSquareCode,
  Calendar,
  Layers,
  Award,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  Compass,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import interviewService from '../services/interviewService';

const InterviewHistoryPage = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [interviewToDelete, setInterviewToDelete] = useState(null);

  const fetchInterviews = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await interviewService.getInterviews();
      if (res?.success && res.interviews) {
        setInterviews(res.interviews);
      } else {
        setInterviews([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete) return;
    setDeletingId(interviewToDelete._id);

    try {
      await interviewService.deleteInterview(interviewToDelete._id);
      setInterviews((prev) => prev.filter((i) => i._id !== interviewToDelete._id));
      setInterviewToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete interview session.');
    } finally {
      setDeletingId(null);
    }
  };

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

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  // Compute summary stats
  const totalCount = interviews.length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const inProgressCount = interviews.filter((i) => i.status === 'in-progress').length;
  const completedScores = interviews
    .filter((i) => i.status === 'completed' && typeof i.overallScore === 'number')
    .map((i) => i.overallScore);
  const avgScore =
    completedScores.length > 0
      ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
      : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading your mock interview history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium">
            <History className="w-3.5 h-3.5" />
            Interview Practice Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mock Interview History
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Review previous performance reports, track score improvements over time, and resume in-progress practice sessions.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={() => navigate('/mock-interview')}
          className="self-start md:self-auto"
        >
          New Mock Interview
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center flex-shrink-0">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Sessions
            </span>
            <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 block">
              {completedCount} completed, {inProgressCount} in progress
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Average Score
            </span>
            <span
              className={`text-2xl font-bold ${
                avgScore !== null ? getScoreColor(avgScore) : 'text-slate-900'
              }`}
            >
              {avgScore !== null ? `${avgScore}/100` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 block">
              Across completed sessions
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Completion Rate
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500 block">
              Full interview completion
            </span>
          </div>
        </Card>
      </div>

      {/* Interview Sessions List */}
      {interviews.length === 0 ? (
        <Card className="p-12 text-center border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <MessageSquareCode className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              No Mock Interviews Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Configure your first AI mock interview to practice answering technical and HR questions tailored to your dream role.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/mock-interview')}
          >
            Start Your First Interview
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              All Interview Sessions ({totalCount})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {interviews.map((item) => {
              const isCompleted = item.status === 'completed';
              const displayRole = item.customRole || item.role;

              return (
                <Card
                  key={item._id}
                  className="p-5 border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {displayRole}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {item.difficulty}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {item.interviewType}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquareCode className="w-3.5 h-3.5 text-slate-400" />
                        {item.totalQuestions} Questions
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {isCompleted && typeof item.overallScore === 'number' ? (
                      <div className="text-right">
                        <span
                          className={`text-xl font-black ${getScoreColor(
                            item.overallScore
                          )} block`}
                        >
                          {item.overallScore}
                          <span className="text-xs text-slate-400 font-normal">/100</span>
                        </span>
                        {item.performanceLabel && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLabelBadge(
                              item.performanceLabel
                            )}`}
                          >
                            {item.performanceLabel}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-700 block">
                          {item.completionPercentage || 0}% Complete
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Q{(item.currentQuestionIndex || 0) + 1} of {item.totalQuestions}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/mock-interview/${item._id}/report`)}
                        >
                          View Report
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Play}
                          onClick={() => navigate(`/mock-interview/${item._id}`)}
                        >
                          Resume
                        </Button>
                      )}

                      <button
                        onClick={() => setInterviewToDelete(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {interviewToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 border-slate-200 shadow-xl bg-white animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              Delete Interview Session?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the mock interview session for{' '}
              <strong>{interviewToDelete.customRole || interviewToDelete.role}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={Boolean(deletingId)}
                onClick={() => setInterviewToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={Boolean(deletingId)}
                disabled={Boolean(deletingId)}
                onClick={handleDeleteConfirm}
              >
                Delete Session
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
