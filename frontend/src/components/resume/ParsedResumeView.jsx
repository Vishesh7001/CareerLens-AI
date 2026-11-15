import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Code2,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Building,
  Calendar,
  Sparkles,
  FileText,
} from 'lucide-react';
import Card from '../common/Card';

const ParsedResumeView = ({ parsedData, rawText, className = '' }) => {
  const [showRawText, setShowRawText] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);

  if (!parsedData) {
    return (
      <Card className="p-8 text-center border-slate-200">
        <p className="text-sm text-slate-500">No parsed resume data available.</p>
      </Card>
    );
  }

  const {
    personalInfo = {},
    skills = {},
    experience = [],
    education = [],
    projects = [],
    certifications = [],
  } = parsedData;

  // Calculate total skills
  const totalSkills =
    (skills.programmingLanguages?.length || 0) +
    (skills.frameworks?.length || 0) +
    (skills.databases?.length || 0) +
    (skills.tools?.length || 0) +
    (skills.other?.length || 0);

  const handleCopyRawText = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2000);
  };

  // Helper to format web URLs safely
  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Personal Information Banner */}
      <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
              {personalInfo.fullName
                ? personalInfo.fullName.charAt(0).toUpperCase()
                : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {personalInfo.fullName || 'Candidate Profile'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <Sparkles className="w-3 h-3" />
                  Parsed Resume Intelligence
                </span>
                {totalSkills > 0 && (
                  <span className="text-xs text-slate-500">
                    • {totalSkills} skills detected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact details & links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-xs">
          {personalInfo.email && (
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
              <Mail className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <a
                href={`mailto:${personalInfo.email}`}
                className="truncate hover:text-brand-primary transition-colors"
                title={personalInfo.email}
              >
                {personalInfo.email}
              </a>
            </div>
          )}

          {personalInfo.phone && (
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
              <Phone className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span className="truncate">{personalInfo.phone}</span>
            </div>
          )}

          {personalInfo.location && (
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
              <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span className="truncate">{personalInfo.location}</span>
            </div>
          )}

          {personalInfo.linkedin && (
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
              <Linkedin className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <a
                href={formatUrl(personalInfo.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-sky-600 transition-colors flex items-center gap-1 font-medium"
                title={personalInfo.linkedin}
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {personalInfo.github && (
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
              <Github className="w-4 h-4 text-slate-800 flex-shrink-0" />
              <a
                href={formatUrl(personalInfo.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
                title={personalInfo.github}
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {personalInfo.portfolio && (
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
              <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <a
                href={formatUrl(personalInfo.portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-emerald-700 transition-colors flex items-center gap-1 font-medium"
                title={personalInfo.portfolio}
              >
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Categorized Skills Section */}
      <Card className="border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Extracted Skills</h3>
              <p className="text-xs text-slate-500">
                Rule-based classification across 5 specialized technical categories
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {totalSkills} Skills Identified
          </span>
        </div>

        {totalSkills === 0 ? (
          <p className="text-xs text-slate-400 py-4 italic">
            No specific skills detected in the uploaded resume.
          </p>
        ) : (
          <div className="space-y-4 pt-4">
            {/* Programming Languages */}
            {skills.programmingLanguages?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Programming Languages
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                    {skills.programmingLanguages.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.programmingLanguages.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Frameworks & Libraries */}
            {skills.frameworks?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Frameworks & Libraries
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                    {skills.frameworks.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.frameworks.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Databases */}
            {skills.databases?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Databases & Storage
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                    {skills.databases.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.databases.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools & DevOps */}
            {skills.tools?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tools, Cloud & DevOps
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    {skills.tools.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.tools.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Other / Concepts */}
            {skills.other?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Methodologies & Architecture
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {skills.other.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.other.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 3. Work Experience Section */}
      <Card className="border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Work Experience</h3>
              <p className="text-xs text-slate-500">
                Extracted employment history and professional roles
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {experience.length} {experience.length === 1 ? 'Role' : 'Roles'}
          </span>
        </div>

        {experience.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 italic">
            No work experience records identified in the parsed sections.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 pt-1">
            {experience.map((exp, idx) => (
              <div key={idx} className="py-4 space-y-2 first:pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {exp.position || 'Professional Role'}
                    </h4>
                    {exp.company && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{exp.company}</span>
                      </div>
                    )}
                  </div>
                  {exp.duration && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 self-start sm:self-auto">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{exp.duration}</span>
                    </div>
                  )}
                </div>

                {exp.description && (
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pl-1 border-l-2 border-slate-200">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Education & Certifications (2 Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education */}
        <Card className="border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Education</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {education.length}
            </span>
          </div>

          {education.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 italic">
              No education entries identified.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 pt-1">
              {education.map((edu, idx) => (
                <div key={idx} className="py-3.5 space-y-1.5 first:pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {edu.degree || 'Degree'}{edu.specialization ? ` in ${edu.specialization}` : ''}
                      </h4>
                      {edu.institution && (
                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                          {edu.institution}
                        </p>
                      )}
                    </div>
                    {edu.graduationYear && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {edu.graduationYear}
                      </span>
                    )}
                  </div>
                  {edu.grade && (
                    <span className="inline-block text-xs font-medium text-slate-500">
                      Score: <span className="font-semibold text-slate-700">{edu.grade}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Certifications */}
        <Card className="border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Certifications</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {certifications.length}
            </span>
          </div>

          {certifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 italic">
              No certifications detected in the parsed resume.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 pt-1">
              {certifications.map((cert, idx) => (
                <div key={idx} className="py-3.5 space-y-1 first:pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {cert.name || 'Certification'}
                    </h4>
                    {cert.date && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                        {cert.date}
                      </span>
                    )}
                  </div>
                  {cert.issuer && (
                    <p className="text-xs text-slate-500 font-medium">
                      Issued by <span className="text-slate-700">{cert.issuer}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 5. Projects Section */}
      <Card className="border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Key Projects</h3>
              <p className="text-xs text-slate-500">
                Technical implementations and portfolio highlights
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 italic">
            No projects detected in the parsed resume.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {proj.title || 'Technical Project'}
                    </h4>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 text-xs font-medium"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                {proj.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200/60">
                    {proj.technologies.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 6. Extracted Raw Text Inspector Accordion */}
      {rawText && (
        <Card className="border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">
                Inspect Extracted Raw Text
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                {rawText.length} characters
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>{showRawText ? 'Hide' : 'Show'}</span>
              {showRawText ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showRawText && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Extracted PDF stream before rule-based categorization
                </span>
                <button
                  type="button"
                  onClick={handleCopyRawText}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {copiedRawText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed select-text">
                {rawText}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ParsedResumeView;
