import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  FileCheck,
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { validateResumeFile, formatFileSize } from '../../utils/validation';

const ResumeUploadCard = ({
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  error = null,
  isReplacement = false,
  onCancel,
  onClearError,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setValidationError('');
    if (onClearError) onClearError();

    if (!file) return;

    const validationMsg = validateResumeFile(file);
    if (validationMsg) {
      setValidationError(validationMsg);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setValidationError('');
    if (onClearError) onClearError();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartUpload = () => {
    if (!selectedFile || isUploading) return;
    onUpload(selectedFile);
  };

  const displayError = validationError || error;

  return (
    <Card className="border-brand-border">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center shadow-soft-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-heading font-bold text-brand-charcoal">
              {isReplacement ? 'Upload New Resume Version' : 'Upload Your Resume'}
            </h2>
          </div>
          <p className="text-xs text-brand-muted">
            Drop your PDF resume to extract skills, work history, projects, and education automatically.
          </p>
        </div>

        {isReplacement && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="text-xs font-heading font-medium text-brand-muted hover:text-brand-charcoal flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div className="mt-5 space-y-4">
        {displayError && (
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-brand-danger/30 flex items-start gap-2.5 text-brand-danger text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{displayError}</div>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-brand-primary bg-brand-forestLight/50 scale-[1.005]'
              : 'border-brand-border bg-brand-bg hover:border-brand-sageBorder hover:bg-brand-forestLight/20'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-brand-border shadow-soft-xs flex items-center justify-center text-brand-primary">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-heading font-bold text-brand-charcoal">
                <span className="text-brand-primary hover:underline">Click to upload</span> or drag and drop your resume
              </p>
              <p className="text-xs text-brand-muted">
                PDF format only, maximum file size 5MB
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-brand-muted pt-2">
              <span className="flex items-center gap-1 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-brand-primary" />
                Automatic ATS Parser
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                Phone & Email Extraction
              </span>
            </div>
          </div>
        </div>

        {/* Selected file preview */}
        {selectedFile && !isUploading && (
          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between gap-4 animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-brand-border text-brand-danger flex items-center justify-center flex-shrink-0 shadow-soft-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-heading font-bold text-brand-charcoal truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-brand-muted font-mono">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-charcoal hover:bg-white transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartUpload}
                icon={UploadCloud}
              >
                Upload & Parse
              </Button>
            </div>
          </div>
        )}

        {/* Upload progress state */}
        {isUploading && (
          <div className="p-4 rounded-xl bg-brand-forestLight/40 border border-brand-sageBorder/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-heading font-semibold text-brand-primary">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                Uploading & Parsing PDF Resume...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-brand-border overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResumeUploadCard;
