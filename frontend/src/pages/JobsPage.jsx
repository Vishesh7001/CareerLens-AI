import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import JobCard from '../components/jobs/JobCard';
import JobFormModal from '../components/jobs/JobFormModal';
import jobService from '../services/jobService';

const JobsPage = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Alerts
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchJobs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await jobService.getJobs();
      if (res?.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve saved jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (jobData) => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editingJob) {
        const res = await jobService.updateJob(editingJob._id, jobData);
        if (res?.success) {
          setSuccessMessage(`Job "${res.job.jobTitle}" updated successfully.`);
          setIsModalOpen(false);
          fetchJobs();
        }
      } else {
        const res = await jobService.createJob(jobData);
        if (res?.success) {
          setSuccessMessage(`Job "${res.job.jobTitle}" created and analyzed.`);
          setIsModalOpen(false);
          fetchJobs();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save job description.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job description?')) {
      return;
    }

    setDeletingId(jobId);
    setError('');
    try {
      await jobService.deleteJob(jobId);
      setSuccessMessage('Job posting removed successfully.');
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      setError(err.message || 'Failed to delete job posting.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    return (
      j.jobTitle?.toLowerCase().includes(q) ||
      j.companyName?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-brand-charcoal rounded-3xl p-7 sm:p-9 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-forestLight text-xs font-heading font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-brand-forestLight" />
            <span>Target Opportunity Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Target Job Descriptions
          </h1>
          <p className="text-[#B2BCB2] text-xs sm:text-sm leading-relaxed font-sans">
            Store and manage company job descriptions. Extract key competencies automatically and run multi-factor skill compatibility matches against your uploaded resume.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreate}
          className="bg-brand-primary text-white hover:bg-brand-primaryHover flex-shrink-0 font-heading font-semibold"
        >
          Add Target Job
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-3 animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-brand-forestLight border border-brand-sageBorder/60 text-brand-primary text-sm flex items-start gap-3 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-heading font-semibold">{successMessage}</div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal placeholder-brand-muted shadow-soft-xs"
          />
        </div>

        <div className="text-xs font-heading font-semibold text-brand-muted self-end sm:self-center">
          Showing {filteredJobs.length} of {jobs.length} Saved Roles
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
          <p className="text-sm font-heading font-medium text-brand-muted">
            Loading your target job descriptions...
          </p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteJob}
              isDeleting={deletingId === job._id}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-brand-border p-8 shadow-soft-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-forestLight text-brand-primary flex items-center justify-center mx-auto shadow-soft-xs">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-heading font-bold text-brand-charcoal">
              {searchQuery ? 'No Matching Jobs Found' : 'No Target Jobs Saved Yet'}
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Add a job description you are planning to apply for. Our AI parses required skills and calculates your match percentage.'}
            </p>
          </div>
          {!searchQuery && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Add Your First Target Job
            </Button>
          )}
        </div>
      )}

      {/* Job Form Modal */}
      {isModalOpen && (
        <JobFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveJob}
          initialData={editingJob}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default JobsPage;
