import React, { useState } from 'react';
import {
  Sparkles,
  Briefcase,
  FileText,
  ChevronDown,
  Layers,
  Code2,
  Cpu,
  Database,
  Terminal,
  Shield,
  Bot,
  Brain,
  Search,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { PREDEFINED_ROLES } from '../../services/analysisService';

const ROLE_ICONS = {
  'Software Developer': Code2,
  'Frontend Developer': Layers,
  'Backend Developer': Terminal,
  'Full Stack Developer': Code2,
  'Data Analyst': Database,
  'Data Scientist': Brain,
  'Machine Learning Engineer': Cpu,
  'AI Engineer': Bot,
  'DevOps Engineer': Terminal,
  'Cybersecurity Analyst': Shield,
};

const RoleSelector = ({
  selectedRole,
  setSelectedRole,
  customRole,
  setCustomRole,
  jobDescription,
  setJobDescription,
  onAnalyze,
  isAnalyzing,
  hasExistingAnalysis,
  disabled = false,
}) => {
  const [showJdInput, setShowJdInput] = useState(Boolean(jobDescription));

  const isCustom = selectedRole === 'Custom Role';
  const effectiveRole = isCustom ? customRole.trim() : selectedRole;
  const canSubmit = Boolean(effectiveRole && effectiveRole.length >= 2);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit && !isAnalyzing && !disabled) {
      onAnalyze();
    }
  };

  return (
    <Card className="border-brand-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-heading font-bold text-brand-charcoal flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-primary" />
              Target Career Role <span className="text-brand-danger">*</span>
            </label>
            <span className="text-xs text-brand-muted">
              Select or specify your target position
            </span>
          </div>

          {/* Role Selection Pills / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
            {PREDEFINED_ROLES.map((role) => {
              const Icon = ROLE_ICONS[role] || Code2;
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleClick(role)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-forestLight text-brand-primary font-heading font-bold shadow-soft-xs ring-1 ring-brand-primary'
                      : 'border-brand-border bg-white text-brand-slate hover:border-brand-borderDark hover:bg-brand-bg font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-1.5 ${
                      isSelected ? 'text-brand-primary' : 'text-brand-muted'
                    }`}
                  />
                  <span className="text-xs leading-tight line-clamp-2">{role}</span>
                </button>
              );
            })}

            {/* Custom Role Pill */}
            <button
              type="button"
              onClick={() => handleRoleClick('Custom Role')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 ${
                isCustom
                  ? 'border-brand-primary bg-brand-forestLight text-brand-primary font-heading font-bold shadow-soft-xs ring-1 ring-brand-primary'
                  : 'border-brand-border bg-white text-brand-slate hover:border-brand-borderDark hover:bg-brand-bg font-medium'
              }`}
            >
              <Search
                className={`w-4 h-4 mb-1.5 ${
                  isCustom ? 'text-brand-primary' : 'text-brand-muted'
                }`}
              />
              <span className="text-xs leading-tight">Custom Role</span>
            </button>
          </div>
        </div>

        {/* Custom Role Input field (when Custom Role is selected) */}
        {isCustom && (
          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-2 animate-in fade-in-50">
            <label className="block text-xs font-heading font-semibold text-brand-charcoal">
              Enter Custom Job Title <span className="text-brand-danger">*</span>
            </label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Senior Distributed Systems Engineer, React Native Specialist"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal placeholder-brand-muted/70 shadow-soft-xs"
              disabled={isAnalyzing || disabled}
              autoFocus
            />
          </div>
        )}

        {/* Optional Custom Job Description Toggle */}
        <div className="pt-2 border-t border-brand-border/70">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowJdInput(!showJdInput)}
              className="text-xs font-heading font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {showJdInput
                  ? 'Hide Specific Job Description'
                  : '+ Paste Specific Job Description (Optional)'}
              </span>
            </button>
            <span className="text-[11px] text-brand-muted hidden sm:inline">
              Enhances ATS keyword matching precision
            </span>
          </div>

          {showJdInput && (
            <div className="mt-3 space-y-1.5 animate-in fade-in-50">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job requirements, responsibilities, and desired qualifications here to tailor the ATS scoring to this exact opportunity..."
                rows={5}
                className="w-full p-3.5 text-xs sm:text-sm bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-charcoal placeholder-brand-muted/70 leading-relaxed shadow-soft-xs"
                disabled={isAnalyzing || disabled}
              />
              <div className="flex justify-between items-center text-[10px] text-brand-muted px-1">
                <span>Supports full job postings up to 10,000 characters</span>
                <span>{jobDescription.length} characters</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-brand-muted">
            Targeting:{' '}
            <strong className="text-brand-charcoal font-heading font-bold">
              {effectiveRole || 'Select a role above'}
            </strong>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Sparkles}
            isLoading={isAnalyzing}
            disabled={!canSubmit || isAnalyzing || disabled}
            className="w-full sm:w-auto font-heading font-semibold"
          >
            {isAnalyzing
              ? 'Analyzing Resume Intelligence...'
              : hasExistingAnalysis
              ? 'Re-Run ATS Analysis'
              : 'Run ATS Resume Analysis'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RoleSelector;
