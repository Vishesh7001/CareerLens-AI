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

  // Handle selected file validation and state
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
    <Card className="border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isReplacement ? 'Upload New Resume Version' : 'Upload Your Resume'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {isReplacement
              ? 'Uploading a new PDF will replace your currently parsed resume and re-analyze all sections.'
              : 'Upload your resume in PDF format to extract skills, experience, education, and career insights.'}
          </p>
        </div>

        {isReplacement && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Error Banner */}
      {displayError && (
        <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold block text-xs uppercase tracking-wide text-red-800">
              Upload Error
            </span>
            <span className="text-xs">{displayError}</span>
          </div>
          <button
            onClick={() => {
              setValidationError('');
              if (onClearError) onClearError();
            }}
            className="text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Drop Zone */}
      <div className="mt-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer select-none ${
            isDragOver
              ? 'border-brand-primary bg-sky-50/60 ring-4 ring-sky-100'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleInputChange}
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isDragOver
                  ? 'bg-brand-primary text-white scale-110 shadow-lg'
                  : selectedFile
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-500 border border-slate-200 shadow-sm'
              }`}
            >
              {selectedFile ? (
                <FileCheck className="w-7 h-7" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                {selectedFile ? (
                  <span className="text-emerald-700">Resume ready for processing</span>
                ) : (
                  <>
                    <span className="text-brand-primary hover:underline">Click to browse</span> or drag and drop your resume
                  </>
                )}
              </p>
              <p className="text-xs text-slate-500">
                PDF documents only (max file size 5 MB)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected File Details & Upload Action */}
      {selectedFile && (
        <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono">{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] font-bold text-slate-400">PDF</span>
                </div>
              </div>
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Remove selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Progress Bar (when uploading) */}
          {isUploading && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-brand-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  {uploadProgress < 100
                    ? `Uploading file (${uploadProgress}%)...`
                    : 'Extracting text & analyzing structure...'}
                </span>
                <span className="font-semibold text-slate-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
              >
                Choose Different File
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              isLoading={isUploading}
              disabled={isUploading}
              onClick={handleStartUpload}
            >
              {isReplacement ? 'Replace & Parse Resume' : 'Upload & Parse Resume'}
            </Button>
          </div>
        </div>
      )}

      {/* Feature Highlights Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Automatic Text Extraction</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Categorized Skill Tagging</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Isolated User Storage</span>
        </div>
      </div>
    </Card>
  );
};

export default ResumeUploadCard;
