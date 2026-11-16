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
      setSuccessMessage('Job description deleted successfully.');
      fetchJobs();
    } catch (err) {
      setError(err.message || 'Failed to delete job description.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    return (
      (j.companyName && j.companyName.toLowerCase().includes(q)) ||
      (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
      (j.location && j.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium">
            <Briefcase className="w-3.5 h-3.5" />
            Phase 4.1 Target Job Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Target Job Descriptions
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Save and organize company job postings you want to target. CareerLens AI extracts key requirements to drive resume compatibility matching and customized roadmaps.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreate}
          className="flex-shrink-0"
        >
          Add Job Description
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, role, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900 shadow-2xs"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredJobs.length} of {jobs.length} saved jobs
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading your saved jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
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
        <div className="max-w-md mx-auto py-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Building className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Job Postings Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? 'No saved jobs match your current search query.'
                : 'Paste a job description from LinkedIn or a company careers portal to start matching.'}
            </p>
          </div>
          {!searchQuery && (
            <Button
              variant="secondary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Add Your First Job
            </Button>
          )}
        </div>
      )}

      {/* Form Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveJob}
        initialData={editingJob}
        isSaving={isSaving}
      />
    </div>
  );
};

export default JobsPage;
