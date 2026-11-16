import React from 'react';
import {
  FolderGit2,
  Briefcase,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  Compass,
  TrendingUp,
} from 'lucide-react';
import Card from '../common/Card';

const getRelevanceBadge = (relevance) => {
  const norm = (relevance || 'medium').toLowerCase();
  if (norm === 'high') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (norm === 'low') {
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const ProjectExperienceCard = ({ projectAnalysis = [], experienceAnalysis = {} }) => {
  const {
    hasExperience = false,
    level = 'Entry',
    summary: expSummary = '',
    feedback: expFeedback = '',
    suggestions: expSuggestions = '',
  } = experienceAnalysis;

  return (
    <div className="space-y-6">
      {/* Projects Analysis Section */}
      <Card className="border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Projects Evaluation</h3>
              <p className="text-xs text-slate-500">
                Assessment of project relevance, technologies, and technical complexity
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {projectAnalysis.length} {projectAnalysis.length === 1 ? 'Project' : 'Projects'} Reviewed
          </span>
        </div>

        {projectAnalysis.length > 0 ? (
          <div className="space-y-4 pt-1">
            {projectAnalysis.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {proj.title || `Project #${idx + 1}`}
                    </span>
                  </div>
                  <span
                    className={`inline-flex self-start sm:self-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getRelevanceBadge(
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
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                {proj.feedback && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-semibold">Evaluation: </strong>
                    {proj.feedback}
                  </p>
                )}

                {/* Suggestions */}
                {proj.suggestions && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 text-xs text-teal-900 leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-teal-800">
                        How to strengthen:{' '}
                      </strong>
                      <span>{proj.suggestions}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">No detailed projects detected in this resume.</p>
            <p>
              Adding 2–3 full-stack or role-aligned projects with live URLs, technology tags, and measurable outcomes is the single highest-impact way to improve your score.
            </p>
          </div>
        )}
      </Card>

      {/* Experience Analysis Section */}
      <Card className="border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Work Experience & Internships
              </h3>
              <p className="text-xs text-slate-500">
                Assessment of career trajectory, team contributions, and practical experience
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            Level: {level}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {expSummary && (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {expSummary}
            </p>
          )}

          {expFeedback && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Experience Feedback:
              </strong>
              {expFeedback}
            </div>
          )}

          {expSuggestions && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 text-xs sm:text-sm text-orange-950 leading-relaxed">
              <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-orange-900">
                  Recommendation for Practical Experience:{' '}
                </strong>
                <span>{expSuggestions}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectExperienceCard;
