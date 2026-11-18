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

  const completed = interviews.filter((i) => i.status === 'completed');
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completed.length
        )
      : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <History className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Preparation Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Mock Interview History
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Review past mock interview sessions, trace score trajectories across question rubrics, and resume incomplete sessions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => navigate('/mock-interview')}
          className="bg-brand-primary text-white hover:bg-brand-primaryHover flex-shrink-0 font-heading font-semibold"
        >
          New Interview
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-heading font-semibold text-brand-muted uppercase tracking-wider block">
              Total Sessions
            </span>
            <span className="text-2xl font-heading font-black text-brand-charcoal">
              {interviews.length}
            </span>
            <span className="text-[11px] text-brand-muted block mt-0.5">
              {completed.length} finalized
            </span>
          </div>
        </Card>

        <Card className="p-5 border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-soft-xs border border-amber-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-heading font-semibold text-brand-muted uppercase tracking-wider block">
              Average Score
            </span>
            <span className="text-2xl font-heading font-black text-brand-charcoal">
              {avgScore !== null ? `${avgScore}/100` : 'No Data'}
            </span>
            <span className="text-[11px] text-brand-muted block mt-0.5">
              Across completed sessions
            </span>
          </div>
        </Card>

        <Card className="p-5 border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-bg text-brand-charcoal flex items-center justify-center flex-shrink-0 shadow-soft-xs border border-brand-border">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-heading font-semibold text-brand-muted uppercase tracking-wider block">
              In-Progress
            </span>
            <span className="text-2xl font-heading font-black text-brand-charcoal">
              {interviews.length - completed.length}
            </span>
            <span className="text-[11px] text-brand-muted block mt-0.5">
              Can be resumed anytime
            </span>
          </div>
        </Card>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-3 animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-medium">{error}</div>
        </div>
      )}

      {/* Sessions List */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
          <p className="text-sm font-heading font-medium text-brand-muted">
            Loading past interview sessions...
          </p>
        </div>
      ) : interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((session) => {
            const isCompleted = session.status === 'completed';
            const displayRole = session.customRole || session.role;
            const score = session.overallScore || 0;

            return (
              <Card
                key={session._id}
                className="border-brand-border p-5 sm:p-6 hover:border-brand-borderDark hover:shadow-soft-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-heading font-bold text-brand-charcoal group-hover:text-brand-primary transition-colors">
                      {displayRole}
                    </h3>
                    <span
                      className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-[10px] font-heading font-medium px-2 py-0.5 rounded-full bg-brand-bg text-brand-muted border border-brand-border">
                      {session.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
                    <span className="flex items-center gap-1 font-medium">
                      <Layers className="w-3.5 h-3.5 text-brand-muted" />
                      {session.interviewType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-muted" />
                      {formatDate(session.createdAt)}
                    </span>
                    <span>•</span>
                    <span>{session.totalQuestions} questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center flex-shrink-0">
                  {isCompleted && (
                    <div className="text-right">
                      <span className={`text-xl font-heading font-black ${getScoreColor(score)}`}>
                        {score}
                        <span className="text-xs font-normal text-brand-muted">/100</span>
                      </span>
                      <span className="block text-[10px] font-heading font-bold text-brand-muted">
                        {session.performanceLabel}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/mock-interview/${session._id}/report`)}
                        className="font-heading font-semibold text-xs"
                      >
                        View Report
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => navigate(`/mock-interview/${session._id}`)}
                        className="font-heading font-semibold text-xs"
                      >
                        Resume
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => setInterviewToDelete(session)}
                      className="p-2 rounded-xl text-brand-muted hover:text-brand-danger hover:bg-red-50/50 transition-colors"
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
      ) : (
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-brand-border p-8 shadow-soft-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-forestLight text-brand-primary flex items-center justify-center mx-auto shadow-soft-xs">
            <MessageSquareCode className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              No Mock Interviews Completed Yet
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Experience realistic interview simulations evaluated in real time across Technical Accuracy, Relevance, Completeness, and Clarity.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/mock-interview')}
          >
            Start Your First Mock Interview
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {interviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-brand-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h4 className="text-base font-heading font-bold text-brand-charcoal">
                Delete Interview Session?
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                This will permanently delete this interview session record, question answers, and rubric evaluations.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/70">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInterviewToDelete(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                isLoading={Boolean(deletingId)}
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
