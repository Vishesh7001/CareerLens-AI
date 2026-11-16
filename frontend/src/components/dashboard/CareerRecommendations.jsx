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
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Resume Improvement':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'Skill Development':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'Job Preparation':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'Interview Preparation':
        return <MessageSquareCode className="w-4 h-4 text-purple-600" />;
      case 'Learning Roadmap':
        return <Map className="w-4 h-4 text-teal-600" />;
      default:
        return <Compass className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <Card className="border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-slate-900">
              Personalized Career Recommendations
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted, priority actions synthesized from your resume, skill gaps, and interview reports
          </p>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getTypeIcon(rec.type)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {rec.type}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      rec.priority
                    )}`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rec.description}
                </p>

                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                  <div>
                    <span className="font-semibold text-slate-500">Reason:</span> {rec.reason}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Source:</span> {rec.sourceData}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">
                  {rec.suggestedAction}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(rec.actionUrl)}
                  className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1 flex-shrink-0"
                >
                  <span>{rec.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">All recommendations up to date!</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Great job! You have satisfied all immediate career action items. Continue with mock interviews or explore new career paths.
          </p>
        </div>
      )}
    </Card>
  );
};

export default CareerRecommendations;
