import React from 'react';
import {
  FolderGit2,
  Briefcase,
  Lightbulb,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import Card from '../common/Card';

const getRelevanceBadge = (relevance) => {
  const norm = (relevance || 'medium').toLowerCase();
  if (norm === 'high') {
    return 'bg-brand-forestLight text-brand-primary border-brand-sageBorder/60';
  }
  if (norm === 'low') {
    return 'bg-brand-bg text-brand-muted border-brand-border';
  }
  return 'bg-amber-50 text-amber-800 border-amber-200';
};

const formatExperienceLevel = (rawLevel) => {
  if (!rawLevel) return 'Experience Level: Entry Level';
  const clean = rawLevel.trim();
  if (clean.toLowerCase().endsWith('level')) {
    return `Experience Level: ${clean}`;
  }
  return `Experience Level: ${clean} Level`;
};

const getExperienceSummary = (summary, hasExp) => {
  if (!hasExp && (!summary || summary.toLowerCase().includes('no formal'))) {
    return 'No work or internship experience listed in your resume yet.';
  }
  const match = summary?.match(/\b(\d+)\b/);
  if (match) {
    const count = match[1];
    return `You have ${count} work or internship experience${count === '1' ? '' : 's'} in your resume.`;
  }
  if (summary) {
    return summary
      .replace(
        /^Recorded\s+(\d+)\s+professional experience\s*\/\s*internship position\(s\)[^.]*/i,
        'You have $1 work or internship experiences in your resume'
      )
      .replace(/at [a-zA-Z\s/-]+ level\.?/i, '')
      .trim();
  }
  return hasExp
    ? 'You have work or internship experience listed in your resume.'
    : 'No work or internship experience listed in your resume yet.';
};

const getWhatItShows = (feedback, hasExp) => {
  if (!hasExp && (!feedback || feedback.toLowerCase().includes('academic projects'))) {
    return 'For college students and freshers, practical projects, hackathons, and coursework show your technical abilities.';
  }
  if (!feedback) {
    return hasExp
      ? 'Your resume shows relevant work or internship background for this role.'
      : 'Highlight your academic projects and coursework to show your skills.';
  }

  const rolesMatch = feedback.match(/Roles?:\s*([^.]+)/i);
  if (rolesMatch) {
    const rolesList = rolesMatch[1].trim();
    const parts = rolesList.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 2) {
      return `Your resume includes experience as an ${parts[0]} and ${parts[1]}.`;
    }
    if (parts.length === 1) {
      const art = /^[aeiou]/i.test(parts[0]) ? 'an' : 'a';
      return `Your resume includes experience as ${art} ${parts[0]}.`;
    }
    if (parts.length > 2) {
      const last = parts.pop();
      return `Your resume includes experience as ${parts.join(', ')}, and ${last}.`;
    }
  }

  const clean = feedback
    .replace(/Demonstrates commercial exposure\.?/gi, '')
    .replace(/ATS action & impact analysis:?/gi, '')
    .replace(/Architectural ownership and impact:?/gi, '')
    .trim();

  if (clean.length > 0) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return 'Your resume highlights practical experience in your field.';
};

const ProjectExperienceCard = ({ projectAnalysis = [], experienceAnalysis = {} }) => {
  const {
    hasExperience = false,
    level = 'Entry',
    summary: expSummary = '',
    feedback: expFeedback = '',
  } = experienceAnalysis;

  return (
    <div className="space-y-6">
      {/* Projects Analysis Section */}
      <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-brand-charcoal">Projects Evaluation</h3>
              <p className="text-xs text-brand-muted">
                Assessment of project relevance, technologies, and technical complexity
              </p>
            </div>
          </div>
          <span className="text-xs font-heading font-semibold px-2.5 py-1 rounded-full bg-brand-bg text-brand-charcoal border border-brand-border">
            {projectAnalysis.length} {projectAnalysis.length === 1 ? 'Project' : 'Projects'} Reviewed
          </span>
        </div>

        {projectAnalysis.length > 0 ? (
          <div className="space-y-3.5 pt-1">
            {projectAnalysis.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-brand-border/80 bg-brand-bg hover:bg-white hover:border-brand-borderDark transition-all duration-150 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-heading font-bold text-brand-charcoal">
                      {proj.title || `Project #${idx + 1}`}
                    </span>
                  </div>
                  <span
                    className={`inline-flex self-start sm:self-auto text-[11px] font-heading font-semibold px-2.5 py-0.5 rounded-full border ${getRelevanceBadge(
                      proj.relevance
                    )}`}
                  >
                    {proj.relevance || 'Medium'} Relevance
                  </span>
                </div>

                {/* Technologies */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-heading font-medium px-2 py-0.5 rounded-lg bg-white text-brand-charcoal border border-brand-border shadow-soft-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                {proj.feedback && (
                  <p className="text-xs text-brand-slate leading-relaxed">
                    <strong className="text-brand-charcoal font-heading font-semibold">Evaluation: </strong>
                    {proj.feedback}
                  </p>
                )}

                {/* Suggestions */}
                {proj.suggestions && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-brand-forestLight/50 border border-brand-sageBorder/50 text-xs text-brand-charcoal leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-heading font-semibold text-brand-primary">Recommendation: </strong>
                      {proj.suggestions}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-muted italic py-3">
            No projects extracted to evaluate. Adding at least two full-stack or data projects significantly elevates ATS ranking.
          </p>
        )}
      </Card>

      {/* 2. Work Experience Review Section */}
      <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-brand-charcoal">
                Work Experience Review
              </h3>
              <p className="text-xs text-brand-muted">
                See how your work and internship experience looks in your resume.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto inline-flex items-center text-xs font-heading font-bold px-2.5 py-1 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60 flex-shrink-0">
            {formatExperienceLevel(level)}
          </span>
        </div>

        <div className="space-y-3 pt-0.5">
          {/* Section 1: Your Experience */}
          <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border/70 space-y-1">
            <h4 className="text-xs font-heading font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
              Your Experience
            </h4>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-sans">
              {getExperienceSummary(expSummary, hasExperience)}
            </p>
          </div>

          {/* Section 2: What Your Experience Shows */}
          <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border/70 space-y-1">
            <h4 className="text-xs font-heading font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-primary" />
              What Your Experience Shows
            </h4>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-sans">
              {getWhatItShows(expFeedback, hasExperience)}
            </p>
          </div>

          {/* Section 3: How to Improve */}
          <div className="p-3.5 rounded-xl bg-brand-forestLight/50 border border-brand-sageBorder/60 space-y-1.5">
            <h4 className="text-xs font-heading font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
              How to Improve
            </h4>
            <p className="text-xs sm:text-sm text-brand-charcoal leading-relaxed font-sans">
              Try to explain what you worked on, which tools or technologies you used, and what you achieved. Add numbers or results wherever possible.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectExperienceCard;
