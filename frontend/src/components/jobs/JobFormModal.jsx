import React, { useState, useEffect } from 'react';
import { X, Briefcase, Building, MapPin, Calendar, FileText, Loader2, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const JOB_TYPES = ['Full-time', 'Internship', 'Entry-level', 'Part-time'];

const JobFormModal = ({ isOpen, onClose, onSave, initialData = null, isSaving = false }) => {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [location, setLocation] = useState('Remote / Hybrid');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName || '');
      setJobTitle(initialData.jobTitle || '');
      setJobType(initialData.jobType || 'Full-time');
      setLocation(initialData.location || 'Remote / Hybrid');
      setApplicationDeadline(initialData.applicationDeadline || '');
      setJobDescription(initialData.jobDescription || '');
    } else {
      setCompanyName('');
      setJobTitle('');
      setJobType('Full-time');
      setLocation('Remote / Hybrid');
      setApplicationDeadline('');
      setJobDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!jobTitle.trim()) {
      setError('Job title is required.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 10) {
      setError('Job description must be at least 10 characters.');
      return;
    }
    if (jobDescription.trim().length > 20000) {
      setError('Job description cannot exceed 20,000 characters.');
      return;
    }

    onSave({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobType,
      location: location.trim(),
      applicationDeadline: applicationDeadline ? applicationDeadline.trim() : null,
      jobDescription: jobDescription.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Target Job' : 'Add Target Job Description'}
              </h3>
              <p className="text-xs text-slate-500">
                {initialData ? 'Update company details or job description text' : 'Paste details from a job posting for AI requirement extraction'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Razorpay, TCS, Startup"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={150}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer, Frontend Intern"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  maxLength={150}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Remote, Hybrid"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={150}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 30 Nov 2026 / Rolling"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  maxLength={50}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Complete Job Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {jobDescription.length} / 20000 characters
              </span>
            </div>
            <textarea
              required
              rows={8}
              placeholder="Paste the full job posting from LinkedIn, Naukri, or the company career page. CareerLens AI will extract required vs preferred technical skills, qualifications, and responsibilities."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              maxLength={20000}
              className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs font-sans leading-relaxed"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              icon={Sparkles}
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Processing & Saving...' : initialData ? 'Update Job' : 'Save & Extract Requirements'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
