/**
 * Fallback Job Matching & Career Intelligence Engine for CareerLens AI
 * Executes deterministic, rule-based matching when the FastAPI microservice is unreachable.
 * Transparently tags results with analysisProvider: 'rule-based-fallback'.
 */

const SKILL_SYNONYMS = {
  js: 'javascript',
  javascript: 'javascript',
  ecmascript: 'javascript',
  es6: 'javascript',
  'es6+': 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  node: 'node.js',
  nodejs: 'node.js',
  'node.js': 'node.js',
  'node js': 'node.js',
  express: 'express.js',
  expressjs: 'express.js',
  'express.js': 'express.js',
  'express js': 'express.js',
  react: 'react',
  reactjs: 'react',
  'react.js': 'react',
  'react js': 'react',
  'react native': 'react native',
  next: 'next.js',
  nextjs: 'next.js',
  'next.js': 'next.js',
  'next js': 'next.js',
  vue: 'vue.js',
  vuejs: 'vue.js',
  'vue.js': 'vue.js',
  angular: 'angular',
  angularjs: 'angular',
  redux: 'redux',
  py: 'python',
  python: 'python',
  python3: 'python',
  fastapi: 'fastapi',
  django: 'django',
  flask: 'flask',
  pandas: 'pandas',
  numpy: 'numpy',
  scipy: 'scipy',
  'scikit-learn': 'scikit-learn',
  sklearn: 'scikit-learn',
  tensorflow: 'tensorflow',
  pytorch: 'pytorch',
  java: 'java',
  spring: 'spring boot',
  springboot: 'spring boot',
  'spring boot': 'spring boot',
  hibernate: 'hibernate',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  'mongo db': 'mongodb',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  psql: 'postgresql',
  'postgres db': 'postgresql',
  'postgresql db': 'postgresql',
  mysql: 'mysql',
  sqlite: 'sqlite',
  sqlite3: 'sqlite',
  redis: 'redis',
  sql: 'sql',
  nosql: 'nosql',
  docker: 'docker',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  aws: 'aws',
  gcp: 'google cloud platform',
  azure: 'microsoft azure',
  'ci/cd': 'ci/cd',
  cicd: 'ci/cd',
  git: 'git',
  'git version control': 'git',
  'git version control system': 'git',
  'git-version-control': 'git',
  'version control': 'git',
  'version control (git)': 'git',
  'version control using git': 'git',
  'git/github': 'git',
  'git / github': 'git',
  'git & github': 'git',
  'git and github': 'git',
  github: 'git',
  gitlab: 'git',
  html: 'html5',
  html5: 'html5',
  'html 5': 'html5',
  css: 'css3',
  css3: 'css3',
  'css 3': 'css3',
  tailwind: 'tailwind css',
  tailwindcss: 'tailwind css',
  bootstrap: 'bootstrap',
  'bootstrap 5': 'bootstrap',
  sass: 'sass',
  scss: 'sass',
  rest: 'restful apis',
  'rest api': 'restful apis',
  'rest apis': 'restful apis',
  restful: 'restful apis',
  'restful api': 'restful apis',
  'restful apis': 'restful apis',
  'rest-api': 'restful apis',
  'rest-apis': 'restful apis',
  'restful-api': 'restful apis',
  'restful-apis': 'restful apis',
  'rest api\'s': 'restful apis',
  graphql: 'graphql',
  grpc: 'grpc',
  websockets: 'websockets',
  microservices: 'microservices',
  postman: 'postman',
  jira: 'jira',
  jest: 'jest',
  pytest: 'pytest',
  mocha: 'mocha',
  selenium: 'selenium',
  cypress: 'cypress',
  'unit testing': 'unit testing',
  linux: 'linux',
  'bash/shell': 'bash/shell',
  c: 'c',
  'c++': 'c++',
  cpp: 'c++',
  'c#': 'c#',
  csharp: 'c#',
  '.net': '.net',
  dotnet: '.net',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  kotlin: 'kotlin',
  swift: 'swift',
};

const CANONICAL_DISPLAY_NAMES = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  'node.js': 'Node.js',
  'express.js': 'Express.js',
  react: 'React',
  'react native': 'React Native',
  'next.js': 'Next.js',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  redux: 'Redux',
  python: 'Python',
  fastapi: 'FastAPI',
  django: 'Django',
  flask: 'Flask',
  pandas: 'Pandas',
  numpy: 'NumPy',
  scipy: 'SciPy',
  'scikit-learn': 'Scikit-Learn',
  tensorflow: 'TensorFlow',
  pytorch: 'PyTorch',
  java: 'Java',
  'spring boot': 'Spring Boot',
  hibernate: 'Hibernate',
  mongodb: 'MongoDB',
  postgresql: 'PostgreSQL',
  sqlite: 'SQLite',
  mysql: 'MySQL',
  redis: 'Redis',
  sql: 'SQL',
  nosql: 'NoSQL',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  'google cloud platform': 'GCP',
  'microsoft azure': 'Azure',
  'ci/cd': 'CI/CD',
  jenkins: 'Jenkins',
  'github actions': 'GitHub Actions',
  terraform: 'Terraform',
  ansible: 'Ansible',
  linux: 'Linux',
  'bash/shell': 'Bash / Shell',
  html5: 'HTML5',
  css3: 'CSS3',
  'tailwind css': 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  sass: 'Sass',
  'restful apis': 'RESTful APIs',
  graphql: 'GraphQL',
  grpc: 'gRPC',
  websockets: 'WebSockets',
  microservices: 'Microservices',
  git: 'Git',
  postman: 'Postman',
  jira: 'Jira',
  jest: 'Jest',
  pytest: 'PyTest',
  mocha: 'Mocha',
  selenium: 'Selenium',
  cypress: 'Cypress',
  'unit testing': 'Unit Testing',
  c: 'C',
  'c++': 'C++',
  'c#': 'C#',
  '.net': '.NET',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  kotlin: 'Kotlin',
  swift: 'Swift',
};

const formatDisplaySkill = (original, canonical) => {
  if (CANONICAL_DISPLAY_NAMES[canonical]) return CANONICAL_DISPLAY_NAMES[canonical];
  if (original && (original === original.toUpperCase() || /[a-z][A-Z]/.test(original))) {
    return original.trim();
  }
  return original ? original.trim().charAt(0).toUpperCase() + original.trim().slice(1) : canonical;
};

const CAREER_ROLES = [
  {
    role: 'Software Developer',
    coreSkills: ['python', 'java', 'c++', 'javascript', 'git', 'sql'],
    projects: ['CLI Task Manager', 'Data Structures Visualizer', 'Database-backed CRUD application'],
  },
  {
    role: 'Frontend Developer',
    coreSkills: ['javascript', 'typescript', 'react', 'html5', 'css3', 'tailwind css', 'restful apis'],
    projects: ['Interactive Analytics Dashboard', 'E-Commerce Storefront', 'Collaborative Kanban Board'],
  },
  {
    role: 'Backend Developer',
    coreSkills: ['node.js', 'express.js', 'python', 'fastapi', 'postgresql', 'mongodb', 'restful apis', 'docker'],
    projects: ['Role-Based Access Control API', 'High-throughput URL Shortener', 'Notification Microservice'],
  },
  {
    role: 'Full Stack Developer',
    coreSkills: ['javascript', 'typescript', 'react', 'node.js', 'express.js', 'mongodb', 'restful apis', 'docker'],
    projects: ['Full Stack E-Commerce Platform', 'Real-time Messaging Application', 'Project Management SaaS'],
  },
  {
    role: 'Data Analyst',
    coreSkills: ['python', 'sql', 'pandas', 'numpy', 'excel'],
    projects: ['Sales Analytics Dashboard', 'Customer Churn Analysis', 'Exploratory Data Analysis'],
  },
  {
    role: 'Data Scientist',
    coreSkills: ['python', 'pandas', 'numpy', 'scikit-learn', 'sql'],
    projects: ['Predictive Price Regression', 'Customer Segmentation Model', 'Time Series Forecaster'],
  },
  {
    role: 'Machine Learning Engineer',
    coreSkills: ['python', 'pytorch', 'tensorflow', 'scikit-learn', 'docker'],
    projects: ['Image Classification API', 'ML Pipeline Deployment', 'Sentiment Analysis Service'],
  },
  {
    role: 'AI Engineer',
    coreSkills: ['python', 'pytorch', 'fastapi', 'natural language processing'],
    projects: ['RAG Document Q&A App', 'AI Workflow Automation Agent', 'Domain Chatbot'],
  },
  {
    role: 'DevOps Engineer',
    coreSkills: ['docker', 'kubernetes', 'linux', 'ci/cd', 'aws', 'git'],
    projects: ['Automated CI/CD Pipeline', 'Kubernetes Deployment Script', 'Infrastructure as Code on AWS'],
  },
  {
    role: 'Cybersecurity Analyst',
    coreSkills: ['linux', 'networking', 'python', 'bash/shell'],
    projects: ['Network Packet Sniffer in Python', 'Vulnerability Scanner', 'Cryptographic Vault'],
  },
  {
    role: 'QA Engineer',
    coreSkills: ['javascript', 'python', 'git', 'unit testing'],
    projects: ['Automated End-to-End Test Suite', 'REST API Test Automation Framework'],
  },
  {
    role: 'Cloud Engineer',
    coreSkills: ['aws', 'microsoft azure', 'docker', 'linux', 'python'],
    projects: ['Serverless REST API with AWS Lambda', 'Multi-Tier Cloud VPC Architecture'],
  },
];

const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  let cleaned = skill.trim().toLowerCase().replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/^[\s,;:()[\]{}'"`*~-]+|[\s,;:()[\]{}'"`*~-]+$/g, '');
  if (SKILL_SYNONYMS[cleaned]) return SKILL_SYNONYMS[cleaned];

  if (cleaned.endsWith('.') && cleaned !== '.net') {
    const withoutDot = cleaned.slice(0, -1).trim();
    if (SKILL_SYNONYMS[withoutDot]) return SKILL_SYNONYMS[withoutDot];
  }

  const hyphenSpaced = cleaned.replace(/[-/]/g, ' ');
  if (SKILL_SYNONYMS[hyphenSpaced]) return SKILL_SYNONYMS[hyphenSpaced];

  return SKILL_SYNONYMS[cleaned] || cleaned;
};

const extractSkillsFromText = (text) => {
  if (!text || typeof text !== 'string') return [];
  const found = new Set();
  const lower = text.toLowerCase();

  for (const [alias, canonical] of Object.entries(SKILL_SYNONYMS)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-zA-Z0-9_#+])${escaped}(?![a-zA-Z0-9_#+])`, 'i');
    if (regex.test(lower)) {
      found.add(canonical);
    }
  }
  return Array.from(found).sort();
};

const extractSkillsFromResume = (resumeData) => {
  const skillsSet = new Set();
  if (!resumeData || typeof resumeData !== 'object') return [];

  const rawResume = resumeData.parsedData && typeof resumeData.parsedData === 'object'
    ? resumeData.parsedData
    : resumeData;

  const skillsObj = rawResume.skills || resumeData.skills || {};
  for (const cat of ['programmingLanguages', 'frameworks', 'databases', 'tools', 'other']) {
    const list = skillsObj[cat] || [];
    if (Array.isArray(list)) {
      list.forEach((s) => {
        if (s) skillsSet.add(normalizeSkill(s));
      });
    }
  }

  const projects = rawResume.projects || resumeData.projects || [];
  if (Array.isArray(projects)) {
    projects.forEach((p) => {
      if (Array.isArray(p.technologies)) {
        p.technologies.forEach((t) => skillsSet.add(normalizeSkill(t)));
      }
      if (p.description) {
        extractSkillsFromText(p.description).forEach((s) => skillsSet.add(s));
      }
    });
  }

  const experience = rawResume.experience || resumeData.experience || [];
  if (Array.isArray(experience)) {
    experience.forEach((e) => {
      if (e.description) {
        extractSkillsFromText(e.description).forEach((s) => skillsSet.add(s));
      }
    });
  }

  const rawText = resumeData.rawText || rawResume.rawText;
  if (rawText) {
    extractSkillsFromText(rawText).forEach((s) => skillsSet.add(s));
  }

  return Array.from(skillsSet).filter(Boolean).sort();
};

const runFallbackJobParse = (jobDescription, jobTitle = 'Software Engineer', companyName = 'Company') => {
  const text = jobDescription || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const reqLines = [];
  const prefLines = [];
  let mode = 'general';

  const reqHeader = /(required|minimum qualifications?|must have|requirements?|what you('ll)? need)/i;
  const prefHeader = /(preferred|nice to have|bonus|good to have|desired|plus)/i;

  for (const line of lines) {
    if (reqHeader.test(line) && line.length < 60) {
      mode = 'required';
      continue;
    } else if (prefHeader.test(line) && line.length < 60) {
      mode = 'preferred';
      continue;
    }

    if (mode === 'required') reqLines.push(line);
    else if (mode === 'preferred') prefLines.push(line);
  }

  let reqSkills = extractSkillsFromText(reqLines.join(' '));
  let prefSkills = extractSkillsFromText(prefLines.join(' '));
  const allSkills = extractSkillsFromText(text);

  if (reqSkills.length === 0 && allSkills.length > 0) {
    const splitIndex = Math.max(3, Math.floor(allSkills.length * 0.75));
    reqSkills = allSkills.slice(0, splitIndex);
    prefSkills = allSkills.slice(splitIndex);
  }

  // Deduplicate
  prefSkills = prefSkills.filter((s) => !reqSkills.includes(s));

  return {
    requiredSkills: reqSkills,
    preferredSkills: prefSkills,
    requiredQualifications: [
      "Bachelor's degree in Computer Science, IT, or equivalent engineering discipline (or equivalent practical track record)",
    ],
    experienceRequirements: 'Fresher / Entry-Level friendly (0-2 years, academic projects valued)',
    projectRequirements: [
      'Demonstrated hands-on projects with modern programming languages, APIs, and version control',
    ],
    responsibilities: [
      `Develop, test, and maintain features for the ${jobTitle} role`,
      'Collaborate with team members on code reviews and feature implementation',
      'Produce clean, readable, and well-structured technical solutions',
    ],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Communication'],
  };
};

const runFallbackJobMatch = (resumeData, jobDescription, jobTitle = 'Software Engineer', companyName = 'Company', extractedRequirements = null) => {
  let reqs = extractedRequirements;
  if (!reqs) {
    reqs = runFallbackJobParse(jobDescription, jobTitle, companyName);
  }

  const requiredSkills = reqs.requiredSkills || reqs.required_skills || [];
  const preferredSkills = reqs.preferredSkills || reqs.preferred_skills || [];

  const resumeSkills = extractSkillsFromResume(resumeData);
  const resumeSkillsSet = new Set(resumeSkills);

  const matchedSkills = [];
  const missingRequiredSkills = [];
  const missingPreferredSkills = [];

  let reqMatchedCount = 0;
  for (const reqSkill of requiredSkills) {
    const canonical = normalizeSkill(reqSkill);
    const formatted = formatDisplaySkill(reqSkill, canonical);
    if (resumeSkillsSet.has(canonical)) {
      matchedSkills.push({
        skill: formatted,
        matchType: reqSkill.trim().toLowerCase() === canonical ? 'exact' : 'equivalent',
        matchedWith: canonical,
        isRequired: true,
      });
      reqMatchedCount++;
    } else {
      missingRequiredSkills.push({
        skill: formatted,
        priority: 'High',
        isRequired: true,
        reason: `Identified as a core mandatory qualification in ${companyName}'s ${jobTitle} posting.`,
        suggestedLearningDirection: `Build a focused practical mini-project implementing ${formatted} and add it to your resume.`,
      });
    }
  }

  let prefMatchedCount = 0;
  for (const prefSkill of preferredSkills) {
    const canonical = normalizeSkill(prefSkill);
    const formatted = formatDisplaySkill(prefSkill, canonical);
    if (resumeSkillsSet.has(canonical)) {
      matchedSkills.push({
        skill: formatted,
        matchType: prefSkill.trim().toLowerCase() === canonical ? 'exact' : 'equivalent',
        matchedWith: canonical,
        isRequired: false,
      });
      prefMatchedCount++;
    } else {
      missingPreferredSkills.push({
        skill: formatted,
        priority: missingRequiredSkills.length < 2 ? 'Medium' : 'Low',
        isRequired: false,
        reason: `Preferred / nice-to-have skill for ${jobTitle} at ${companyName}.`,
        suggestedLearningDirection: `Explore ${formatted} fundamentals and integrate into secondary project features.`,
      });
    }
  }

  // Scoring according to Prompt Section 5:
  // Technical Skills: 35%, Projects: 25%, Education: 15%, Experience: 15%, Preferred Skills: 10%
  const totalReq = requiredSkills.length;
  let rawTechScore = 0;
  let weightedTech = 0;
  let techFeedback = '';
  if (totalReq > 0) {
    const techRatio = reqMatchedCount / totalReq;
    const breadthBonus = reqMatchedCount > 0 ? Math.min(20, resumeSkills.length * 2) : 0;
    rawTechScore = Math.min(100, Math.round(techRatio * 80 + breadthBonus));
    weightedTech = Number((rawTechScore * 0.35).toFixed(2));
    techFeedback = `Matched ${reqMatchedCount} of ${totalReq} core technical requirements.`;
  } else {
    rawTechScore = 0;
    weightedTech = 0;
    techFeedback = 'No mandatory technical skills specified in job requirements.';
  }

  // Projects: 25%
  const rawResume = resumeData?.parsedData || resumeData || {};
  const projects = rawResume.projects || [];
  let rawProjScore = 20;
  if (Array.isArray(projects) && projects.length > 0) {
    const hasLinks = projects.filter((p) => p.link && p.link.length > 5).length;
    rawProjScore = Math.min(100, projects.length * 25 + reqMatchedCount * 10 + hasLinks * 10);
  }
  let weightedProj = Number((rawProjScore * 0.25).toFixed(2));

  // Education: 15%
  const education = rawResume.education || [];
  let rawEduScore = 40;
  if (Array.isArray(education) && education.length > 0) {
    const deg = String(education[0]?.degree || '').toLowerCase();
    const spec = String(education[0]?.specialization || '').toLowerCase();
    if (/computer|technology|engineering|software|cs|it/.test(deg + spec)) {
      rawEduScore = 95;
    } else {
      rawEduScore = 75;
    }
  }
  let weightedEdu = Number((rawEduScore * 0.15).toFixed(2));

  // Experience: 15% (Student friendly)
  const experience = rawResume.experience || [];
  let rawExpScore = 30;
  let expFeedback = 'Limited formal work experience detected.';
  let studentPerspective = 'Focus on building substantial GitHub projects and open-source contributions.';
  if (Array.isArray(experience) && experience.length > 0) {
    rawExpScore = Math.min(100, 70 + experience.length * 15);
    expFeedback = `Demonstrated practical background with ${experience.length} entry/entries.`;
    studentPerspective = 'Internship background provides valuable practical evidence of readiness.';
  } else if (rawProjScore >= 60) {
    rawExpScore = 55;
    expFeedback = 'No commercial employment listed, but academic and portfolio projects demonstrate practical execution.';
    studentPerspective = 'For student freshers, portfolio projects serve as strong proxies for commercial experience.';
  }
  let weightedExp = Number((rawExpScore * 0.15).toFixed(2));

  // Preferred Skills: 10%
  const totalPref = preferredSkills.length;
  let rawPrefScore = 0;
  let weightedPref = 0;
  let prefFeedback = '';
  if (totalPref > 0) {
    rawPrefScore = Math.round((prefMatchedCount / totalPref) * 100);
    weightedPref = Number((rawPrefScore * 0.10).toFixed(2));
    prefFeedback = `Matched ${prefMatchedCount} of ${totalPref} preferred skills.`;
  } else {
    rawPrefScore = 0;
    weightedPref = 0;
    prefFeedback = 'No preferred skills specified in job requirements.';
  }

  // Enforce caps
  weightedTech = Math.min(35, Math.max(0, weightedTech));
  weightedProj = Math.min(25, Math.max(0, weightedProj));
  weightedEdu = Math.min(15, Math.max(0, weightedEdu));
  weightedExp = Math.min(15, Math.max(0, weightedExp));
  weightedPref = Math.min(10, Math.max(0, weightedPref));

  const sumCategory = Number((weightedTech + weightedProj + weightedEdu + weightedExp + weightedPref).toFixed(2));
  const overallScore = Math.max(0, Math.min(100, Number(sumCategory.toFixed(1))));

  let matchClassification = 'Low Match';
  if (overallScore >= 85) matchClassification = 'Excellent Match';
  else if (overallScore >= 70) matchClassification = 'Strong Match';
  else if (overallScore >= 50) matchClassification = 'Moderate Match';

  return {
    overallScore,
    matchClassification,
    categoryScores: {
      technicalSkills: {
        score: rawTechScore,
        weightedScore: weightedTech,
        weightPercentage: 35,
        feedback: techFeedback,
      },
      projectsRelevance: {
        score: rawProjScore,
        weightedScore: weightedProj,
        weightPercentage: 25,
        feedback: `Evaluated ${projects.length} project(s) against role technical stack.`,
      },
      educationCompatibility: {
        score: rawEduScore,
        weightedScore: weightedEdu,
        weightPercentage: 15,
        feedback: 'Education background verified against engineering requirements.',
      },
      experienceInternships: {
        score: rawExpScore,
        weightedScore: weightedExp,
        weightPercentage: 15,
        feedback: expFeedback,
      },
      preferredSkills: {
        score: rawPrefScore,
        weightedScore: weightedPref,
        weightPercentage: 10,
        feedback: prefFeedback,
      },
    },
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    projectEvaluation: {
      relevanceScore: rawProjScore,
      feedback: `Demonstrates practical development ability across ${projects.length} project(s).`,
      suggestions: 'Add measurable metrics, architecture diagrams, and live demo links to project write-ups.',
    },
    educationEvaluation: {
      compatibilityScore: rawEduScore,
      feedback: 'Degree and coursework align with core technical qualification benchmarks.',
    },
    experienceEvaluation: {
      compatibilityScore: rawExpScore,
      feedback: expFeedback,
      studentPerspective,
    },
    matchingExplanation: `You scored ${overallScore}/100 (${matchClassification}) for the ${jobTitle} position at ${companyName}. You possess ${reqMatchedCount} of ${totalReq} required skills.`,
    keyObservations: [
      `Technical skills match scored ${rawTechScore}% (${weightedTech}/35 pts).`,
      `Projects relevance scored ${rawProjScore}% (${weightedProj}/25 pts).`,
      `Education compatibility scored ${rawEduScore}% (${weightedEdu}/15 pts).`,
      `Experience track record scored ${rawExpScore}% (${weightedExp}/15 pts).`,
      `Preferred skills alignment scored ${rawPrefScore}% (${weightedPref}/10 pts).`,
    ],
    analysisProvider: 'rule-based-fallback',
  };
};

const runFallbackCareerRecommendations = (resumeData, jobDescription = null, targetRole = null) => {
  const resumeSkills = new Set(extractSkillsFromResume(resumeData));

  const roleScores = CAREER_ROLES.map((roleInfo) => {
    const matched = roleInfo.coreSkills.filter((s) => resumeSkills.has(s));
    const missing = roleInfo.coreSkills.filter((s) => !resumeSkills.has(s));
    let score = Math.round((matched.length / Math.max(1, roleInfo.coreSkills.length)) * 100);

    if (targetRole && roleInfo.role.toLowerCase().includes(targetRole.toLowerCase())) {
      score = Math.min(100, score + 15);
    }
    if (jobDescription && jobDescription.toLowerCase().includes(roleInfo.role.toLowerCase())) {
      score = Math.min(100, score + 10);
    }

    const why = matched.length > 0
      ? `You already possess ${matched.length} of ${roleInfo.coreSkills.length} core foundational skills for ${roleInfo.role} (${matched.slice(0, 4).join(', ')}).`
      : `Accessible entry-level path by building foundational competence in ${roleInfo.coreSkills.slice(0, 3).join(', ')}.`;

    return {
      role: roleInfo.role,
      recommendationScore: score,
      whyRecommended: why,
      relevantExistingSkills: matched.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      missingSkills: missing.slice(0, 4).map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      suggestedProjects: roleInfo.projects,
      preparationPriorities: [
        missing.length > 0 ? `Master core missing skill: ${missing[0]}` : 'Build production capstone project',
        'Add public GitHub repository links with clean documentation',
        'Prepare for technical problem-solving interview rounds',
      ],
    };
  });

  roleScores.sort((a, b) => b.recommendationScore - a.recommendationScore);

  const primary = roleScores.slice(0, 3).map((item) => ({ ...item, isPrimary: true }));
  const alternative = roleScores.slice(3, 6).map((item) => ({ ...item, isPrimary: false }));

  return {
    primaryRecommendations: primary,
    alternativeRecommendations: alternative,
    studentAdvice:
      'As a student or fresher, focus on demonstrating depth in 1 primary career path while keeping a complementary secondary path open. Recruiters prioritize high-quality code and clear problem-solving over shallow knowledge across dozens of disconnected tools.',
    analysisProvider: 'rule-based-fallback',
  };
};

const getBeginnerFriendlyWeeklyModule = (skillName, weekNum, totalWeeks, jobTitle, targetSkills) => {
  const norm = (skillName || '').toLowerCase().trim();
  const isFinalWeek = weekNum === totalWeeks && totalWeeks >= 3;

  if (isFinalWeek) {
    const focusRoles = targetSkills && targetSkills.length > 0 ? targetSkills.slice(0, 3).join(', ') : 'core technical tools';
    return {
      title: `Week ${weekNum}: Build Your ${jobTitle} Showcase Project`,
      learningObjective: `Combine everything you learned into one complete project you can proudly put on your resume and show to employers.`,
      skillToLearn: `${jobTitle} Portfolio Project`,
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        `Plan a practical application that solves an everyday problem using ${focusRoles}`,
        'Connect your user interface, backend logic, and data storage into one working system',
        'Write a clear, friendly README file with project screenshots, features, and setup steps',
        'Practice explaining your project in simple, natural words for upcoming interviews',
      ],
      practicalExercises: [
        'Test all buttons, forms, and pages to make sure there are no broken links or errors',
        'Deploy your project to a free hosting service so anyone can test it with a live link',
        'Practice answering: "What does this project do and what was the most interesting part you built?"',
      ],
      suggestedMiniProjects: [
        `Complete ${jobTitle} showcase project with a live web link and public GitHub repository`,
      ],
      expectedOutcome: `You will have an impressive, working portfolio project that demonstrates your hands-on skills to recruiters.`,
    };
  }

  // 1. APIs / RESTful APIs
  if (norm.includes('api') || norm.includes('rest') || norm.includes('endpoint')) {
    return {
      title: `Week ${weekNum}: Learn API Basics and Connect Services`,
      learningObjective: `Understand how applications talk to each other and learn how to fetch, send, and display data using web APIs.`,
      skillToLearn: 'RESTful APIs',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand what an API is and why modern websites and mobile apps use them',
        'Learn how common requests work: GET (view data), POST (create data), PUT (update), and DELETE (remove)',
        'Learn how to read and write JSON data, the universal language of web applications',
        'Use beginner-friendly tools like Postman to test sending and receiving API requests',
      ],
      practicalExercises: [
        'Send your first GET request to a free public API (such as weather or quote data) using Postman',
        'Build a simple API endpoint that receives user data and responds with a friendly JSON message',
        'Test what happens when requested data is missing, returning a standard 404 error code',
      ],
      suggestedMiniProjects: [
        'Build a simple application that fetches live data from an API and displays it on screen',
      ],
      expectedOutcome: `You will understand how web APIs work and be able to connect your application to external services with confidence.`,
    };
  }

  // 2. Docker / Containers
  if (norm.includes('docker') || norm.includes('container')) {
    return {
      title: `Week ${weekNum}: Learn Docker Basics and Run Apps in Containers`,
      learningObjective: `Understand what Docker does and learn how to run your application inside an isolated, reliable container.`,
      skillToLearn: 'Docker & Containers',
      priority: weekNum <= 2 ? 'High' : 'Medium',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Learn what containers are and why developers use Docker to make sure apps run the same way everywhere',
        'Install Docker Desktop on your computer and learn essential starter commands',
        'Understand what a Dockerfile is and how it tells Docker how to package your code and tools',
        'Learn how Docker Compose launches both your web app and a database together with one command',
      ],
      practicalExercises: [
        'Write a simple 5-line Dockerfile for a sample project on your machine',
        'Build a Docker image and run it locally in your browser',
        'Practice viewing running containers and stopping them from the terminal or Docker Desktop',
      ],
      suggestedMiniProjects: [
        'Package a small web application inside Docker so anyone can run it on their computer with one command',
      ],
      expectedOutcome: `You will understand how Docker works and be able to run and share containerized apps with ease.`,
    };
  }

  // 3. React / Frontend UI
  if (norm.includes('react') || norm.includes('frontend') || norm.includes('ui')) {
    return {
      title: `Week ${weekNum}: Build Interactive User Interfaces with React`,
      learningObjective: `Learn the fundamental building blocks of React and create interactive, modern web pages with reusable components.`,
      skillToLearn: 'React',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand how React breaks web pages into reusable pieces called components (like buttons, navbars, and cards)',
        'Learn JSX syntax, which allows writing HTML-like code directly inside your JavaScript files',
        'Learn how useState holds dynamic information that changes when users click, type, or interact',
        'Learn how props allow parent components to pass data and instructions down to child components',
      ],
      practicalExercises: [
        'Build a small interactive counter with plus and minus buttons to practice useState',
        'Create a reusable ProductCard component that displays an image, title, price, and buy button',
        'Render a list of items dynamically on the screen using JavaScript\'s map function in React',
      ],
      suggestedMiniProjects: [
        'Build an interactive To-Do List or Recipe App with add, mark as complete, and delete actions',
      ],
      expectedOutcome: `You will be able to build dynamic, responsive web interfaces using modern React components.`,
    };
  }

  // 4. Node.js / Express / Backend
  if (norm.includes('node') || norm.includes('express') || norm.includes('backend') || norm.includes('server')) {
    return {
      title: `Week ${weekNum}: Build Your First Backend Server with Node.js and Express`,
      learningObjective: `Learn how backend servers work and build your own web server that handles user requests and URLs.`,
      skillToLearn: 'Node.js & Express',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand the role of backend servers in processing business logic and protecting sensitive data',
        'Set up a Node.js project using npm init and install the Express library',
        'Learn how Express routes handle visits to different pages and URLs like /users or /products',
        'Understand how request and response objects send HTML or JSON back to the browser',
      ],
      practicalExercises: [
        'Create a basic Express server that listens on port 5000 and responds to visit requests',
        'Create a GET /api/items endpoint that returns a list of items as JSON',
        'Create a POST /api/items endpoint that accepts new items sent from a form or API client',
      ],
      suggestedMiniProjects: [
        'Build a Notes or Task Manager API that lets users view, create, and delete notes',
      ],
      expectedOutcome: `You will know how to create backend servers and build REST API endpoints from scratch.`,
    };
  }

  // 5. Databases / MongoDB / SQL / PostgreSQL / MySQL
  if (norm.includes('mongo') || norm.includes('sql') || norm.includes('database') || norm.includes('postgres') || norm.includes('data store')) {
    return {
      title: `Week ${weekNum}: Store and Manage Application Data with Databases`,
      learningObjective: `Learn how databases store information permanently and how to connect your backend application to a database.`,
      skillToLearn: skillName,
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand why applications need persistent databases instead of storing data in temporary variables',
        'Learn the four core database operations (CRUD): Create, Read, Update, and Delete',
        'Set up a free cloud database (like MongoDB Atlas or Supabase PostgreSQL)',
        'Learn how to connect your backend code to the database using an easy library (Mongoose or Prisma)',
      ],
      practicalExercises: [
        'Connect your backend server to your database and test saving your first document',
        'Write queries to find specific records (such as finding all users created today)',
        'Update an existing record and verify the change in your database dashboard',
      ],
      suggestedMiniProjects: [
        'Build a Contact Book API that stores, updates, and searches contact cards in a real database',
      ],
      expectedOutcome: `You will be able to connect any application to a real database and perform all essential data operations.`,
    };
  }

  // 6. Testing / QA / Unit Testing
  if (norm.includes('test') || norm.includes('qa') || norm.includes('jest')) {
    return {
      title: `Week ${weekNum}: Test Your Code to Prevent Bugs and Errors`,
      learningObjective: `Learn how to write simple automated tests so you can be confident your code works properly before deploying.`,
      skillToLearn: 'Automated Testing',
      priority: 'Medium',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand why testing saves time and prevents embarrassing bugs in production',
        'Learn what a unit test is: a small script that tests one specific function or feature',
        'Explore common testing tools and learn how to write test cases with assert or expect',
        'Learn how to test both normal inputs (happy path) and edge cases (like empty inputs or invalid numbers)',
      ],
      practicalExercises: [
        'Write 3 unit tests for a simple calculator or string-formatting function',
        'Test an API endpoint to verify it returns a 200 success status when given valid data',
        'Test that an API endpoint properly rejects missing inputs with a helpful 400 error message',
      ],
      suggestedMiniProjects: [
        'Add automated test coverage to an existing project and verify all tests pass with one command',
      ],
      expectedOutcome: `You will be able to write automated tests that catch bugs early and prove your code is reliable.`,
    };
  }

  // 7. Git / GitHub / Version Control
  if (norm.includes('git') || norm.includes('version control')) {
    return {
      title: `Week ${weekNum}: Track Code Changes and Collaborate with Git & GitHub`,
      learningObjective: `Master version control basics so you never lose your work and can showcase your code on GitHub.`,
      skillToLearn: 'Git & GitHub',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand what version control is and why every software developer uses Git daily',
        'Learn the primary Git commands: git init, git add, git commit, and git push',
        'Create a GitHub account and push your first local repository to the cloud',
        'Learn how Git branches let you experiment on new features without breaking your main code',
      ],
      practicalExercises: [
        'Initialize a Git repository, make 3 meaningful commits with clear messages, and push to GitHub',
        'Create a new branch, add a feature, commit it, and merge it back into main',
        'Write a clean README.md file explaining what your project does with screenshots',
      ],
      suggestedMiniProjects: [
        'Publish a polished project repository on GitHub with clean commit history and setup instructions',
      ],
      expectedOutcome: `You will be able to comfortably save, track, and showcase all your code on GitHub like a professional.`,
    };
  }

  // 8. Cloud / AWS / Deployment
  if (norm.includes('cloud') || norm.includes('aws') || norm.includes('deploy') || norm.includes('ci/cd') || norm.includes('devops')) {
    return {
      title: `Week ${weekNum}: Deploy Your Application to the Live Internet`,
      learningObjective: `Learn how to host your application on the web so anyone with a link can use it from anywhere.`,
      skillToLearn: 'Cloud Deployment',
      priority: 'Medium',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand the difference between running an app on your local machine vs. hosting it in the cloud',
        'Explore beginner-friendly hosting platforms (like Vercel, Render, or Netlify)',
        'Learn how environment variables keep secret passwords and database keys safe in production',
        'Connect your GitHub repository to a hosting platform for automatic deployments on push',
      ],
      practicalExercises: [
        'Deploy a frontend web app on Vercel or Netlify and get a public live URL',
        'Deploy a backend API server on Render and test it using a public link',
        'Configure environment variables on your hosting dashboard so your live app connects to your database',
      ],
      suggestedMiniProjects: [
        'Deploy a complete full-stack web application with a live URL to share on your resume and LinkedIn',
      ],
      expectedOutcome: `You will know how to take any web project from your computer and deploy it live to the internet.`,
    };
  }

  // 9. Python / Scripting
  if (norm.includes('python')) {
    return {
      title: `Week ${weekNum}: Python Fundamentals and Helpful Automation Scripts`,
      learningObjective: `Learn Python syntax, essential data structures, and how to write scripts that automate everyday tasks.`,
      skillToLearn: 'Python',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Learn Python syntax: variables, conditionals (if/else), loops, and functions',
        'Master Python\'s built-in data collections: lists, dictionaries, and sets',
        'Learn how to read and write files (text, CSV, JSON) on your computer using Python',
        'Install useful third-party packages using pip (Python\'s package installer)',
      ],
      practicalExercises: [
        'Write a script that counts word frequencies in a text document',
        'Write a function that reads a CSV file and calculates the average value of a column',
        'Create a simple interactive quiz program that asks users questions and calculates their score',
      ],
      suggestedMiniProjects: [
        'Build an automated file organizer that sorts files on your computer into folders by extension',
      ],
      expectedOutcome: `You will have a strong grasp of Python programming and be able to automate everyday file and data tasks.`,
    };
  }

  // 10. Data Analysis / Pandas
  if (norm.includes('pandas') || norm.includes('data analysis') || norm.includes('numpy')) {
    return {
      title: `Week ${weekNum}: Explore and Clean Real-World Data with Pandas`,
      learningObjective: `Learn how to load, filter, clean, and analyze spreadsheets and datasets using Python and Pandas.`,
      skillToLearn: 'Data Analysis with Pandas',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Understand what Pandas is and how its DataFrames represent tables of data',
        'Learn how to load CSV, Excel, and JSON data files into Pandas with one line of code',
        'Learn how to inspect datasets: check column types, summary statistics, and missing values',
        'Learn how to filter rows and select columns based on conditions (like sales > 1000)',
      ],
      practicalExercises: [
        'Load a real dataset (like student test scores or movie ratings) and find the top 5 highest values',
        'Clean missing or null data by filling values or removing empty rows',
        'Group data by category (using groupby) and compute totals and averages',
      ],
      suggestedMiniProjects: [
        'Build an Exploratory Data Analysis report answering 5 interesting questions about a real dataset',
      ],
      expectedOutcome: `You will be able to take messy spreadsheets and datasets, clean them up, and extract useful insights.`,
    };
  }

  // 11. JavaScript / TypeScript
  if (norm.includes('javascript') || norm.includes('typescript') || norm.includes('js') || norm.includes('ts')) {
    return {
      title: `Week ${weekNum}: JavaScript Essentials and Modern Syntax`,
      learningObjective: `Master core JavaScript concepts that power modern web and frontend development.`,
      skillToLearn: 'JavaScript Essentials',
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        'Learn modern JavaScript syntax: const/let, arrow functions, template strings, and destructuring',
        'Understand how asynchronous code works: Promises, async/await, and fetching web data',
        'Learn how JavaScript interacts with web pages: listening for button clicks and updating HTML',
        'Understand how to avoid common beginner bugs using console.log and basic browser developer tools',
      ],
      practicalExercises: [
        'Write an async function that fetches data from an API and logs the result',
        'Filter and transform an array of student objects using map and filter',
        'Build a simple form validation function that checks if an email contains an @ symbol',
      ],
      suggestedMiniProjects: [
        'Build an interactive currency converter or tip calculator in the browser',
      ],
      expectedOutcome: `You will have a solid foundation in modern JavaScript and be ready to learn web frameworks like React or Node.js.`,
    };
  }

  // 12. Dynamic Beginner-Friendly Fallback for Any Other Skill or Custom Role
  if (weekNum === 1) {
    return {
      title: `Week 1: Learn ${skillName} Basics and Set Up Your Environment`,
      learningObjective: `Understand what ${skillName} is, why developers use it, and set up your workspace to write your first code.`,
      skillToLearn: skillName,
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        `Learn the basic concepts of ${skillName} and how it fits into modern software development`,
        'Install the necessary software, code editor plugins, and tools on your computer',
        'Read simple examples and understand common patterns used by developers',
        'Learn how to look up documentation and troubleshoot error messages when you get stuck',
      ],
      practicalExercises: [
        `Write a simple beginner exercise exploring the basic features of ${skillName}`,
        'Test making small changes to see how the output changes',
        'Practice fixing a deliberate typo or error to get comfortable with debugging',
      ],
      suggestedMiniProjects: [
        `Build a small starter project demonstrating the fundamental features of ${skillName}`,
      ],
      expectedOutcome: `You will feel comfortable with the core ideas of ${skillName} and be ready to build more complex features.`,
    };
  }

  if (weekNum === 2) {
    return {
      title: `Week 2: Build Useful Features with ${skillName}`,
      learningObjective: `Take your knowledge of ${skillName} further by connecting it with data storage and handling user requests.`,
      skillToLearn: skillName,
      priority: 'High',
      estimatedDuration: '1 Week (6-8 flexible hours)',
      learningSequence: [
        `Learn how ${skillName} works together with databases and web services`,
        'Understand how to keep user data secure and organize your code into clean folders',
        'Learn common design patterns that make your code easy to read and maintain',
      ],
      practicalExercises: [
        `Build a feature that saves and retrieves data using ${skillName}`,
        'Test how your code handles invalid inputs or slow internet connections',
      ],
      suggestedMiniProjects: [
        `Build a practical mini-application powered by ${skillName} that solves an everyday task`,
      ],
      expectedOutcome: `You will be able to build functional, well-organized features using ${skillName}.`,
    };
  }

  return {
    title: `Week ${weekNum}: Test, Improve, and Package Your ${skillName} Project`,
    learningObjective: `Make your project reliable, fix errors, and learn how developers prepare code for real users.`,
    skillToLearn: skillName,
    priority: 'Medium',
    estimatedDuration: '1 Week (6-8 flexible hours)',
    learningSequence: [
      'Learn how to test your code automatically so you don\'t have to check everything by hand',
      'Understand how to package your application so it runs easily on any computer',
      'Learn simple ways to speed up your code and organize your files neatly',
    ],
    practicalExercises: [
      'Write 3 simple tests to verify your project works under different conditions',
      'Clean up your code, add helpful comments, and test running it in a clean environment',
    ],
    suggestedMiniProjects: [
      `Package and document your ${skillName} application with clear instructions so anyone can run it`,
    ],
    expectedOutcome: `You will know how to write reliable, well-tested code and prepare applications for deployment.`,
  };
};

const runFallbackLearningRoadmap = (resumeData, jobDescription, jobTitle = 'Software Engineer', companyName = 'Company', missingSkills = null, durationWeeks = 4) => {
  const targetSkills = [];
  if (Array.isArray(missingSkills) && missingSkills.length > 0) {
    missingSkills.forEach((ms) => {
      if (ms?.skill) targetSkills.push(ms.skill);
    });
  }

  if (targetSkills.length === 0) {
    const reqs = runFallbackJobParse(jobDescription, jobTitle, companyName);
    const resumeSkills = new Set(extractSkillsFromResume(resumeData));
    for (const s of [...(reqs.requiredSkills || []), ...(reqs.preferredSkills || [])]) {
      const canonical = normalizeSkill(s);
      if (!resumeSkills.has(canonical)) {
        targetSkills.push(s.charAt(0).toUpperCase() + s.slice(1));
      }
    }
  }

  if (targetSkills.length === 0) {
    targetSkills.push('RESTful APIs', 'Docker & Containerization', 'Automated Testing', 'Cloud Deployment');
  }

  const numWeeks = Math.max(2, Math.min(durationWeeks || 4, 8));
  const items = [];

  for (let i = 0; i < numWeeks; i++) {
    const skillName = targetSkills[i % targetSkills.length];
    const weekNum = i + 1;
    const moduleData = getBeginnerFriendlyWeeklyModule(skillName, weekNum, numWeeks, jobTitle, targetSkills);

    items.push({
      weekNumber: weekNum,
      title: moduleData.title,
      learningObjective: moduleData.learningObjective,
      skillToLearn: moduleData.skillToLearn || skillName,
      priority: moduleData.priority || (weekNum <= 2 ? 'High' : 'Medium'),
      estimatedDuration: moduleData.estimatedDuration || '1 Week (6-8 flexible hours)',
      learningSequence: moduleData.learningSequence,
      practicalExercises: moduleData.practicalExercises,
      suggestedMiniProjects: moduleData.suggestedMiniProjects,
      expectedOutcome: moduleData.expectedOutcome,
      completed: false,
      completedAt: null,
    });
  }

  return {
    title: `Personalized Learning Roadmap for ${jobTitle}`,
    targetRole: jobTitle,
    companyName: companyName || null,
    summary: `A friendly, step-by-step ${numWeeks}-week learning guide designed to help you master core skills for ${jobTitle} at your own pace, with hands-on practice every week.`,
    totalWeeks: numWeeks,
    items,
    progressPercentage: 0,
    analysisProvider: 'rule-based-fallback',
  };
};

module.exports = {
  normalizeSkill,
  extractSkillsFromText,
  extractSkillsFromResume,
  runFallbackJobParse,
  runFallbackJobMatch,
  runFallbackCareerRecommendations,
  runFallbackLearningRoadmap,
};
