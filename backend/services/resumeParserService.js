/**
 * Resume Parser Service (Phase 2 - Rule-Based Extractor)
 *
 * Extracts and categorizes structured candidate data from raw PDF text:
 * - Personal Information
 * - Education
 * - Categorized Skills
 * - Work Experience
 * - Projects
 * - Certifications
 *
 * Designed with modular section parsing so AI/LLM models can augment
 * or replace individual extraction steps in future phases.
 */

// Skill Dictionary with comprehensive technical categories
const SKILL_PATTERNS = {
  programmingLanguages: [
    { name: 'JavaScript', regex: /\bjavascript\b/i },
    { name: 'TypeScript', regex: /\btypescript\b/i },
    { name: 'Python', regex: /\bpython\b/i },
    { name: 'Java', regex: /\bjava\b(?!script)/i },
    { name: 'C++', regex: /\bc\+\+\b/i },
    { name: 'C#', regex: /\bc#\b/i },
    { name: 'C', regex: /\b(?<!\w)c(?!\w|[+#])/ },
    { name: 'Go', regex: /\b(golang|go)\b/i },
    { name: 'Rust', regex: /\brust\b/i },
    { name: 'Ruby', regex: /\bruby\b/i },
    { name: 'PHP', regex: /\bphp\b/i },
    { name: 'Swift', regex: /\bswift\b/i },
    { name: 'Kotlin', regex: /\bkotlin\b/i },
    { name: 'SQL', regex: /\bsql\b/i },
    { name: 'HTML5', regex: /\bhtml5?\b/i },
    { name: 'CSS3', regex: /\bcss3?\b/i },
    { name: 'R', regex: /\b(?<!\w)r(?!\w)/ },
    { name: 'Scala', regex: /\bscala\b/i },
    { name: 'Dart', regex: /\bdart\b/i },
    { name: 'Shell / Bash', regex: /\b(bash|shell|zsh|powershell)\b/i },
  ],
  frameworks: [
    { name: 'React', regex: /\breact(?:\.js)?\b/i },
    { name: 'React Native', regex: /\breact native\b/i },
    { name: 'Node.js', regex: /\bnode(?:\.js)?\b/i },
    { name: 'Express.js', regex: /\bexpress(?:\.js)?\b/i },
    { name: 'Next.js', regex: /\bnext(?:\.js)?\b/i },
    { name: 'Vue.js', regex: /\bvue(?:\.js)?\b/i },
    { name: 'Angular', regex: /\bangular(?:\.js)?\b/i },
    { name: 'FastAPI', regex: /\bfastapi\b/i },
    { name: 'Django', regex: /\bdjango\b/i },
    { name: 'Flask', regex: /\bflask\b/i },
    { name: 'Spring Boot', regex: /\bspring boot\b/i },
    { name: 'Spring', regex: /\bspring\b(?! boot)/i },
    { name: 'Tailwind CSS', regex: /\btailwind(?:\s*css)?\b/i },
    { name: 'Bootstrap', regex: /\bbootstrap\b/i },
    { name: 'Redux', regex: /\bredux\b/i },
    { name: 'GraphQL', regex: /\bgraphql\b/i },
    { name: 'RESTful APIs', regex: /\b(rest(?:ful)?(?:\s+api(?:s)?)?)\b/i },
    { name: 'ASP.NET', regex: /\basp\.net\b/i },
    { name: 'Laravel', regex: /\blaravel\b/i },
  ],
  databases: [
    { name: 'MongoDB', regex: /\bmongodb\b/i },
    { name: 'PostgreSQL', regex: /\b(postgresql|postgres)\b/i },
    { name: 'MySQL', regex: /\bmysql\b/i },
    { name: 'Redis', regex: /\bredis\b/i },
    { name: 'SQLite', regex: /\bsqlite\b/i },
    { name: 'Oracle DB', regex: /\boracle(?:\s+database|\s+db)?\b/i },
    { name: 'Cassandra', regex: /\bcassandra\b/i },
    { name: 'DynamoDB', regex: /\bdynamodb\b/i },
    { name: 'Firebase', regex: /\bfirebase\b/i },
    { name: 'Firestore', regex: /\bfirestore\b/i },
    { name: 'Elasticsearch', regex: /\belasticsearch\b/i },
    { name: 'MariaDB', regex: /\bmariadb\b/i },
    { name: 'Supabase', regex: /\bsupabase\b/i },
  ],
  tools: [
    { name: 'Git', regex: /\bgit\b(?!hub|lab)/i },
    { name: 'GitHub', regex: /\bgithub\b/i },
    { name: 'GitLab', regex: /\bgitlab\b/i },
    { name: 'Docker', regex: /\bdocker\b/i },
    { name: 'Kubernetes', regex: /\b(kubernetes|k8s)\b/i },
    { name: 'AWS', regex: /\b(aws|amazon web services)\b/i },
    { name: 'Azure', regex: /\b(microsoft azure|azure)\b/i },
    { name: 'Google Cloud Platform (GCP)', regex: /\b(gcp|google cloud(?: platform)?)\b/i },
    { name: 'Linux', regex: /\blinux\b/i },
    { name: 'Postman', regex: /\bpostman\b/i },
    { name: 'Vite', regex: /\bvite\b/i },
    { name: 'Webpack', regex: /\bwebpack\b/i },
    { name: 'Jest', regex: /\bjest\b/i },
    { name: 'Mocha', regex: /\bmocha\b/i },
    { name: 'Cypress', regex: /\bcypress\b/i },
    { name: 'CI/CD', regex: /\bci[\/-]cd\b/i },
    { name: 'Jenkins', regex: /\bjenkins\b/i },
    { name: 'Nginx', regex: /\bnginx\b/i },
    { name: 'Terraform', regex: /\bterraform\b/i },
    { name: 'Jira', regex: /\bjira\b/i },
    { name: 'Figma', regex: /\bfigma\b/i },
  ],
  other: [
    { name: 'Microservices', regex: /\bmicroservices\b/i },
    { name: 'Agile / Scrum', regex: /\b(agile|scrum)\b/i },
    { name: 'Machine Learning', regex: /\bmachine learning\b/i },
    { name: 'Deep Learning', regex: /\bdeep learning\b/i },
    { name: 'Computer Vision', regex: /\bcomputer vision\b/i },
    { name: 'NLP', regex: /\b(nlp|natural language processing)\b/i },
    { name: 'Data Structures & Algorithms', regex: /\b(data structures|algorithms)\b/i },
    { name: 'System Design', regex: /\bsystem design\b/i },
    { name: 'DevOps', regex: /\bdevops\b/i },
    { name: 'Cybersecurity', regex: /\b(cybersecurity|information security)\b/i },
    { name: 'Object-Oriented Programming (OOP)', regex: /\b(object-oriented|oop)\b/i },
  ],
};

const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR'
]);

const COUNTRY_AND_REGIONS = [
  'India', 'United States', 'USA', 'UK', 'United Kingdom', 'Canada',
  'Germany', 'Australia', 'Singapore', 'France', 'Japan', 'Netherlands',
  'United Arab Emirates', 'UAE',
  // Indian States & Union Territories
  'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Delhi',
  'Uttar Pradesh', 'Haryana', 'West Bengal', 'Gujarat', 'Rajasthan',
  'Kerala', 'Punjab', 'Madhya Pradesh', 'Andhra Pradesh', 'Bihar',
  'Odisha', 'Assam', 'Goa', 'Uttarakhand', 'Jharkhand'
];

const LOCATION_BLACKLIST_WORDS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'html', 'css',
  'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'oracle',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'git', 'linux', 'unix',
  'proficient', 'experience', 'experienced', 'skills', 'skill', 'developer', 'engineer', 'architect',
  'university', 'college', 'school', 'institute', 'bachelor', 'master', 'phd', 'degree', 'b.tech', 'm.tech', 'bca', 'mca',
  'technologies', 'frameworks', 'tools', 'languages', 'full stack', 'frontend', 'backend', 'devops',
  'machine learning', 'deep learning', 'data science', 'artificial intelligence', 'ai', 'ml',
  'summary', 'curriculum', 'vitae', 'resume', 'projects', 'education', 'certifications', 'intern', 'internship'
];

const isDisallowedLocation = (str) => {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return true;
  const lower = trimmed.toLowerCase();
  for (const word of LOCATION_BLACKLIST_WORDS) {
    const regex = new RegExp(`\\b${word.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(lower)) return true;
  }
  // Exclude years or long number strings
  if (/\b(?:19|20)\d{2}\b/.test(trimmed)) return true;
  if (/\d{7,}/.test(trimmed)) return true;
  return false;
};

/**
 * Extract candidate location using high-confidence heuristics
 * Avoids false positives from skills, technical descriptions, or institution names
 */
const extractLocation = (rawText, lines = []) => {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Explicit labeled location (e.g. "Location: Bengaluru, India", "Address: Los Angeles, CA")
  const labelRegex = /(?:Location|Address|Based in|Current Location)[:\s-]*([^\r\n|•\t]+)/i;
  const labelMatch = rawText.match(labelRegex);
  if (labelMatch) {
    const candidate = labelMatch[1].trim().replace(/^[:\s-]+|[,.\s-]+$/g, '');
    if (!isDisallowedLocation(candidate)) {
      return candidate;
    }
  }

  // 2. Unlabeled location in header lines (top 10 lines)
  const headerLines = (lines || []).slice(0, 10);
  const countryPattern = COUNTRY_AND_REGIONS.join('|');
  const regionRegex = new RegExp(`\\b([A-Z][a-zA-Z\\s.'-]+,\\s*(?:${countryPattern}))\\b`, 'i');
  const usStateRegex = /\b([A-Z][a-zA-Z\s.'-]+),\s*([A-Z]{2})(?:\s+(\d{5}(?:-\d{4})?))?\b/;

  for (const line of headerLines) {
    if (/^(?:SKILLS|EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|SUMMARY)[:\s]/i.test(line)) {
      continue;
    }

    const segments = line.split(/[|•;\t]/).map((s) => s.trim()).filter(Boolean);

    for (const segment of segments) {
      if (isDisallowedLocation(segment)) continue;

      // Check US City, State Code
      const usMatch = segment.match(usStateRegex);
      if (usMatch) {
        const stateCode = usMatch[2].toUpperCase();
        if (US_STATE_CODES.has(stateCode)) {
          const loc = usMatch[3]
            ? `${usMatch[1].trim()}, ${stateCode} ${usMatch[3]}`
            : `${usMatch[1].trim()}, ${stateCode}`;
          if (!isDisallowedLocation(loc)) {
            return loc;
          }
        }
      }

      // Check City, Country / State
      const regMatch = segment.match(regionRegex);
      if (regMatch) {
        const loc = regMatch[1].trim();
        if (!isDisallowedLocation(loc)) {
          return loc;
        }
      }

      // Check standalone Remote
      if (/^Remote(?:\s*\(.*?\))?$/i.test(segment) || /\bRemote\b/i.test(segment)) {
        if (!isDisallowedLocation(segment)) {
          return 'Remote';
        }
      }
    }
  }

  return null;
};

/**
 * Extract phone number supporting international, Indian (+91, spaces, hyphens, 10-digit mobile)
 * and North American formats while avoiding false positives like years, CGPA, and postal codes.
 *
 * @param {string} rawText
 * @returns {string|null}
 */
const extractPhoneNumber = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Look for explicit phone/mobile/contact labeled patterns first (highest confidence)
  // e.g. "Phone: +91 98765 43210", "Mobile: 9876543210", "Tel: +1-555-432-1098"
  const labelRegex = /(?:phone|mobile|tel|cell|contact)[:\s]*([+]?[\d\s().-]{7,25}\d)/i;
  const labelMatch = rawText.match(labelRegex);
  if (labelMatch) {
    const candidate = labelMatch[1].trim();
    const digits = candidate.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return candidate;
    }
  }

  // 2. Specific Indian phone number formats:
  // e.g. +91 98765 43210, +91-98765-43210, +91 9876543210, +919876543210, 98765 43210, 98765-43210, 9876543210, 09876543210
  const indianRegex = /(?:\+91[\s.-]?|0)?[6-9]\d{4}[\s.-]?\d{5}\b|(?:\+91[\s.-]?)?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/;
  const indianMatch = rawText.match(indianRegex);
  if (indianMatch) {
    const candidate = indianMatch[0].trim();
    const digits = candidate.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 12) {
      return candidate;
    }
  }

  // 3. International & North American formats with country code or area code:
  // e.g. +1 555 432 1098, (555) 432-1098, +1 (555) 432-1098, 555-432-1098, +44 20 7946 0958
  const intlRegex = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]\d{3,4}[\s.-]\d{4}\b/;
  const intlMatch = rawText.match(intlRegex);
  if (intlMatch) {
    const candidate = intlMatch[0].trim();
    const digits = candidate.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return candidate;
    }
  }

  // 4. Phone number immediately followed by email without whitespace delimiter (e.g. 7001101737vishesh... or +917001101737vishesh...)
  const emailPrefixMatch = rawText.match(
    /(?:(?:\+?91[\s.-]?|0)?[6-9]\d{9}|(?:\+?1[\s.-]?)?[2-9]\d{2}[2-9]\d{6}|\b\d{10,12})(?=[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  );
  if (emailPrefixMatch) {
    const candidate = emailPrefixMatch[0].trim();
    const digits = candidate.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return candidate;
    }
  }

  return null;
};

/**
 * Extract Personal Information: Name, Email, Phone, Location, Links
 */
const extractPersonalInfo = (rawText, lines) => {
  const personalInfo = {
    fullName: null,
    email: null,
    phone: null,
    location: null,
    linkedin: null,
    github: null,
    portfolio: null,
  };

  // 1. Email extraction & Phone separation
  let phoneFromEmail = null;
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    let candidateEmail = emailMatch[0].trim();

    // Check if phone number is glued/prepended to the email address
    const indianConcatMatch = candidateEmail.match(
      /^(?:\+?91[\s.-]?|0)?([6-9]\d{9})[\s|/:-]*([a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
    );
    if (indianConcatMatch) {
      phoneFromEmail = indianConcatMatch[1];
      candidateEmail = indianConcatMatch[2];
    } else {
      const naConcatMatch = candidateEmail.match(
        /^(?:\+?1[\s.-]?)?([2-9]\d{2}[2-9]\d{6})[\s|/:-]*([a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
      );
      if (naConcatMatch) {
        phoneFromEmail = naConcatMatch[1];
        candidateEmail = naConcatMatch[2];
      } else {
        const genConcatMatch = candidateEmail.match(
          /^(?:\+?\d{1,4}[\s.-]?)?(\d{10,12})[\s|/:-]*([a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
        );
        if (genConcatMatch) {
          phoneFromEmail = genConcatMatch[1];
          candidateEmail = genConcatMatch[2];
        }
      }
    }

    personalInfo.email = candidateEmail.replace(/^[^a-zA-Z0-9]+/, '');
  }

  // 2. Phone extraction (Indian & International formats with full digit preservation)
  personalInfo.phone = extractPhoneNumber(rawText);
  if (!personalInfo.phone && phoneFromEmail) {
    personalInfo.phone = phoneFromEmail;
  }

  // 3. LinkedIn URL
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) {
    let url = linkedinMatch[0].trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    personalInfo.linkedin = url;
  }

  // 4. GitHub URL
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  if (githubMatch) {
    let url = githubMatch[0].trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    personalInfo.github = url;
  }

  // 5. Portfolio / Personal Website (excluding linkedin & github domains)
  const portfolioMatch = rawText.match(
    /https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s,)]*/i
  );
  if (portfolioMatch) {
    personalInfo.portfolio = portfolioMatch[0].trim();
  }

  // 6. Location (City, State/Country heuristics - never skills or tech stack)
  personalInfo.location = extractLocation(rawText, lines);

  // 7. Full Name heuristic: first 5 non-empty lines, looking for capitalized 2-4 word name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const candidateNames = [line];
    if (line.includes('|')) {
      candidateNames.push(line.split('|')[0].trim());
    }
    for (const cand of candidateNames) {
      if (
        !cand.includes('@') &&
        !cand.includes('http') &&
        !cand.includes('www.') &&
        !cand.match(/\d{3}/) &&
        !cand.toUpperCase().includes('RESUME') &&
        !cand.toUpperCase().includes('CURRICULUM') &&
        !cand.toUpperCase().includes('PROFILE') &&
        /^[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,3}$/.test(cand)
      ) {
        personalInfo.fullName = cand.trim();
        break;
      }
    }
    if (personalInfo.fullName) break;
  }

  return personalInfo;
};

/**
 * Extract Categorized Skills from Resume Text
 */
const extractSkills = (rawText) => {
  const skills = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
    other: [],
  };

  for (const [category, patternList] of Object.entries(SKILL_PATTERNS)) {
    const matched = new Set();
    for (const item of patternList) {
      if (item.regex.test(rawText)) {
        matched.add(item.name);
      }
    }
    skills[category] = Array.from(matched);
  }

  return skills;
};

/**
 * Locate and isolate text corresponding to standard resume sections
 */
const segmentSections = (rawText) => {
  const sectionPatterns = {
    education: /(?:^|\n)\s*(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC QUALIFICATIONS)[:\s]*/i,
    experience: /(?:^|\n)\s*(?:WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY)[:\s]*/i,
    projects: /(?:^|\n)\s*(?:PROJECTS|PERSONAL PROJECTS|KEY PROJECTS|ACADEMIC PROJECTS)[:\s]*/i,
    certifications: /(?:^|\n)\s*(?:CERTIFICATIONS|CERTIFICATES|LICENSES & CERTIFICATIONS)[:\s]*/i,
    activities: /(?:^|\n)\s*(?:ACTIVITIES|EXTRACURRICULAR(?: ACTIVITIES)?|CO-CURRICULAR(?: ACTIVITIES)?|VOLUNTEERING|LEADERSHIP & ACTIVITIES)[:\s]*/i,
    skills: /(?:^|\n)\s*(?:TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES)[:\s]*/i,
    notice: /(?:^|\n)\s*(?:TEST DATA NOTICE|NOTICE|DISCLAIMER)[:\s]*/i,
  };

  const headers = [];
  for (const [secKey, regex] of Object.entries(sectionPatterns)) {
    const match = regex.exec(rawText);
    if (match) {
      headers.push({
        section: secKey,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  headers.sort((a, b) => a.start - b.start);

  const sections = {};
  for (let i = 0; i < headers.length; i++) {
    const current = headers[i];
    const nextStart = i + 1 < headers.length ? headers[i + 1].start : rawText.length;
    sections[current.section] = rawText.slice(current.end, nextStart).trim();
  }

  return sections;
};

/**
 * Parse Education section
 */
const parseEducation = (eduText) => {
  if (!eduText) return [];

  const lines = eduText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const degreeRegex = /\b(?:B\.?Tech|B\.?E\.?|B\.?S\.?c?|M\.?Tech|M\.?S\.?c?|M\.?E\.?|MBA|Ph\.?D\.?|Bachelor(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|Master(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|Associate(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|Diploma|Class\s+(?:X|XII|10th|12th)(?:\s*[-–]\s*[A-Za-z]+)?)\b/i;
  const instRegex = /(?:University|College|Institute|School|Academy|Polytechnic)/i;

  const results = [];
  let current = null;

  for (const line of lines) {
    if (/test data notice|fictional sample|placeholders/i.test(line)) continue;
    const hasInst = instRegex.test(line);
    const hasDegree = degreeRegex.test(line);

    // If current education entry is missing institution and this next line provides it without a new degree, merge
    if (current && !current.institution && hasInst && !hasDegree) {
      const parts = line.split(/[-–|;,]/).map((p) => p.trim());
      const instPart = parts.find((p) => instRegex.test(p));
      if (instPart) current.institution = instPart;
      const ym = line.match(/\b(19\d{2}|20\d{2})\b/);
      if (ym && !current.graduationYear) current.graduationYear = ym[1];
      const gm = line.match(/(?:GPA|CGPA|Grade)?:?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*(?:10|4))?|\b\d{2}(?:\.\d+)?%)/i);
      if (gm && !current.grade) current.grade = gm[1];
      continue;
    }

    if (hasInst || hasDegree) {
      if (current) results.push(current);
      current = {
        institution: null,
        degree: null,
        specialization: null,
        graduationYear: null,
        grade: null,
      };

      const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) current.graduationYear = yearMatch[1];

      const gpaMatch = line.match(/(?:GPA|CGPA|Grade)?:?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*(?:10|4))?|\b\d{2}(?:\.\d+)?%)/i);
      if (gpaMatch) current.grade = gpaMatch[1];

      const degMatch = line.match(degreeRegex);
      if (degMatch) current.degree = degMatch[0].trim();

      const specMatch = line.match(/(?:in|of|–|-)\s+([A-Za-z\s]+(?:Engineering|Science|Administration|Technology|Mathematics|Studies))/i);
      if (specMatch) current.specialization = specMatch[1].trim();

      if (hasInst) {
        const parts = line.split(/[-–|;,]/).map((p) => p.trim());
        const instPart = parts.find((p) => instRegex.test(p));
        if (instPart) current.institution = instPart;
      }
    } else if (current) {
      if (!current.institution && instRegex.test(line)) {
        current.institution = line;
      }
      if (!current.graduationYear) {
        const ym = line.match(/\b(19\d{2}|20\d{2})\b/);
        if (ym) current.graduationYear = ym[1];
      }
      if (!current.grade) {
        const gm = line.match(/(?:GPA|CGPA|Grade)?:?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*(?:10|4))?|\b\d{2}(?:\.\d+)?%)/i);
        if (gm) current.grade = gm[1];
      }
      if (!current.specialization) {
        const sm = line.match(/(?:in|of|–|-)\s+([A-Za-z\s]+(?:Engineering|Science|Administration|Technology|Mathematics|Studies))/i);
        if (sm) current.specialization = sm[1].trim();
      }
    }
  }

  if (current) results.push(current);
  return results.filter(e => e.institution || e.degree);
};

/**
 * Parse Work Experience section
 */
const parseExperience = (expText) => {
  if (!expText) return [];

  const lines = expText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const dateRangeRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b(?:19|20)\d{2}\b)\s*(?:-|–|to)\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b(?:19|20)\d{2}\b)/i;
  const titleRegex = /(?:Senior\s+|Junior\s+|Lead\s+|Principal\s+|Web\s+Development\s+|Software\s+Development\s+)?(?:Software Engineer|Frontend Engineer|Backend Engineer|Full Stack Developer|Frontend Developer|Backend Developer|Web Developer|Data Scientist|DevOps Engineer|Product Manager|QA Engineer|Intern|Specialist|Analyst|Consultant|Architect|Developer|Engineer|Programmer)/i;

  const results = [];
  let current = null;

  for (const line of lines) {
    if (/test data notice|fictional sample|placeholders/i.test(line)) continue;
    const isBullet = /^[•\-\*]/.test(line);

    // If line is a bullet point, it's a responsibility belonging to current experience
    if (isBullet && current) {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      current.description = current.description
        ? `${current.description} ${cleanLine}`
        : cleanLine;
      continue;
    }

    const hasDate = dateRangeRegex.test(line);
    const hasTitle = titleRegex.test(line);

    if (hasDate || hasTitle) {
      if (current) results.push(current);
      current = {
        company: null,
        position: null,
        role: null,
        duration: null,
        description: '',
      };

      const dateMatch = line.match(dateRangeRegex);
      if (dateMatch) current.duration = dateMatch[0].trim();

      const titleMatch = line.match(titleRegex);
      if (titleMatch) {
        current.position = titleMatch[0].trim();
        current.role = titleMatch[0].trim();
      }

      const companyMatch = line.match(/(?:at|@)\s+([A-Za-z0-9\s&.,-]+?)(?=\s*\(|\s*[-–|]|\s*$)/i);
      if (companyMatch) {
        current.company = companyMatch[1].trim();
      } else {
        const parts = line.split(/[-–|]/).map((p) => p.trim());
        for (const p of parts) {
          if (!dateRangeRegex.test(p) && !titleRegex.test(p) && p.length > 2) {
            current.company = p;
            break;
          }
        }
      }
    } else if (current) {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      current.description = current.description
        ? `${current.description} ${cleanLine}`
        : cleanLine;
    }
  }

  if (current) results.push(current);
  return results.filter(e => e.position || e.company);
};

/**
 * Parse Projects section
 */
const parseProjects = (projText) => {
  if (!projText) return [];

  const lines = projText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];
  let current = null;

  for (const line of lines) {
    const linkMatch = line.match(/https?:\/\/[^\s]+/i);
    const isBullet = /^[•\-\*]/.test(line);

    if (isBullet && current) {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
      current.description = current.description
        ? `${current.description} ${cleanBullet}`
        : cleanBullet;
      if (!current.link && linkMatch) {
        current.link = linkMatch[0];
      }
    } else {
      if (current) results.push(current);

      const parts = line.split(/[-–|:]/).map((p) => p.trim());
      current = {
        title: parts[0] || 'Project',
        technologies: [],
        description: parts.length > 1 ? parts.slice(1).join(' - ') : '',
        link: linkMatch ? linkMatch[0] : null,
      };

      // Extract technologies mentioned in header line
      for (const patternList of Object.values(SKILL_PATTERNS)) {
        for (const item of patternList) {
          if (item.regex.test(line) && !current.technologies.includes(item.name)) {
            // Avoid matching 'GitHub' as a project technology if it's just a URL link
            if (item.name === 'GitHub' && /github\.com/i.test(line)) continue;
            current.technologies.push(item.name);
          }
        }
      }
    }
  }

  if (current) results.push(current);
  return results;
};

/**
 * Parse Certifications section
 */
const parseCertifications = (certText) => {
  if (!certText) return [];

  const lines = certText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];

  for (const line of lines) {
    const clean = line.replace(/^[•\-\*]\s*/, '').trim();
    if (!clean) continue;
    if (/test data notice|fictional sample|placeholders|do not use as a real/i.test(clean)) continue;

    const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
    const issuerMatch = clean.match(
      /\b(AWS|Amazon Web Services|Google Cloud|GCP|Microsoft|Meta|Coursera|Udemy|Cisco|CompTIA|Oracle|IBM|FreeCodeCamp|LinkedIn Learning)\b/i
    );

    const parts = clean.split(/[-–|]/).map((p) => p.trim());
    results.push({
      name: parts[0] || clean,
      issuer: issuerMatch ? issuerMatch[0] : (parts.length > 1 ? parts[1] : null),
      date: yearMatch ? yearMatch[1] : null,
    });
  }

  return results;
};

/**
 * Parse Activities section
 */
const parseActivities = (actText) => {
  if (!actText) return [];

  const lines = actText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];

  for (const line of lines) {
    const clean = line.replace(/^[•\-\*]\s*/, '').trim();
    if (!clean || /test data notice|fictional sample|placeholders|do not use as a real/i.test(clean)) continue;
    results.push(clean);
  }

  return results;
};

/**
 * Main parser entry point
 * Takes extracted raw text from PDF and returns a structured object
 */
const parseResumeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      personalInfo: {
        fullName: null,
        email: null,
        phone: null,
        location: null,
        linkedin: null,
        github: null,
        portfolio: null,
      },
      education: [],
      skills: {
        programmingLanguages: [],
        frameworks: [],
        databases: [],
        tools: [],
        other: [],
      },
      experience: [],
      projects: [],
      certifications: [],
      activities: [],
    };
  }

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections = segmentSections(rawText);

  return {
    personalInfo: extractPersonalInfo(rawText, lines),
    skills: extractSkills(rawText),
    education: parseEducation(sections.education),
    experience: parseExperience(sections.experience),
    projects: parseProjects(sections.projects),
    certifications: parseCertifications(sections.certifications),
    activities: parseActivities(sections.activities),
  };
};

module.exports = {
  parseResumeText,
  extractPhoneNumber,
  extractLocation,
  SKILL_PATTERNS,
};
