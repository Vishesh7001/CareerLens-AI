import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  ExternalLink,
  Code2,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  FileText,
  Calendar,
  Building,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import Card from '../common/Card';

const ParsedResumeView = ({ parsedData, rawText, className = '' }) => {
  const [showRawText, setShowRawText] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);

  if (!parsedData) {
    return (
      <Card className="p-8 text-center border-brand-border">
        <p className="text-sm text-brand-muted">No parsed resume data available.</p>
      </Card>
    );
  }

  const {
    personalInfo = {},
    skills = {},
    experience = [],
    education = [],
    certifications = [],
    activities = [],
  } = parsedData;

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

  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // Helper to detect parser testing notices, disclaimers, and internal metadata
  const isNoticeOrMetadata = (text) => {
    if (!text || typeof text !== 'string') return false;
    return /test data notice|fictional sample|placeholders|do not use as a real|parser testing|all names,\s*contact details/i.test(
      text
    );
  };

  // 1. Normalize Work Experience
  const normalizedExperience = (() => {
    const raw = experience || [];
    const list = [];

    for (const exp of raw) {
      if (!exp) continue;
      const rawTitle = (exp.position || exp.role || exp.title || exp.jobTitle || '').trim();
      const company = (exp.company || '').trim();
      const duration = (exp.duration || '').trim();
      const description = (exp.description || '').trim();

      // Check if entry is a fragment of previous experience
      const isFragment =
        !company &&
        !duration &&
        (!rawTitle || rawTitle.toLowerCase() === 'role' || rawTitle.toLowerCase() === 'developer');

      if (isFragment && list.length > 0) {
        if (description && !isNoticeOrMetadata(description)) {
          const prev = list[list.length - 1];
          prev.description = prev.description ? `${prev.description} ${description}` : description;
        }
        continue;
      }

      if (!company && !rawTitle && !description) continue;
      if (
        isNoticeOrMetadata(rawTitle) ||
        isNoticeOrMetadata(company) ||
        isNoticeOrMetadata(description)
      ) {
        continue;
      }

      // Avoid generic placeholder titles like "Role"
      let title = rawTitle;
      if (!title || title.toLowerCase() === 'role') {
        title = company ? `${company} Professional Experience` : '';
      }

      list.push({
        title,
        company,
        duration,
        description,
      });
    }

    return list;
  })();

  // 2. Normalize Education Entries (grouping degree, institution, year, and grades)
  const normalizedEducation = (() => {
    const raw = education || [];
    const list = [];

    for (let i = 0; i < raw.length; i++) {
      const item = raw[i];
      if (!item) continue;

      const rawDegree = (item.degree || '').trim();
      const rawInst = (item.institution || '').trim();
      const rawYear = (item.graduationYear || '').trim();
      const rawGrade = (item.grade || item.gpa || '').trim();
      const rawSpec = (item.specialization || '').trim();

      // Skip internal parser artifact where 'semester' matched 'me'
      if (rawDegree.toLowerCase() === 'me') {
        if (rawGrade && list.length > 0 && !list[list.length - 1].grade) {
          list[list.length - 1].grade = rawGrade;
        }
        continue;
      }

      // If degree is empty but institution is present, check if this line is continuation of previous entry
      if (!rawDegree && rawInst && list.length > 0 && !list[list.length - 1].institution) {
        const prev = list[list.length - 1];
        prev.institution = rawInst;
        if (rawYear && !prev.graduationYear) prev.graduationYear = rawYear;
        if (rawGrade && !prev.grade) prev.grade = rawGrade;
        continue;
      }

      if (!rawDegree && !rawInst) continue;
      if (isNoticeOrMetadata(rawDegree) || isNoticeOrMetadata(rawInst)) continue;

      let displayDegree = rawDegree;
      if (
        rawSpec &&
        displayDegree &&
        !displayDegree.toLowerCase().includes(rawSpec.toLowerCase())
      ) {
        displayDegree = `${displayDegree} – ${rawSpec}`;
      }

      list.push({
        degree: displayDegree,
        institution: rawInst,
        graduationYear: rawYear,
        grade: rawGrade,
      });
    }

    return list;
  })();

  // 3. Normalize Certifications & Activities
  const { normalizedCertifications, normalizedActivities } = (() => {
    const certs = [];
    const actList = [...(activities || [])];

    for (const cert of certifications || []) {
      const name = (typeof cert === 'string' ? cert : cert?.name || '').trim();
      const issuer = (cert?.issuer || '').trim();
      const date = (cert?.date || '').trim();
      const combined = `${name} ${issuer}`.trim();

      if (!name || isNoticeOrMetadata(combined)) continue;
      if (name.toUpperCase() === 'ACTIVITIES') continue;

      // Classify as activity if extracurricular, volunteering, hackathon, or club
      const isActivity = /participat|volunteer|hackathon|club|society|coordinat|organized|student community/i.test(
        combined
      );

      if (isActivity) {
        actList.push(issuer && !name.includes(issuer) ? `${name} – ${issuer}` : name);
      } else {
        certs.push({
          name,
          issuer: issuer || null,
          date: date || null,
        });
      }
    }

    // Clean and filter activities
    const cleanActivities = actList
      .map((a) => (typeof a === 'string' ? a.trim() : (a?.name || a?.title || '').trim()))
      .filter((a) => a && !isNoticeOrMetadata(a) && a.toUpperCase() !== 'ACTIVITIES');

    return {
      normalizedCertifications: certs,
      normalizedActivities: cleanActivities,
    };
  })();

  // Sanitize contact details to decouple any phone prepended to email and provide consistent fallback for location
  const contactInfo = (() => {
    let email = personalInfo.email ? String(personalInfo.email).trim() : null;
    let phone = personalInfo.phone ? String(personalInfo.phone).trim() : null;

    if (email) {
      const concatMatch =
        email.match(/^(?:\+?91[\s.-]?|0)?([6-9]\d{9})[\s|/:-]*([a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) ||
        email.match(/^(?:\+?1[\s.-]?)?([2-9]\d{2}[2-9]\d{6})[\s|/:-]*([a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) ||
        email.match(/^(?:\+?\d{1,4}[\s.-]?)?(\d{10,12})[\s|/:-]*([a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
      if (concatMatch) {
        if (!phone) {
          phone = concatMatch[1];
        }
        email = concatMatch[2];
      }
    }

    const rawLoc = personalInfo.location ? String(personalInfo.location).trim() : '';
    const location = rawLoc && rawLoc.toLowerCase() !== 'location not provided'
      ? rawLoc
      : 'Location not provided';

    return { email, phone, location };
  })();

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Personal Information Banner */}
      <Card className="border-brand-border bg-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-forestLight text-brand-primary flex items-center justify-center font-heading font-bold text-lg flex-shrink-0 shadow-soft-xs">
              {personalInfo.fullName ? (
                personalInfo.fullName.charAt(0).toUpperCase()
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-brand-charcoal tracking-tight">
                {personalInfo.fullName || 'Candidate Profile'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-heading font-semibold px-2.5 py-0.5 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60">
                  <Sparkles className="w-3 h-3" />
                  Parsed Resume Intelligence
                </span>
                {totalSkills > 0 && (
                  <span className="text-xs text-brand-muted">• {totalSkills} skills detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Chips */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {contactInfo.email && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg border border-brand-border/70 truncate">
              <Mail className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span className="truncate text-brand-charcoal font-medium">{contactInfo.email}</span>
            </div>
          )}
          {contactInfo.phone && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg border border-brand-border/70 truncate">
              <Phone className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span className="truncate text-brand-charcoal font-medium">{contactInfo.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg border border-brand-border/70 truncate">
            <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span
              className={`truncate font-medium ${
                contactInfo.location !== 'Location not provided'
                  ? 'text-brand-charcoal'
                  : 'text-brand-muted'
              }`}
            >
              {contactInfo.location}
            </span>
          </div>
          {personalInfo.links?.linkedin && (
            <a
              href={formatUrl(personalInfo.links.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg border border-brand-border/70 hover:border-brand-primary/50 text-brand-charcoal transition-colors truncate"
            >
              <Linkedin className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span className="truncate font-medium">LinkedIn Profile</span>
              <ExternalLink className="w-3 h-3 text-brand-muted ml-auto" />
            </a>
          )}
          {personalInfo.links?.github && (
            <a
              href={formatUrl(personalInfo.links.github)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg border border-brand-border/70 hover:border-brand-primary/50 text-brand-charcoal transition-colors truncate"
            >
              <Github className="w-4 h-4 text-brand-charcoal flex-shrink-0" />
              <span className="truncate font-medium">GitHub Profile</span>
              <ExternalLink className="w-3 h-3 text-brand-muted ml-auto" />
            </a>
          )}
        </div>
      </Card>

      {/* 2. Categorized Technical Skills */}
      <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-brand-border/70">
          <Code2 className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            Categorized Technical Skills ({totalSkills})
          </h3>
        </div>

        <div className="space-y-3.5">
          {skills.programmingLanguages?.length > 0 && (
            <div>
              <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                Programming Languages
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.programmingLanguages.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl text-xs font-heading font-semibold bg-brand-forestLight text-brand-primary border border-brand-sageBorder/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skills.frameworks?.length > 0 && (
            <div>
              <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                Frameworks & Libraries
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.frameworks.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl text-xs font-heading font-semibold bg-brand-bg text-brand-charcoal border border-brand-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skills.databases?.length > 0 && (
            <div>
              <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                Databases & Storage
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.databases.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl text-xs font-heading font-semibold bg-brand-bg text-brand-charcoal border border-brand-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skills.tools?.length > 0 && (
            <div>
              <span className="text-[11px] font-heading font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                Developer Tools & Cloud
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.tools.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl text-xs font-heading font-semibold bg-brand-bg text-brand-charcoal border border-brand-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Clean Two-Column Layout on Desktop: Work Experience (Left) & Education / Certifications / Activities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column: Work Experience */}
        <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-primary" />
              <h3 className="text-base font-heading font-bold text-brand-charcoal">
                Work Experience
              </h3>
            </div>
            {normalizedExperience.length > 0 && (
              <span className="text-xs font-heading font-semibold text-brand-primary bg-brand-forestLight px-2 py-0.5 rounded-full border border-brand-sageBorder/60">
                {normalizedExperience.length}{' '}
                {normalizedExperience.length === 1 ? 'Role' : 'Roles'}
              </span>
            )}
          </div>

          {normalizedExperience.length > 0 ? (
            <div className="space-y-3.5">
              {normalizedExperience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-brand-bg border border-brand-border/70 space-y-2 hover:border-brand-borderDark transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                    <div>
                      {exp.title && (
                        <h4 className="text-sm font-heading font-bold text-brand-charcoal">
                          {exp.title}
                        </h4>
                      )}
                      {exp.company && (
                        <p className="text-xs font-heading font-semibold text-brand-primary mt-0.5">
                          {exp.company}
                        </p>
                      )}
                    </div>

                    {exp.duration && (
                      <span className="text-[11px] text-brand-muted font-medium flex items-center gap-1 self-start sm:self-auto flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-brand-primary/70" />
                        {exp.duration}
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-xs text-brand-slate leading-relaxed font-sans pt-1 border-t border-brand-border/50">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-1">
              <p className="text-xs font-heading font-semibold text-brand-charcoal">
                No Formal Work Experience Listed
              </p>
              <p className="text-[11px] text-brand-muted">
                Academic projects and course accomplishments will be prioritized in your analysis.
              </p>
            </div>
          )}
        </Card>

        {/* Right Column: Education, Certifications, and Activities */}
        <div className="space-y-5">
          {/* Education */}
          <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-heading font-bold text-brand-charcoal">Education</h3>
              </div>
              {normalizedEducation.length > 0 && (
                <span className="text-xs font-heading font-semibold text-brand-primary bg-brand-forestLight px-2 py-0.5 rounded-full border border-brand-sageBorder/60">
                  {normalizedEducation.length}{' '}
                  {normalizedEducation.length === 1 ? 'Record' : 'Records'}
                </span>
              )}
            </div>

            {normalizedEducation.length > 0 ? (
              <div className="space-y-3">
                {normalizedEducation.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-brand-bg border border-brand-border/70 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {edu.degree && (
                          <h4 className="text-sm font-heading font-bold text-brand-charcoal">
                            {edu.degree}
                          </h4>
                        )}
                        {edu.institution && (
                          <p className="text-xs font-heading font-semibold text-brand-primary mt-0.5">
                            {edu.institution}
                          </p>
                        )}
                      </div>

                      {edu.graduationYear && (
                        <span className="text-[11px] text-brand-muted font-medium flex-shrink-0">
                          {edu.graduationYear}
                        </span>
                      )}
                    </div>

                    {edu.grade && (
                      <div className="text-[11px] text-brand-muted pt-0.5">
                        <span className="font-medium text-brand-charcoal">Grade / CGPA:</span>{' '}
                        <span className="font-bold text-brand-primary">{edu.grade}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-muted py-4 text-center">
                No formal education details parsed.
              </p>
            )}
          </Card>

          {/* Certifications */}
          {normalizedCertifications.length > 0 && (
            <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-base font-heading font-bold text-brand-charcoal">
                    Certifications
                  </h3>
                </div>
                <span className="text-xs font-heading font-semibold text-brand-primary bg-brand-forestLight px-2 py-0.5 rounded-full border border-brand-sageBorder/60">
                  {normalizedCertifications.length}
                </span>
              </div>

              <div className="space-y-2">
                {normalizedCertifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-brand-bg border border-brand-border/70 flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-heading font-bold text-brand-charcoal">
                        {cert.name}
                      </h4>
                      {cert.issuer && (
                        <p className="text-[11px] text-brand-muted mt-0.5">{cert.issuer}</p>
                      )}
                    </div>
                    {cert.date && (
                      <span className="text-[10px] font-heading font-semibold text-brand-muted flex-shrink-0 bg-white px-2 py-0.5 rounded-md border border-brand-border">
                        {cert.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activities (only when genuine activity data is available) */}
          {normalizedActivities.length > 0 && (
            <Card className="border-brand-border bg-white p-5 sm:p-6 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/70">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-base font-heading font-bold text-brand-charcoal">
                    Extracurricular & Activities
                  </h3>
                </div>
                <span className="text-xs font-heading font-semibold text-brand-primary bg-brand-forestLight px-2 py-0.5 rounded-full border border-brand-sageBorder/60">
                  {normalizedActivities.length}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-brand-slate leading-relaxed">
                {normalizedActivities.map((activity, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-brand-bg border border-brand-border/70 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0 mt-1.5" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Raw Text Accordion */}
      {rawText && (
        <Card className="border-brand-border bg-white p-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center gap-2 text-xs font-heading font-bold text-brand-charcoal hover:text-brand-primary transition-colors"
            >
              <FileText className="w-4 h-4 text-brand-primary" />
              <span>{showRawText ? 'Hide Extracted Raw Text' : 'View Extracted Raw Text'}</span>
              {showRawText ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showRawText && (
              <button
                type="button"
                onClick={handleCopyRawText}
                className="flex items-center gap-1 text-xs text-brand-primary hover:underline font-heading font-semibold"
              >
                {copiedRawText ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw Text</span>
                  </>
                )}
              </button>
            )}
          </div>

          {showRawText && (
            <div className="mt-3 p-4 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-slate font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
              {rawText}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ParsedResumeView;
