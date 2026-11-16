import React from 'react';
import {
  CheckCircle2,
  Circle,
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
      <Card className="border border-sky-100 bg-gradient-to-br from-white to-sky-50/30 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Personalized Learning Plan
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {title}
            </h2>
            {companyName && (
              <p className="text-xs text-brand-primary font-medium mt-0.5">
                Targeting: {targetRole} @ {companyName}
              </p>
            )}
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-2xl font-extrabold text-brand-primary">
              {progressPercentage}%
            </span>
            <span className="block text-[11px] text-slate-400">
              {completedCount} of {totalWeeks} Weeks Done
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Overall Roadmap Completion</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-brand-primary transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {summary && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {summary}
          </p>
        )}
      </Card>

      {/* Week-by-Week Curriculum */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Weekly Execution Modules ({items.length})
          </h3>
          <span className="text-xs text-slate-400">
            Check off modules as you complete practical exercises
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
                  ? 'border-emerald-200 bg-emerald-50/15'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
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
                        className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 select-none ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 hover:border-brand-primary bg-white text-transparent'
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
                          className={`cursor-pointer text-sm sm:text-base font-bold transition-colors ${
                            isDone ? 'text-slate-800 line-through' : 'text-slate-900 hover:text-brand-primary'
                          }`}
                        >
                          {item.title}
                        </label>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.priority} Priority
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-brand-primary">
                          <Code2 className="w-3.5 h-3.5" />
                          Skill: {item.skillToLearn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objective */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700">
                  <strong className="text-slate-900 font-semibold">Objective: </strong>
                  {item.learningObjective}
                </div>

                {/* Detailed Sequence & Exercises */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Sequence */}
                  {item.learningSequence && item.learningSequence.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Step-by-Step Sequence:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
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
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Hands-on Exercises:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {item.practicalExercises.map((ex, eIdx) => (
                          <li key={eIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Mini-Projects & Outcome */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  {item.suggestedMiniProjects && item.suggestedMiniProjects.length > 0 && (
                    <div>
                      <strong className="text-slate-800">Mini-Project: </strong>
                      <span>{item.suggestedMiniProjects[0]}</span>
                    </div>
                  )}

                  {item.expectedOutcome && (
                    <div className="text-emerald-700 font-medium">
                      <strong className="text-slate-800">Outcome: </strong>
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
