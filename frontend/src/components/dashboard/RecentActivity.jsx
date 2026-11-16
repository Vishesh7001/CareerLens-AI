import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  FileCheck2,
  Sparkles,
  Briefcase,
  Map,
  MessageSquareCode,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Card from '../common/Card';

const RecentActivity = ({ activities = [] }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'resume_upload':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'resume_analysis':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'job_match':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'roadmap_milestone':
        return <Map className="w-4 h-4 text-teal-600" />;
      case 'interview_completed':
        return <MessageSquareCode className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <Card className="border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-slate-900">
              Recent Career Activity
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real timeline of resume updates, evaluations, milestones, and interview sessions
          </p>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {activities.map((act) => (
            <div
              key={act.id}
              className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {act.title}
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed truncate max-w-md">
                    {act.description}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {formatDate(act.timestamp)}
                  </span>
                </div>
              </div>

              {act.link && (
                <button
                  type="button"
                  onClick={() => navigate(act.link)}
                  className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 flex-shrink-0 self-center"
                >
                  <span className="hidden sm:inline">View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No activity recorded yet</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Upload your resume or run a job match to begin your activity timeline.
          </p>
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
