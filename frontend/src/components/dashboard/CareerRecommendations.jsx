import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Cpu,
  Briefcase,
  MessageSquareCode,
  Map,
  Compass,
} from 'lucide-react';
import Card from '../common/Card';

const CareerRecommendations = ({ recommendations = [] }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-brand-danger border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Resume Improvement':
        return <FileCheck2 className="w-4 h-4 text-brand-primary" />;
      case 'Skill Development':
        return <Cpu className="w-4 h-4 text-brand-charcoal" />;
      case 'Job Preparation':
        return <Briefcase className="w-4 h-4 text-brand-primary" />;
      case 'Interview Preparation':
        return <MessageSquareCode className="w-4 h-4 text-brand-charcoal" />;
      case 'Learning Roadmap':
        return <Map className="w-4 h-4 text-brand-primary" />;
      default:
        return <Compass className="w-4 h-4 text-brand-muted" />;
    }
  };

  return (
    <Card className="border-brand-border p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              Personalized Career Recommendations
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Targeted, priority actions synthesized from your resume, skill gaps, and interview reports
          </p>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-brand-border/80 bg-brand-bg hover:bg-white hover:border-brand-borderDark hover:shadow-soft-xs transition-all duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white border border-brand-border shadow-soft-xs">
                      {getTypeIcon(rec.type)}
                    </div>
                    <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider">
                      {rec.type}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      rec.priority
                    )}`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-heading font-bold text-brand-charcoal leading-snug">
                  {rec.title}
                </h4>

                <p className="text-xs text-brand-slate leading-relaxed">
                  {rec.description}
                </p>

                <div className="text-[11px] text-brand-muted space-y-0.5 pt-1">
                  <div>
                    <span className="font-heading font-semibold text-brand-charcoal">Reason:</span> {rec.reason}
                  </div>
                  {rec.impact && (
                    <div>
                      <span className="font-heading font-semibold text-brand-charcoal">Expected Impact:</span> {rec.impact}
                    </div>
                  )}
                </div>
              </div>

              {rec.actionUrl && (
                <div className="pt-2 border-t border-brand-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      if (rec.actionUrl.includes('#')) {
                        const el = document.getElementById('resume-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        else navigate(rec.actionUrl);
                      } else {
                        navigate(rec.actionUrl);
                      }
                    }}
                    className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 transition-colors"
                  >
                    <span>{rec.actionText || 'Take Action'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-muted flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-heading font-semibold text-brand-charcoal">All Caught Up!</p>
          <p className="text-[11px] text-brand-muted max-w-sm mx-auto">
            You have active milestones across all categories. Continue taking mock interviews or updating your resume to surface new recommendations.
          </p>
        </div>
      )}
    </Card>
  );
};

export default CareerRecommendations;
