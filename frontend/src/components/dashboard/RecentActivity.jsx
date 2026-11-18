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
} from 'lucide-react';
import Card from '../common/Card';

const RecentActivity = ({ activities = [] }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'resume_upload':
        return <FileCheck2 className="w-4 h-4 text-brand-primary" />;
      case 'resume_analysis':
        return <Sparkles className="w-4 h-4 text-brand-sage" />;
      case 'job_match':
        return <Briefcase className="w-4 h-4 text-brand-primary" />;
      case 'roadmap_milestone':
        return <Map className="w-4 h-4 text-brand-primary" />;
      case 'interview_completed':
        return <MessageSquareCode className="w-4 h-4 text-brand-charcoal" />;
      default:
        return <Clock className="w-4 h-4 text-brand-muted" />;
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
    <Card className="border-brand-border p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Recent Career Activity
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Real timeline of resume updates, evaluations, milestones, and interview sessions
          </p>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="divide-y divide-brand-border/50">
          {activities.map((act) => (
            <div
              key={act.id}
              className="py-3.5 flex items-start justify-between gap-4 hover:bg-brand-bg px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white border border-brand-border flex-shrink-0 mt-0.5 shadow-soft-xs">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-xs font-heading font-bold text-brand-charcoal block truncate">
                    {act.title}
                  </span>
                  <p className="text-xs text-brand-muted leading-relaxed truncate max-w-md">
                    {act.description}
                  </p>
                  <span className="text-[10px] text-brand-muted/80 block pt-0.5">
                    {formatDate(act.timestamp)}
                  </span>
                </div>
              </div>

              {act.link && (
                <button
                  type="button"
                  onClick={() => navigate(act.link)}
                  className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 flex-shrink-0 self-center transition-colors group-hover:underline"
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
          <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-muted flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-heading font-semibold text-brand-charcoal">No Activities Recorded Yet</p>
          <p className="text-[11px] text-brand-muted max-w-xs mx-auto">
            Your career activities across resume analysis, job matching, and mock interviews will appear chronologically here.
          </p>
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
