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
    <Card className="border border-slate-200/90 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-primary" />
              Target Career Role <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-500">
              Select or specify your target position
            </span>
          </div>

          {/* Role Selection Pills / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
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
                      ? 'border-brand-primary bg-sky-50/70 text-brand-primary font-semibold ring-1 ring-brand-primary shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 font-medium'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1.5 ${
                      isSelected ? 'text-brand-primary' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-xs leading-tight line-clamp-2">{role}</span>
                </button>
              );
            })}

            {/* Custom Role Option */}
            <button
              type="button"
              onClick={() => handleRoleClick('Custom Role')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 ${
                isCustom
                  ? 'border-brand-primary bg-sky-50/70 text-brand-primary font-semibold ring-1 ring-brand-primary shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 font-medium'
              }`}
            >
              <Search
                className={`w-5 h-5 mb-1.5 ${
                  isCustom ? 'text-brand-primary' : 'text-slate-500'
                }`}
              />
              <span className="text-xs leading-tight">Custom Role</span>
            </button>
          </div>

          {/* Custom Role Input Box */}
          {isCustom && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fadeIn">
              <label
                htmlFor="custom-role-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Specify Custom Role Name <span className="text-red-500">*</span>
              </label>
              <input
                id="custom-role-input"
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Cloud Architect, Mobile iOS Engineer, QA Automation Specialist"
                maxLength={100}
                required
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900 shadow-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter any technical or engineering job title for targeted AI analysis.
              </p>
            </div>
          )}
        </div>

        {/* Optional Job Description Section */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowJdInput((prev) => !prev)}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {showJdInput ? 'Hide Job Description' : '+ Add Job Description for targeted matching (Optional)'}
              </span>
            </button>
            {showJdInput && (
              <span className="text-[11px] text-slate-400">
                {jobDescription?.length || 0} / 5000 characters
              </span>
            )}
          </div>

          {showJdInput && (
            <div className="mt-3 animate-fadeIn">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting, key qualifications, or required tech stack here. CareerLens AI will evaluate your resume specifically against these expectations."
                rows={4}
                maxLength={5000}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Optional: When provided, missing skills and project relevance will be weighted against this specific job description.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            {effectiveRole ? (
              <span>
                Target Role: <strong className="text-slate-800">{effectiveRole}</strong>
              </span>
            ) : (
              <span>Please select or enter a target career role to proceed.</span>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            icon={Sparkles}
            isLoading={isAnalyzing}
            disabled={!canSubmit || disabled || isAnalyzing}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold shadow-md"
          >
            {isAnalyzing
              ? 'Analyzing Resume...'
              : hasExistingAnalysis
              ? 'Re-Analyze Resume'
              : 'Analyze Resume with AI'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RoleSelector;
