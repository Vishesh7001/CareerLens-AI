/**
 * Deterministic Rule-Based Fallback Interview Engine
 * Guarantees zero-downtime mock interview capabilities when FastAPI AI service is offline.
 * Clearly tags output with provider: 'rule-based-fallback'.
 */

// -------------------------------------------------------------
// Role Question Bank (Predefined Roles)
// -------------------------------------------------------------
const FALLBACK_ROLE_QUESTIONS = {
  'Full Stack Developer': [
    {
      topic: 'JavaScript & Basics',
      question: 'Explain the difference between JavaScript and Java, and why JavaScript is primarily used in web development.',
      expectedConcepts: ['interpreted vs compiled', 'dynamically typed', 'browser runtime', 'DOM manipulation', 'event-driven architecture'],
      evaluationCriteria: ['Distinguishes runtime environments and typing systems', 'Explains client-side scripting and DOM integration'],
      sampleAnswer: 'JavaScript is a lightweight, dynamically typed, interpreted scripting language primarily executed in web browsers and Node.js. Java is a statically typed, compiled, object-oriented language executed on the JVM. JavaScript excels in web development because web browsers have native JavaScript engines capable of manipulating the DOM and handling asynchronous, event-driven user interactions.'
    },
    {
      topic: 'Web Fundamentals',
      question: 'What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?',
      expectedConcepts: ['initial load time', 'SEO', 'browser JavaScript execution', 'HTML generated on server', 'user experience'],
      evaluationCriteria: ['Explains where HTML is constructed', 'Compares SEO implications', 'Discusses initial load vs subsequent navigation'],
      sampleAnswer: 'In Client-Side Rendering (CSR), the browser downloads a minimal HTML shell and a JavaScript bundle which dynamically builds the DOM. In Server-Side Rendering (SSR), the server renders the full HTML per request before sending it to the client. CSR provides fast client transitions but slower initial loads and SEO hurdles, while SSR provides faster First Contentful Paint and superior SEO.'
    },
    {
      topic: 'Frontend Frameworks',
      question: 'What are React hooks, and why were they introduced in place of class components?',
      expectedConcepts: ['useState', 'useEffect', 'functional components', 'code reuse', 'this binding', 'lifecycle methods'],
      evaluationCriteria: ['Names core hooks', 'Identifies problems with class components (this binding, lifecycle bloat)', 'Explains state in functional components'],
      sampleAnswer: 'React Hooks allow developers to use state and lifecycle features inside functional components without writing ES6 classes. They eliminate issues with "this" binding, reduce boilerplate, and make it easy to encapsulate and reuse stateful logic across components using custom hooks.'
    },
    {
      topic: 'Node.js Architecture',
      question: 'Explain the Node.js event loop and how Node handles asynchronous I/O despite being single-threaded.',
      expectedConcepts: ['call stack', 'event loop', 'libuv', 'thread pool', 'microtask queue', 'callback queue', 'non-blocking I/O'],
      evaluationCriteria: ['Explains single-threaded JavaScript execution', 'Identifies libuv worker thread pool for system tasks', 'Differentiates microtask and macrotask queues'],
      sampleAnswer: 'Node.js uses a single-threaded event loop for JavaScript execution, backed by libuv for asynchronous I/O. When asynchronous operations occur, they are offloaded to the operating system or worker threads. Completed callbacks enter microtask or macrotask queues and are transferred onto the call stack when it becomes idle.'
    },
    {
      topic: 'Express.js Architecture',
      question: 'What is middleware in Express.js, and how does error-handling middleware differ from regular middleware?',
      expectedConcepts: ['req, res, next', 'middleware chain', '4 parameters (err, req, res, next)', 'request pipeline', 'centralized error handler'],
      evaluationCriteria: ['Explains standard middleware signature', 'Identifies 4 parameters for error-handling middleware', 'Explains calling next(err)'],
      sampleAnswer: 'Middleware functions have access to req, res, and next in the request pipeline. Regular middleware has 3 arguments (req, res, next) and can transform requests or verify auth. Error-handling middleware has 4 arguments (err, req, res, next); Express automatically routes errors triggered via next(err) directly to it.'
    },
    {
      topic: 'RESTful APIs',
      question: 'What is a RESTful API and what are the main HTTP methods used in REST architecture?',
      expectedConcepts: ['stateless', 'resources', 'GET', 'POST', 'PUT/PATCH', 'DELETE', 'HTTP status codes'],
      evaluationCriteria: ['Defines REST constraints', 'Explains CRUD mapping to standard HTTP verbs'],
      sampleAnswer: 'A RESTful API conforms to Representational State Transfer principles where client-server communication is stateless and targets specific resource URIs. Standard HTTP methods include GET (read), POST (create), PUT (replace), PATCH (update), and DELETE (remove).'
    },
    {
      topic: 'Databases',
      question: 'What are the primary differences between SQL (relational) and NoSQL (document-based) databases?',
      expectedConcepts: ['structured schema vs schema-less', 'tables vs documents', 'ACID compliance', 'horizontal vs vertical scaling', 'joins'],
      evaluationCriteria: ['Compares schemas and storage structures', 'Mentions ACID vs eventual consistency', 'Discusses scaling characteristics'],
      sampleAnswer: 'SQL databases are relational with structured schemas and ACID transactions (e.g., PostgreSQL, MySQL). NoSQL databases like MongoDB store flexible JSON-like documents, allow dynamic schemas, and excel at horizontal scaling across clusters.'
    }
  ],

  'Frontend Developer': [
    {
      topic: 'HTML & Accessibility',
      question: 'What is semantic HTML and why is it important for accessibility and SEO?',
      expectedConcepts: ['header, nav, main, article, footer', 'screen readers / ARIA', 'SEO indexing', 'DOM structure'],
      evaluationCriteria: ['Defines semantic tags vs generic divs', 'Mentions screen reader accessibility and search engine indexing'],
      sampleAnswer: 'Semantic HTML uses meaningful markup elements (like <header>, <nav>, <article>, <main>) instead of generic <div> tags, improving accessibility for screen readers and allowing search engine crawlers to better index page hierarchy.'
    },
    {
      topic: 'CSS Layouts',
      question: 'What are the primary differences between CSS Flexbox and CSS Grid, and when should you use each?',
      expectedConcepts: ['one-dimensional vs two-dimensional', 'flex-direction', 'grid rows and columns', 'content-first vs layout-first'],
      evaluationCriteria: ['Specifies 1D for Flexbox and 2D for Grid', 'Provides practical use cases for both'],
      sampleAnswer: 'Flexbox is a one-dimensional layout system designed for linear alignment along a single row or column. Grid is a two-dimensional system that handles rows and columns simultaneously, making it ideal for entire page layouts and complex card grids.'
    },
    {
      topic: 'JavaScript Scoping',
      question: 'Explain the differences between var, let, and const in modern JavaScript.',
      expectedConcepts: ['block scope vs function scope', 'hoisting', 'temporal dead zone', 'reassignment vs mutation'],
      evaluationCriteria: ['Contrasts block scope with function scope', 'Mentions Temporal Dead Zone for let/const'],
      sampleAnswer: 'var is function-scoped and hoisted with undefined. let and const are block-scoped and live in a Temporal Dead Zone until initialized. let allows reassignment, while const prevents reassignment of the variable binding.'
    },
    {
      topic: 'Browser Storage',
      question: 'Compare localStorage, sessionStorage, and cookies. When would you use each?',
      expectedConcepts: ['storage size limit', 'expiration', 'transmitted with HTTP requests', 'tab lifecycle', 'security'],
      evaluationCriteria: ['Compares capacity and persistence across all three', 'Highlights cookies sent with HTTP requests'],
      sampleAnswer: 'localStorage persists 5-10MB until manually cleared. sessionStorage lasts only for the browser tab session. Cookies hold up to 4KB and are automatically attached to HTTP requests, making them ideal for auth tokens with HttpOnly flags.'
    },
    {
      topic: 'Web Performance',
      question: 'What techniques can you use to improve Core Web Vitals in a modern React application?',
      expectedConcepts: ['Largest Contentful Paint (LCP)', 'Cumulative Layout Shift (CLS)', 'code splitting / React.lazy', 'image optimization', 'font-display'],
      evaluationCriteria: ['References Core Web Vitals', 'Details code splitting and asset compression'],
      sampleAnswer: 'Techniques include code splitting with React.lazy, lazy loading non-critical images in WebP format, preloading key assets, reserving layout dimensions to avoid CLS, and avoiding main-thread blocking JavaScript tasks.'
    }
  ],

  'Backend Developer': [
    {
      topic: 'HTTP Protocol',
      question: 'Explain the difference between HTTP and HTTPS, and how the SSL/TLS handshake establishes a secure connection.',
      expectedConcepts: ['port 80 vs 443', 'TLS/SSL certificate', 'asymmetric encryption', 'symmetric session key', 'data integrity'],
      evaluationCriteria: ['Identifies TLS encryption', 'Explains asymmetric handshake creating symmetric session keys'],
      sampleAnswer: 'HTTP sends plaintext data over port 80. HTTPS encrypts traffic using TLS over port 443. The TLS handshake verifies the server certificate and uses asymmetric cryptography to securely negotiate a shared symmetric key for session payload encryption.'
    },
    {
      topic: 'Database Transactions',
      question: 'What are database transactions, and what does the ACID acronym stand for?',
      expectedConcepts: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'commit / rollback', 'all-or-nothing'],
      evaluationCriteria: ['Defines all 4 ACID properties accurately', 'Explains rollback mechanism on error'],
      sampleAnswer: 'A transaction is an atomic sequence of database operations. ACID stands for Atomicity (all-or-nothing execution), Consistency (data invariants preserved), Isolation (concurrent operations do not interfere), and Durability (committed changes persist after crashes).'
    },
    {
      topic: 'Message Queues',
      question: 'Why would you introduce a message broker like RabbitMQ or Redis BullMQ into a backend architecture?',
      expectedConcepts: ['asynchronous processing', 'decoupling services', 'task queues', 'load leveling', 'horizontal worker scaling'],
      evaluationCriteria: ['Identifies offloading heavy work from HTTP threads', 'Explains load smoothing during traffic spikes'],
      sampleAnswer: 'Message brokers decouple producer and consumer services, enabling background processing of slow tasks (e.g. emails, PDF generation). This keeps HTTP responses fast, prevents server overload via load leveling, and enables independent worker scaling.'
    },
    {
      topic: 'Database Scalability',
      question: 'What is the difference between database replication and database sharding?',
      expectedConcepts: ['read replicas', 'horizontal partitioning (sharding)', 'read scaling vs write scaling', 'shard key', 'failover'],
      evaluationCriteria: ['Contrasts data duplication with horizontal partitioning', 'Relates replicas to reads and sharding to writes/storage'],
      sampleAnswer: 'Replication copies data across primary and replica nodes to scale read throughput and ensure high availability. Sharding horizontally partitions data across separate database nodes using a shard key to scale write throughput and total storage capacity.'
    }
  ],

  'Software Developer': [
    {
      topic: 'OOP Principles',
      question: 'Explain the four core principles of Object-Oriented Programming (OOP) with real-world analogies.',
      expectedConcepts: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'],
      evaluationCriteria: ['Defines all 4 pillars accurately', 'Provides clear analogies or code concepts'],
      sampleAnswer: 'The 4 pillars are Encapsulation (bundling data and methods with private access), Abstraction (hiding implementation complexity behind simple interfaces), Inheritance (reusing parent class attributes in child classes), and Polymorphism (allowing different classes to implement the same interface uniquely).'
    },
    {
      topic: 'Data Structures',
      question: 'What is the difference between an Array and a Linked List in terms of memory layout and time complexity?',
      expectedConcepts: ['contiguous vs non-contiguous memory', 'random access O(1) vs sequential O(N)', 'insertion / deletion', 'memory pointer overhead'],
      evaluationCriteria: ['Contrasts contiguous memory with node pointers', 'Compares random access and insertion complexities'],
      sampleAnswer: 'Arrays store data in contiguous memory blocks allowing instant O(1) random lookup by index, but require O(N) element shifts on insertion. Linked lists store nodes with pointers anywhere in memory, requiring O(N) sequential search but allowing fast O(1) insertions at known node locations.'
    },
    {
      topic: 'Algorithms & Complexity',
      question: 'What is Big O notation, and what is the difference in scalability between O(N), O(N log N), and O(N^2)?',
      expectedConcepts: ['upper bound complexity', 'linear O(N)', 'linearithmic O(N log N)', 'quadratic O(N^2)', 'worst-case analysis'],
      evaluationCriteria: ['Defines asymptotic worst-case growth', 'Gives examples for each complexity tier'],
      sampleAnswer: 'Big O notation describes an algorithm’s execution time growth as input size N scales. O(N) is linear (single pass over an array). O(N log N) is linearithmic (optimal sorts like MergeSort). O(N^2) is quadratic (nested loops), which degrades rapidly as N increases.'
    },
    {
      topic: 'Version Control',
      question: 'Explain the difference between "git merge" and "git rebase". When should you avoid using rebase?',
      expectedConcepts: ['merge commit', 'linear history', 'rewriting history', 'never rebase public shared branches'],
      evaluationCriteria: ['Explains merge commit preservation vs linear history reapplication', 'Warns against rebasing public branches'],
      sampleAnswer: 'git merge creates a merge commit preserving exact branch history. git rebase reapplies commits on top of another branch creating a clean linear history. Never rebase shared public branches because it rewrites commit hashes, causing conflict for collaborators.'
    }
  ]
};

// -------------------------------------------------------------
// HR & Behavioral Question Bank
// -------------------------------------------------------------
const FALLBACK_HR_QUESTIONS = [
  {
    topic: 'Self Introduction',
    question: 'Tell me about yourself. Walk me through your background, technical interests, and why you are interested in this career path.',
    expectedConcepts: ['educational background', 'key technical projects or skills', 'passion for problem-solving', 'alignment with company/role'],
    evaluationCriteria: ['Concise professional summary', 'Highlights hands-on projects and relevant skills', 'Articulates clear career motivation'],
    sampleAnswer: 'I completed my degree in Computer Science, where I built a solid foundation in software engineering, data structures, and web technologies. I discovered a passion for building full-stack applications and solving real-world challenges with clean code. For example, I developed an e-commerce platform using React and Node.js. I am eager to apply these skills and grow within a collaborative engineering team.'
  },
  {
    topic: 'Strengths & Weaknesses',
    question: 'What do you consider your greatest technical strength, and what is one area you are actively working to improve?',
    expectedConcepts: ['specific strength with evidence', 'genuine weakness', 'active mitigation / learning steps'],
    evaluationCriteria: ['Provides concrete strength backed by experience', 'Shares honest, non-cliché weakness', 'Demonstrates self-awareness and proactive learning'],
    sampleAnswer: 'My greatest strength is my ability to quickly break down complex technical problems and learn new frameworks autonomously. An area I am actively improving is balancing perfectionism with delivery timelines: I now use an iterative prototype-first approach to ship working code before optimizing details.'
  },
  {
    topic: 'Teamwork & Conflict',
    question: 'Describe a time when you worked on a team project and had a disagreement with a team member about a technical approach. How did you resolve it?',
    expectedConcepts: ['Situation context', 'Task objective', 'Action taken (data-driven discussion, compromise)', 'Positive Result'],
    evaluationCriteria: ['Follows STAR structure', 'Demonstrates active listening and objective communication', 'Prioritizes project goals over ego'],
    sampleAnswer: 'Situation: During our capstone project, our team debated between SQL and NoSQL. Task: We needed to decide quickly to stay on schedule. Action: I proposed building two quick prototypes and benchmarking query response times for our specific document schema. Result: The benchmarks made the decision clear, we adopted a hybrid model, and delivered the project on time.'
  },
  {
    topic: 'Overcoming Obstacles',
    question: 'Tell me about a challenging bug or technical obstacle you encountered in a project. How did you diagnose and solve it?',
    expectedConcepts: ['Situation & problem', 'Investigation & debugging methodology', 'Solution implementation', 'Key takeaway'],
    evaluationCriteria: ['Uses structured debugging approach (logging, isolation)', 'Explains technical resolution clearly', 'Reflects on preventive lessons learned'],
    sampleAnswer: 'Situation: An API on our student project experienced intermittent authentication timeouts during high traffic. Task: Isolate and resolve the bottleneck. Action: I checked server logs, discovered unindexed database queries in the auth middleware, added indexes in MongoDB, and introduced a Redis caching layer. Result: API latency dropped from 1,200ms to 45ms and timeouts vanished.'
  },
  {
    topic: 'Time Management',
    question: 'Describe a situation where you had multiple competing deadlines or an unexpected project change. How did you prioritize your work?',
    expectedConcepts: ['Situation with tight deadlines', 'Prioritization criteria (impact vs urgency)', 'Communication with stakeholders', 'Outcome'],
    evaluationCriteria: ['Explains prioritization matrix or clear decision logic', 'Highlights proactive communication', 'Delivered core requirements successfully'],
    sampleAnswer: 'Situation: Last semester I had a final database project deliverable due the same week as mid-term exams. Task: Maintain academic excellence across both. Action: I broke deliverables into daily milestones, prioritized tasks by deadline urgency, and communicated transparently with team members. Result: We submitted the project on time and achieved an "A" grade in both subjects.'
  }
];

// -------------------------------------------------------------
// Helper Tokenizer
// -------------------------------------------------------------
function extractKeywords(text) {
  if (!text) return [];
  const words = (text.toLowerCase().match(/[a-z0-9_\-\.#+]{2,}/g) || []);
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'were',
    'will', 'can', 'has', 'have', 'had', 'which', 'what', 'when', 'where', 'how',
    'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
    'of', 'in', 'on', 'at', 'by', 'an', 'as', 'is', 'it', 'or', 'be', 'so'
  ]);
  return words.filter((w) => !stopWords.has(w));
}

function matchConcept(concept, textLower) {
  const cLower = concept.toLowerCase();
  if (textLower.includes(cLower)) return true;

  const tokens = extractKeywords(cLower);
  if (!tokens.length) return false;
  const matches = tokens.filter((t) => textLower.includes(t)).length;
  return matches / tokens.length >= 0.6;
}

// -------------------------------------------------------------
// Fallback Question Generation
// -------------------------------------------------------------
function runFallbackQuestionGeneration({
  role,
  customRole,
  interviewType = 'Technical Interview',
  difficulty = 'Intermediate',
  totalQuestions = 5,
  resumeData,
  jobDescription,
}) {
  const effectiveRole = role === 'Custom Role' && customRole ? customRole : role;
  const totalQ = Math.min(Math.max(Number(totalQuestions) || 5, 1), 15);

  let techCount = totalQ;
  let hrCount = 0;
  if (interviewType === 'HR Interview') {
    techCount = 0;
    hrCount = totalQ;
  } else if (interviewType === 'Mixed Interview') {
    techCount = Math.ceil(totalQ * 0.6);
    hrCount = totalQ - techCount;
  }

  const selected = [];
  const seenTexts = new Set();

  // Find best question pool for role
  let rolePool = FALLBACK_ROLE_QUESTIONS[effectiveRole] || null;
  if (!rolePool) {
    const roleLower = effectiveRole.toLowerCase();
    if (roleLower.includes('front') || roleLower.includes('react')) {
      rolePool = FALLBACK_ROLE_QUESTIONS['Frontend Developer'];
    } else if (roleLower.includes('back') || roleLower.includes('node') || roleLower.includes('api')) {
      rolePool = FALLBACK_ROLE_QUESTIONS['Backend Developer'];
    } else if (roleLower.includes('full') || roleLower.includes('stack')) {
      rolePool = FALLBACK_ROLE_QUESTIONS['Full Stack Developer'];
    } else {
      rolePool = FALLBACK_ROLE_QUESTIONS['Software Developer'];
    }
  }

  // Pick tech questions
  if (techCount > 0) {
    for (const q of rolePool) {
      if (selected.filter((item) => item.category === 'technical').length >= techCount) break;
      if (!seenTexts.has(q.question)) {
        seenTexts.add(q.question);
        selected.push({
          questionText: q.question,
          category: 'technical',
          difficulty: difficulty.toLowerCase(),
          topic: q.topic || 'Technical',
          expectedConcepts: q.expectedConcepts || [],
          evaluationCriteria: q.evaluationCriteria || [],
          sampleAnswer: q.sampleAnswer || '',
        });
      }
    }
  }

  // Pick HR questions
  if (hrCount > 0) {
    for (const q of FALLBACK_HR_QUESTIONS) {
      if (selected.filter((item) => item.category === 'hr').length >= hrCount) break;
      if (!seenTexts.has(q.question)) {
        seenTexts.add(q.question);
        selected.push({
          questionText: q.question,
          category: 'hr',
          difficulty: difficulty.toLowerCase(),
          topic: q.topic || 'HR / Behavioral',
          expectedConcepts: q.expectedConcepts || [],
          evaluationCriteria: q.evaluationCriteria || [],
          sampleAnswer: q.sampleAnswer || '',
        });
      }
    }
  }

  // If still need questions to reach totalQ, fill from general questions
  if (selected.length < totalQ) {
    const allRemaining = [...(FALLBACK_ROLE_QUESTIONS['Software Developer'] || []), ...FALLBACK_HR_QUESTIONS];
    for (const q of allRemaining) {
      if (selected.length >= totalQ) break;
      if (!seenTexts.has(q.question)) {
        seenTexts.add(q.question);
        const cat = q.topic.includes('Introduction') || q.topic.includes('Strengths') ? 'hr' : 'technical';
        selected.push({
          questionText: q.question,
          category: cat,
          difficulty: difficulty.toLowerCase(),
          topic: q.topic || 'General',
          expectedConcepts: q.expectedConcepts || [],
          evaluationCriteria: q.evaluationCriteria || [],
          sampleAnswer: q.sampleAnswer || '',
        });
      }
    }
  }

  const questions = selected.slice(0, totalQ).map((item, idx) => ({
    questionId: `q_${idx + 1}`,
    questionText: item.questionText,
    category: item.category,
    difficulty: item.difficulty,
    topic: item.topic,
    order: idx + 1,
    expectedConcepts: item.expectedConcepts,
    evaluationCriteria: item.evaluationCriteria,
    sampleAnswer: item.sampleAnswer,
    status: 'pending',
  }));

  return {
    success: true,
    role: effectiveRole,
    interviewType,
    difficulty,
    totalQuestions: questions.length,
    questions,
    provider: 'rule-based-fallback',
  };
}

// -------------------------------------------------------------
// Fallback Answer Evaluation
// -------------------------------------------------------------
function runFallbackAnswerEvaluation({
  questionId,
  questionText,
  category = 'technical',
  difficulty = 'intermediate',
  topic = 'General',
  expectedConcepts = [],
  evaluationCriteria = [],
  sampleAnswer = '',
  answer = '',
  role = 'Software Developer',
}) {
  const cleanAnswer = (answer || '').trim();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const answerLower = cleanAnswer.toLowerCase();

  // 1. Empty or near-empty answer
  if (wordCount < 3) {
    return {
      success: true,
      overallScore: 0,
      performanceLabel: 'Needs Improvement',
      criterionScores: {
        technicalAccuracy: 0,
        relevance: 0,
        completeness: 0,
        clarity: 0,
      },
      strengths: [],
      weaknesses: ['No answer was provided or the answer was too brief to evaluate.'],
      missingConcepts: expectedConcepts.length ? expectedConcepts : ['Core explanation'],
      incorrectConcepts: [],
      improvementSuggestions: [
        'Review the core technical concepts of this topic.',
        'Take time to structure your response with definitions and real-world examples.',
        'Aim for at least 3-4 complete sentences to thoroughly explain your thought process.',
      ],
      improvedSampleAnswer: sampleAnswer || 'Provide a structured, comprehensive explanation covering the core concepts.',
      explanation: 'The answer submitted was empty or insufficient to demonstrate understanding.',
      provider: 'rule-based-fallback',
      evaluatedAt: new Date(),
    };
  }

  // 2. Concept matching
  const matchedConcepts = [];
  const missingConcepts = [];
  for (const concept of expectedConcepts) {
    if (matchConcept(concept, answerLower)) {
      matchedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  }

  const totalExpected = Math.max(1, expectedConcepts.length);
  const conceptRatio = matchedConcepts.length / totalExpected;

  const strengths = [];
  const weaknesses = [];
  const improvementSuggestions = [];

  let overallScore = 50;
  let criterionScores = {};

  if (category === 'technical') {
    // Technical weights: Accuracy 40%, Relevance 25%, Completeness 20%, Clarity 15%
    let baseAccuracy = Math.round(conceptRatio * 70);
    if (wordCount >= 40) baseAccuracy += 20;
    else if (wordCount >= 20) baseAccuracy += 10;
    const accuracyScore = Math.min(100, Math.max(20, baseAccuracy));

    const qTokens = extractKeywords(questionText);
    const qMatches = qTokens.filter((t) => answerLower.includes(t)).length;
    const relevanceScore = Math.min(100, Math.max(30, Math.round((qMatches / Math.max(1, qTokens.length)) * 60) + 40));

    const completenessScore = Math.min(100, Math.max(25, Math.round(conceptRatio * 50) + Math.min(50, wordCount * 2)));

    const sentences = cleanAnswer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgLen = wordCount / Math.max(1, sentences.length);
    let clarityScore = 85;
    if (avgLen > 40) clarityScore -= 20;
    else if (avgLen < 4) clarityScore -= 15;
    if (wordCount >= 25 && sentences.length >= 2) clarityScore = Math.min(100, clarityScore + 10);

    overallScore = Math.round(
      accuracyScore * 0.40 +
      relevanceScore * 0.25 +
      completenessScore * 0.20 +
      clarityScore * 0.15
    );
    overallScore = Math.min(100, Math.max(10, overallScore));

    criterionScores = {
      technicalAccuracy: accuracyScore,
      relevance: relevanceScore,
      completeness: completenessScore,
      clarity: clarityScore,
    };

    if (matchedConcepts.length) {
      strengths.push(`Demonstrated solid familiarity with: ${matchedConcepts.slice(0, 3).join(', ')}.`);
    }
    if (wordCount >= 35) {
      strengths.push('Provided detailed technical context rather than just a one-line definition.');
    }

    if (missingConcepts.length) {
      weaknesses.push(`Omitted key technical concepts: ${missingConcepts.slice(0, 3).join(', ')}.`);
      improvementSuggestions.push(`Incorporate discussions around ${missingConcepts[0]} to showcase deeper architectural understanding.`);
    }
    if (wordCount < 25) {
      weaknesses.push('Response is somewhat brief; flesh out technical reasoning with examples.');
      improvementSuggestions.push('Illustrate your answer with a concrete code snippet or system design scenario.');
    }
    improvementSuggestions.push('Structure answers with: 1) High-level definition, 2) Mechanism/Workflow, 3) Real-world use case or trade-off.');
  } else {
    // HR weights: Relevance 25%, Clarity 25%, Completeness 20%, Structure 15%, Examples 15%
    const relevanceScore = Math.min(100, Math.max(40, 50 + Math.round(conceptRatio * 50)));
    const clarityScore = Math.min(100, Math.max(45, 60 + Math.min(40, wordCount)));
    const completenessScore = Math.min(100, Math.max(30, Math.round(conceptRatio * 40) + Math.min(60, wordCount)));

    const hasStar = ['situation', 'task', 'action', 'result', 'when i', 'during my', 'we decided'].some((w) => answerLower.includes(w));
    const structureScore = hasStar ? 90 : 65;

    const hasExample = ['for example', 'for instance', 'such as', 'project', 'team', 'colleague'].some((w) => answerLower.includes(w));
    const examplesScore = hasExample ? 90 : 60;

    overallScore = Math.round(
      relevanceScore * 0.25 +
      clarityScore * 0.25 +
      completenessScore * 0.20 +
      structureScore * 0.15 +
      examplesScore * 0.15
    );
    overallScore = Math.min(100, Math.max(15, overallScore));

    criterionScores = {
      relevance: relevanceScore,
      clarity: clarityScore,
      completeness: completenessScore,
      structureAndCommunication: structureScore,
      examplesAndSpecificity: examplesScore,
    };

    if (hasStar) strengths.push('Structured the behavioral scenario effectively following a logical progression.');
    if (hasExample) strengths.push('Grounded the response in a concrete real-world team or project experience.');
    if (!strengths.length) strengths.push('Maintained a polite and professional tone.');

    if (!hasStar) {
      weaknesses.push('Did not explicitly use the STAR framework (Situation, Task, Action, Result).');
      improvementSuggestions.push('Adopt the STAR method: state the Situation & Task, detail your personal Actions, and highlight measurable Results.');
    }
    if (missingConcepts.length) {
      weaknesses.push(`Could more directly touch upon: ${missingConcepts.slice(0, 2).join(', ')}.`);
    }
    improvementSuggestions.push('Quantify outcomes where possible (e.g., "reduced latency by 30%", "completed 2 weeks early").');
  }

  let performanceLabel = 'Needs Improvement';
  let explanation = 'Response lacks key concepts or detail needed for a competitive interview.';
  if (overallScore >= 85) {
    performanceLabel = 'Excellent';
    explanation = 'Outstanding answer showing strong conceptual grasp and clear articulation.';
  } else if (overallScore >= 70) {
    performanceLabel = 'Good';
    explanation = 'Good answer covering the main principles; minor additions will make it exceptional.';
  } else if (overallScore >= 50) {
    performanceLabel = 'Average';
    explanation = 'Adequate response, but lacks important technical depth or structured examples.';
  }

  return {
    success: true,
    overallScore,
    performanceLabel,
    criterionScores,
    strengths,
    weaknesses,
    missingConcepts,
    incorrectConcepts: [],
    improvementSuggestions,
    improvedSampleAnswer: sampleAnswer || 'Provide a structured, comprehensive answer with clear definitions and specific trade-offs.',
    explanation,
    provider: 'rule-based-fallback',
    evaluatedAt: new Date(),
  };
}

// -------------------------------------------------------------
// Fallback Report Generation
// -------------------------------------------------------------
function runFallbackReportGeneration({ role, interviewType, difficulty, questions }) {
  const totalQ = questions.length;
  const answeredQ = questions.filter((q) => q.status === 'answered' && q.evaluation);
  const answeredCount = answeredQ.length;
  const skippedCount = totalQ - answeredCount;

  if (answeredCount === 0) {
    return {
      success: true,
      overallScore: 0,
      performanceLabel: 'Needs Improvement',
      completionPercentage: 0,
      totalQuestions: totalQ,
      answeredQuestions: 0,
      skippedQuestions: skippedCount,
      performanceBreakdown: {},
      strengths: ['Session initiated.'],
      weaknesses: ['No questions were answered during this session.'],
      recommendations: ['Dedicate 20-30 minutes of uninterrupted time to complete a full mock interview session.'],
      readinessAssessment: 'Incomplete session. To assess interview readiness, complete all questions in the mock interview.',
      provider: 'rule-based-fallback',
    };
  }

  const scores = answeredQ.map((q) => q.evaluation.overallScore || q.evaluation.overall_score || 0);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const completionPercentage = Math.round((answeredCount / totalQ) * 100);

  // Performance breakdown aggregation across answered questions
  const breakdownSums = {};
  const breakdownCounts = {};

  const normalizeCriterionKey = (key) => {
    const k = String(key || '').trim();
    const map = {
      technical_accuracy: 'technicalAccuracy',
      technicalAccuracy: 'technicalAccuracy',
      'technical accuracy': 'technicalAccuracy',
      relevance: 'relevance',
      completeness: 'completeness',
      clarity: 'clarity',
      structure_and_communication: 'structureAndCommunication',
      structureAndCommunication: 'structureAndCommunication',
      structure: 'structureAndCommunication',
      examples_and_specificity: 'examplesAndSpecificity',
      examplesAndSpecificity: 'examplesAndSpecificity',
      examples: 'examplesAndSpecificity',
    };
    return map[k] || k;
  };

  for (const q of answeredQ) {
    const cs = q.evaluation.criterionScores || q.evaluation.criterion_scores || {};
    const entries = cs instanceof Map
      ? Array.from(cs.entries())
      : typeof cs === 'object' && cs !== null
        ? Object.entries(cs)
        : [];

    for (const [crit, val] of entries) {
      if (val === null || val === undefined || isNaN(val)) continue;
      const num = Number(val);
      const canonicalKey = normalizeCriterionKey(crit);
      breakdownSums[canonicalKey] = (breakdownSums[canonicalKey] || 0) + num;
      breakdownCounts[canonicalKey] = (breakdownCounts[canonicalKey] || 0) + 1;
    }
  }

  const performanceBreakdown = {};
  for (const crit of Object.keys(breakdownSums)) {
    const count = breakdownCounts[crit] || 1;
    performanceBreakdown[crit] = Math.round(breakdownSums[crit] / count);
  }

  const allStrengths = [];
  const allWeaknesses = [];
  for (const q of answeredQ) {
    if (Array.isArray(q.evaluation.strengths)) allStrengths.push(...q.evaluation.strengths);
    if (Array.isArray(q.evaluation.weaknesses)) allWeaknesses.push(...q.evaluation.weaknesses);
  }

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 4);

  let performanceLabel = 'Needs Improvement';
  let readinessAssessment = `Foundational review recommended. Dedicate focused time to study the fundamental concepts and review sample answers before your next mock interview.`;
  if (overallScore >= 85) {
    performanceLabel = 'Excellent';
    readinessAssessment = `Outstanding performance! You demonstrated impressive technical depth and clear articulation for a ${difficulty} ${role} level. You are well-positioned for real-world interviews.`;
  } else if (overallScore >= 70) {
    performanceLabel = 'Good';
    readinessAssessment = `Solid foundation! You showed strong understanding of key concepts for a ${role} role. Focus on deepening explanations of system trade-offs and structuring answers to reach top-tier interview readiness.`;
  } else if (overallScore >= 50) {
    performanceLabel = 'Average';
    readinessAssessment = `Promising potential, but gaps in technical specificity and structure were noted. Revise missing concepts and practice answering out loud using structured frameworks before live technical screens.`;
  }

  const recommendations = [
    `Review core technical concepts and trade-offs for ${role}.`,
    'Practice using the STAR methodology (Situation, Task, Action, Result) for all scenario and HR questions.',
    'Aim to structure technical explanations into: Definition, Mechanism, and Practical Example.',
    'Review the personalized learning roadmap to address flagged concept gaps.',
  ];

  return {
    success: true,
    overallScore,
    performanceLabel,
    completionPercentage,
    totalQuestions: totalQ,
    answeredQuestions: answeredCount,
    skippedQuestions: skippedCount,
    performanceBreakdown,
    strengths: uniqueStrengths.length ? uniqueStrengths : ['Demonstrated broad familiarity across interview domains.'],
    weaknesses: uniqueWeaknesses.length ? uniqueWeaknesses : ['Expand on architectural trade-offs in complex questions.'],
    recommendations,
    readinessAssessment,
    provider: 'rule-based-fallback',
  };
}

module.exports = {
  runFallbackQuestionGeneration,
  runFallbackAnswerEvaluation,
  runFallbackReportGeneration,
};
