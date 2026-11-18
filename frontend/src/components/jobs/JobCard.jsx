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
    return 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60';
  }
  if (norm.includes('entry')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  if (norm.includes('part')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return 'bg-brand-bg text-brand-charcoal border-brand-border';
};

const JobCard = ({ job, onEdit, onDelete, isDeleting = false }) => {
  const navigate = useNavigate();

  const reqSkills = job.extractedRequirements?.requiredSkills || [];
  const prefSkills = job.extractedRequirements?.preferredSkills || [];

  return (
    <Card className="border border-brand-border shadow-soft hover:shadow-soft-md hover:border-brand-borderDark transition-all duration-200 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Top Header: Company & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-heading font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-brand-muted" />
                {job.companyName}
              </span>
              <span
                className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full border ${getJobTypeBadge(
                  job.jobType
                )}`}
              >
                {job.jobType}
              </span>
            </div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal leading-snug group-hover:text-brand-primary transition-colors">
              {job.jobTitle}
            </h3>
          </div>

          {/* Quick Edit/Delete */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(job)}
              title="Edit Job Description"
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(job._id)}
              disabled={isDeleting}
              title="Delete Job"
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-danger hover:bg-red-50/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Location & Deadline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-muted" />
            {job.location || 'Remote / Hybrid'}
          </span>
          {job.applicationDeadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-muted" />
              Deadline: {job.applicationDeadline}
            </span>
          )}
        </div>

        {/* Snippet */}
        <p className="text-xs text-brand-slate line-clamp-2 leading-relaxed">
          {job.jobDescription}
        </p>

        {/* Extracted Required Skills preview */}
        {reqSkills.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-muted">
              Core Skills ({reqSkills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {reqSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-heading font-medium px-2 py-0.5 rounded-lg bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60"
                >
                  {skill}
                </span>
              ))}
              {reqSkills.length > 4 && (
                <span className="text-[10px] font-heading font-medium px-1.5 py-0.5 rounded-lg bg-brand-bg text-brand-muted border border-brand-border">
                  +{reqSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-4 mt-4 border-t border-brand-border/70 flex items-center justify-between gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={Sparkles}
          onClick={() => navigate(`/job-matching?jobId=${job._id}`)}
          className="font-heading font-semibold text-xs"
        >
          Match Compatibility
        </Button>

        <button
          type="button"
          onClick={() => navigate(`/job-matching?jobId=${job._id}`)}
          className="text-xs font-heading font-semibold text-brand-muted hover:text-brand-charcoal flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
};

export default JobCard;
