import React from 'react';
import { CheckCircle2, AlertTriangle, ThumbsUp, AlertCircle } from 'lucide-react';
import Card from '../common/Card';

const StrengthsWeaknessesCard = ({ strengths = [], weaknesses = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths Card */}
      <Card className="border border-brand-border bg-white shadow-soft flex flex-col">
        <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border/70">
          <div className="w-8 h-8 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">Key Strengths</h3>
            <p className="text-xs text-brand-primary font-medium">
              Verified assets and strong qualifications detected in your resume
            </p>
          </div>
        </div>

        <div className="flex-1 pt-4">
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-slate">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {typeof item === 'object' && item !== null
                      ? item.text || item.strength || item.description || JSON.stringify(item)
                      : String(item || '')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-muted italic py-2">
              No specific dominant strengths detected. Focus on building projects and technical certifications.
            </p>
          )}
        </div>
      </Card>

      {/* Weaknesses / Gaps Card */}
      <Card className="border border-brand-border bg-white shadow-soft flex flex-col">
        <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border/70">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-brand-charcoal">Areas for Improvement</h3>
            <p className="text-xs text-amber-800 font-medium">
              Gaps and weak signals that may lower ATS ranking or recruiter interest
            </p>
          </div>
        </div>

        <div className="flex-1 pt-4">
          {weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {weaknesses.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-slate">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {typeof item === 'object' && item !== null
                      ? item.text || item.weakness || item.description || JSON.stringify(item)
                      : String(item || '')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-primary italic py-2">
              No major critical weaknesses detected for this profile.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StrengthsWeaknessesCard;
