import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  Code2,
  Check,
  ChevronDown,
  Sparkles,
  Award,
  Loader2,
} from 'lucide-react';
import Card from '../common/Card';

const RoadmapProgressCard = ({
  roadmap,
  onToggleWeek,
  isUpdating = false,
  updatingWeeks = {},
}) => {
  if (!roadmap) return null;

  const {
    title,
    targetRole,
    companyName,
    summary,
    totalWeeks = 4,
    items = [],
    progressPercentage = 0,
    analysisProvider,
  } = roadmap;

  const completedCount = items.filter((it) => it.completed).length;

  return (
    <div className="space-y-6">
      {/* Overview & Progress Card */}
      <Card className="border border-brand-border bg-white shadow-soft p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/70 gap-3">
          <div>
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-muted">
              Step-by-Step Learning Guide
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-charcoal mt-0.5">
              {title}
            </h2>
            {companyName && (
              <p className="text-xs text-brand-primary font-heading font-semibold mt-0.5">
                Targeting: {targetRole} @ {companyName}
              </p>
            )}
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-3xl font-heading font-black text-brand-primary">
              {progressPercentage}%
            </span>
            <span className="block text-[11px] font-heading font-semibold text-brand-muted mt-0.5">
              {completedCount} of {totalWeeks} Weeks Done
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-heading font-semibold text-brand-charcoal">
            <span>Your Learning Progress</span>
            <span className="text-brand-primary">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-brand-bg rounded-full h-3 overflow-hidden border border-brand-border/60">
            <div
              className="h-full bg-brand-primary transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {summary && (
          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
            {summary}
          </p>
        )}
      </Card>

      {/* Week-by-Week Curriculum */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-brand-charcoal">
            Weekly Learning Plan ({items.length} Weeks)
          </h3>
          <span className="text-xs text-brand-muted">
            Check off each week as you finish the practice tasks
          </span>
        </div>

        {items.map((item) => {
          const isDone = Boolean(item.completed);
          const isWeekUpdating = Boolean(
            updatingWeeks[item.weekNumber] || (isUpdating && Object.keys(updatingWeeks).length === 0)
          );

          return (
            <Card
              key={item.weekNumber}
              data-testid={`week-card-${item.weekNumber}`}
              className={`border transition-all duration-200 ${
                isDone
                  ? 'border-brand-sageBorder/60 bg-brand-forestLight/30 shadow-soft-xs'
                  : 'border-brand-border bg-white hover:border-brand-borderDark shadow-soft'
              }`}
            >
              <div className="space-y-4">
                {/* Header row with controlled checkbox */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Accessible controlled checkbox */}
                    <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                      <input
                        id={`week-checkbox-${item.weekNumber}`}
                        data-testid={`week-checkbox-${item.weekNumber}`}
                        type="checkbox"
                        checked={isDone}
                        disabled={isWeekUpdating}
                        onChange={(e) => onToggleWeek(item.weekNumber, e.target.checked)}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor={`week-checkbox-${item.weekNumber}`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 select-none shadow-soft-xs ${
                          isDone
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'border-brand-border hover:border-brand-primary bg-white text-transparent'
                        } ${isWeekUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isWeekUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                        ) : (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </label>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label
                          htmlFor={`week-checkbox-${item.weekNumber}`}
                          className={`cursor-pointer text-sm sm:text-base font-heading font-bold transition-colors ${
                            isDone ? 'text-brand-muted line-through' : 'text-brand-charcoal hover:text-brand-primary'
                          }`}
                        >
                          {item.title}
                        </label>
                        <span className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full bg-brand-bg text-brand-charcoal border border-brand-border">
                          {item.priority} Priority
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-brand-muted mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-brand-muted" />
                          {item.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1 font-heading font-semibold text-brand-primary">
                          <Code2 className="w-3.5 h-3.5" />
                          Focus Skill: {item.skillToLearn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objective */}
                <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border text-xs sm:text-sm text-brand-slate leading-relaxed">
                  <strong className="text-brand-charcoal font-heading font-semibold">Weekly Goal: </strong>
                  {item.learningObjective}
                </div>

                {/* Detailed Sequence & Exercises */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Sequence */}
                  {item.learningSequence && item.learningSequence.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted">
                        What to Learn:
                      </span>
                      <ul className="space-y-1 text-xs text-brand-slate">
                        {item.learningSequence.map((seq, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">•</span>
                            <span>{seq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practical Exercises */}
                  {item.practicalExercises && item.practicalExercises.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-heading font-bold uppercase tracking-wider text-brand-muted">
                        Practice Tasks:
                      </span>
                      <ul className="space-y-1 text-xs text-brand-slate">
                        {item.practicalExercises.map((ex, eIdx) => (
                          <li key={eIdx} className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">✓</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Mini-Projects & Outcome */}
                <div className="pt-2 border-t border-brand-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-brand-slate">
                  {item.suggestedMiniProjects && item.suggestedMiniProjects.length > 0 && (
                    <div>
                      <strong className="text-brand-charcoal font-heading font-semibold">Mini Project to Build: </strong>
                      <span>{item.suggestedMiniProjects[0]}</span>
                    </div>
                  )}

                  {item.expectedOutcome && (
                    <div className="text-brand-primary font-heading font-medium">
                      <strong className="text-brand-charcoal font-semibold">What You Will Be Able to Do: </strong>
                      {item.expectedOutcome}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapProgressCard;
