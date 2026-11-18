import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  HardDrive,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ResumeUploadCard from './ResumeUploadCard';
import ParsedResumeView from './ParsedResumeView';
import resumeService from '../../services/resumeService';
import { formatFileSize } from '../../utils/validation';

const ResumeSection = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentResume = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await resumeService.getResume();
        if (isMounted) {
          setResume(response.resume || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve your current resume.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentResume();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resumeService.uploadResume(file, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(percent, 90));
        }
      });

      setUploadProgress(100);
      setResume(response.resume);
      setIsReplacing(false);
      setSuccessMessage(response.message || 'Resume uploaded and parsed successfully!');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err.message || 'Resume upload failed. Please verify your file and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;
    setIsDownloading(true);
    setError(null);

    try {
      await resumeService.downloadResume(resume.originalFileName);
    } catch (err) {
      setError(err.message || 'Failed to download resume file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await resumeService.deleteResume();
      setResume(null);
      setShowDeleteModal(false);
      setIsReplacing(false);
      setSuccessMessage(response.message || 'Resume deleted successfully.');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to delete resume.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-brand-border py-16 text-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-brand-muted font-heading font-medium">
          Loading resume intelligence data...
        </p>
      </Card>
    );
  }

  return (
    <div id="resume-section" className="space-y-6">
      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-brand-forestLight border border-brand-sageBorder/60 flex items-center justify-between text-brand-primary text-sm shadow-soft-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
            <span className="font-heading font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-brand-primary/70 hover:text-brand-primary p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && !isReplacing && !isUploading && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 flex items-center justify-between text-brand-danger text-sm shadow-soft-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-brand-danger flex-shrink-0" />
            <span className="font-heading font-semibold">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-brand-danger/70 hover:text-brand-danger p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* No Resume uploaded yet: show upload form */}
      {!resume && (
        <ResumeUploadCard
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={error}
          onClearError={() => setError(null)}
        />
      )}

      {/* Active Resume State */}
      {resume && (
        <>
          {/* Active Resume Control Bar */}
          <Card className="border-brand-border bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* File details */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-heading font-bold text-brand-charcoal truncate max-w-md" title={resume.originalFileName}>
                      {resume.originalFileName}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60">
                      <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                      Parsing Completed
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
                    <span className="flex items-center gap-1 font-mono">
                      <HardDrive className="w-3.5 h-3.5 text-brand-muted" />
                      {formatFileSize(resume.fileSize)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-muted" />
                      Uploaded {formatDate(resume.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 text-brand-primary font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Encrypted & Isolated
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-brand-border/70">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => navigate('/analysis')}
                >
                  Analyze with AI
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  disabled={isDownloading || isUploading}
                >
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => setIsReplacing(!isReplacing)}
                  disabled={isUploading}
                >
                  {isReplacing ? 'Hide Replace Form' : 'Replace Resume'}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isUploading || isDeleting}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>

          {/* Replacement Form (toggleable) */}
          {isReplacing && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <ResumeUploadCard
                onUpload={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={error}
                isReplacement={true}
                onCancel={() => setIsReplacing(false)}
                onClearError={() => setError(null)}
              />
            </div>
          )}

          {/* Parsed Resume Sections */}
          <ParsedResumeView
            parsedData={resume.parsedData}
            rawText={resume.rawText}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-soft-lg border border-brand-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-brand-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-heading font-bold text-brand-charcoal">
                  Delete Resume?
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  This action will permanently delete your stored resume PDF from the server disk and erase all extracted parsed data. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/70">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
