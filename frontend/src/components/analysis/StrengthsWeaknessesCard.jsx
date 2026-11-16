import React from 'react';
import { CheckCircle2, AlertTriangle, ThumbsUp, AlertCircle } from 'lucide-react';
import Card from '../common/Card';

const StrengthsWeaknessesCard = ({ strengths = [], weaknesses = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths Card */}
      <Card className="border border-emerald-100 bg-emerald-50/20 shadow-sm flex flex-col">
        <div className="flex items-center gap-2.5 pb-4 border-b border-emerald-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Key Strengths</h3>
            <p className="text-xs text-emerald-700 font-medium">
              Verified assets and strong qualifications detected in your resume
            </p>
          </div>
        </div>

        <div className="flex-1 pt-4">
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              No specific dominant strengths detected. Focus on building projects and technical certifications.
            </p>
          )}
        </div>
      </Card>

      {/* Weaknesses / Gaps Card */}
      <Card className="border border-amber-100 bg-amber-50/20 shadow-sm flex flex-col">
        <div className="flex items-center gap-2.5 pb-4 border-b border-amber-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Areas for Improvement</h3>
            <p className="text-xs text-amber-700 font-medium">
              Gaps and weak signals that may lower ATS ranking or recruiter interest
            </p>
          </div>
        </div>

        <div className="flex-1 pt-4">
          {weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {weaknesses.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 italic py-2">
              No major critical weaknesses detected for this profile.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StrengthsWeaknessesCard;
