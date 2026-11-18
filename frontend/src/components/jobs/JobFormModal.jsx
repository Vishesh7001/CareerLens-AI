import React, { useState, useEffect } from 'react';
import { X, Briefcase, Building, MapPin, Calendar, FileText, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Remote',
  'Entry-Level',
];

const JobFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobType: 'Full-time',
    location: '',
    applicationDeadline: '',
    jobDescription: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        jobTitle: initialData.jobTitle || '',
        companyName: initialData.companyName || '',
        jobType: initialData.jobType || 'Full-time',
        location: initialData.location || '',
        applicationDeadline: initialData.applicationDeadline || '',
        jobDescription: initialData.jobDescription || '',
      });
    } else {
      setFormData({
        jobTitle: '',
        companyName: '',
        jobType: 'Full-time',
        location: '',
        applicationDeadline: '',
        jobDescription: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    } else if (formData.jobDescription.trim().length < 20) {
      newErrors.jobDescription = 'Job description should be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isLoading) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-soft-lg border border-brand-border animate-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-brand-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center shadow-soft-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-brand-charcoal">
                {initialData ? 'Edit Target Job' : 'Add Target Job Description'}
              </h3>
              <p className="text-xs text-brand-muted">
                Extract skills and benchmark your resume against real requirements
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              name="jobTitle"
              placeholder="e.g. Junior Full Stack Developer"
              required
              startIcon={Briefcase}
              value={formData.jobTitle}
              onChange={handleChange}
              error={errors.jobTitle}
              disabled={isLoading}
            />

            <Input
              label="Company Name"
              name="companyName"
              placeholder="e.g. Stripe, Acme Corp"
              required
              startIcon={Building}
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-medium text-brand-charcoal mb-1.5">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                disabled={isLoading}
                className="block w-full rounded-xl border border-brand-border text-sm py-2.5 px-3 bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-soft-xs"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Location"
              name="location"
              placeholder="e.g. Remote, Bengaluru"
              startIcon={MapPin}
              value={formData.location}
              onChange={handleChange}
              disabled={isLoading}
            />

            <Input
              label="Application Deadline"
              name="applicationDeadline"
              placeholder="e.g. 2026-12-31"
              startIcon={Calendar}
              value={formData.applicationDeadline}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-heading font-medium text-brand-charcoal">
              Job Description / Requirements <span className="text-brand-danger">*</span>
            </label>
            <textarea
              name="jobDescription"
              rows={6}
              value={formData.jobDescription}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Paste the full job description, responsibilities, technical requirements, and qualifications here..."
              className={`w-full p-3.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all leading-relaxed shadow-soft-xs ${
                errors.jobDescription
                  ? 'border-brand-danger/60 focus:ring-brand-danger/20 text-brand-charcoal'
                  : 'border-brand-border focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal'
              }`}
            />
            {errors.jobDescription && (
              <p className="text-xs text-brand-danger flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.jobDescription}</span>
              </p>
            )}
            <div className="flex justify-between text-[11px] text-brand-muted">
              <span>Our NLP extractor identifies required vs preferred competencies</span>
              <span>{formData.jobDescription.length} characters</span>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-brand-border/70 flex items-center justify-end gap-3 bg-brand-bg">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {initialData ? 'Save Changes' : 'Create & Parse Job'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobFormModal;
