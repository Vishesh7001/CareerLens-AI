import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Compass,
  ArrowRight,
  Map,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const getJobTypeBadge = (type) => {
  const norm = (type || 'Full-time').toLowerCase();
  if (norm.includes('intern')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (norm.includes('entry')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (norm.includes('part')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const JobCard = ({ job, onEdit, onDelete, isDeleting = false }) => {
  const navigate = useNavigate();

  const reqSkills = job.extractedRequirements?.requiredSkills || [];
  const prefSkills = job.extractedRequirements?.preferredSkills || [];

  return (
    <Card className="border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header: Company & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {job.companyName}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getJobTypeBadge(
                  job.jobType
                )}`}
              >
                {job.jobType}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {job.jobTitle}
            </h3>
          </div>

          {/* Quick Edit/Delete */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(job)}
              title="Edit Job Description"
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(job._id)}
              disabled={isDeleting}
              title="Delete Job"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location & Deadline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location || 'Remote / Hybrid'}
          </span>
          {job.applicationDeadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deadline: {job.applicationDeadline}
            </span>
          )}
        </div>

        {/* Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.jobDescription}
        </p>

        {/* Extracted Skills Preview */}
        {reqSkills.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Extracted Required Skills ({reqSkills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {reqSkills.slice(0, 6).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
              {reqSkills.length > 6 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{reqSkills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          onClick={() => navigate(`/job-matching?jobId=${job._id}`)}
          className="flex-1 sm:flex-none"
        >
          Match with Resume
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={Map}
          onClick={() => navigate(`/roadmaps?jobId=${job._id}`)}
        >
          Learning Roadmap
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
