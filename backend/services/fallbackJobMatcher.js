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

    let title, objective, seq, exercises, miniProjects, outcome;

    if (weekNum === 1) {
      title = `Week 1: Core Fundamentals & Environment Setup with ${skillName}`;
      objective = `Establish a solid foundation in ${skillName} and environment configuration.`;
      seq = [
        `Study ${skillName} official syntax, concepts, and best practice architecture`,
        'Set up local development environment and run sample exercises',
        'Implement error handling and input validation routines',
      ];
      exercises = [
        `Build a standalone module exercising core ${skillName} features`,
        'Write 3 unit tests verifying happy and edge-case execution',
      ];
      miniProjects = [`Standalone CLI utility leveraging ${skillName}`];
      outcome = `Confident practical command of ${skillName} fundamentals.`;
    } else if (weekNum === 2) {
      title = `Week 2: Architectural Patterns & Integration with ${skillName}`;
      objective = `Deep dive into production integration and persistence using ${skillName}.`;
      seq = [
        `Integrate ${skillName} with persistent database and backend API layers`,
        'Implement structured logging and security sanitization',
        'Refactor into modular and reusable service components',
      ];
      exercises = [
        'Implement service class with retry logic and error logging',
        'Benchmark response times and optimize data queries',
      ];
      miniProjects = [`Database-backed microservice implementing ${skillName}`];
      outcome = `Ability to write maintainable, production-ready code with ${skillName}.`;
    } else if (weekNum === 3) {
      title = `Week 3: Automated Testing & Containerization with ${skillName}`;
      objective = 'Containerize application, write automated test suites, and configure CI/CD.';
      seq = [
        `Write comprehensive integration tests for ${skillName} services`,
        'Create a lightweight multi-stage Dockerfile',
        'Configure GitHub Actions pipeline to run tests automatically',
      ];
      exercises = [
        'Achieve 80%+ test code branch coverage',
        'Build and test container image with docker-compose',
      ];
      miniProjects = ['Containerized application with automated GitHub Actions CI'];
      outcome = 'Competence in production testing and automated deployment.';
    } else {
      title = `Week ${weekNum}: Capstone Showcase Project & Interview Readiness`;
      objective = 'Synthesize all skills into a portfolio capstone project.';
      seq = [
        `Design end-to-end full application integrating ${targetSkills.slice(0, 3).join(', ')}`,
        'Write thorough README with architecture diagrams and API docs',
        'Deploy live demo and practice explaining design tradeoffs for interviews',
      ];
      exercises = [
        'Perform code review and optimize performance bottlenecks',
        'Simulate technical interview explanation of system architecture',
      ];
      miniProjects = [`Production ${jobTitle} Capstone Application with live demo and GitHub repository`];
      outcome = 'Job-ready portfolio project showcasing hands-on qualifications.';
    }

    items.push({
      weekNumber: weekNum,
      title,
      learningObjective: objective,
      skillToLearn: skillName,
      priority: weekNum <= 2 ? 'High' : 'Medium',
      estimatedDuration: '1 Week (8-10 hours)',
      learningSequence: seq,
      practicalExercises: exercises,
      suggestedMiniProjects: miniProjects,
      expectedOutcome: outcome,
      completed: false,
      completedAt: null,
    });
  }

  return {
    title: `Personalized Learning Roadmap for ${jobTitle}`,
    targetRole: jobTitle,
    companyName: companyName || null,
    summary: `A structured ${numWeeks}-week learning curriculum engineered to eliminate qualification gaps for ${jobTitle} at ${companyName || 'your target employer'}.`,
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
