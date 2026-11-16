"""
Comprehensive Mock Interview Question Bank
Covers 11 predefined technical roles across Beginner, Intermediate, and Advanced tiers,
plus extensive HR & Behavioral questions with expected concepts and evaluation rubrics.
"""

from typing import Dict, List, Any

# -------------------------------------------------------------------------
# Technical Questions By Role and Difficulty
# -------------------------------------------------------------------------
ROLE_QUESTION_BANK: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "Full Stack Developer": {
        "Beginner": [
            {
                "topic": "JavaScript & Basics",
                "question": "Explain the difference between JavaScript and Java, and why JavaScript is primarily used in web development.",
                "expected_concepts": ["interpreted vs compiled", "dynamically typed vs statically typed", "browser runtime", "DOM manipulation", "event-driven architecture"],
                "evaluation_criteria": ["Distinguishes execution environment and typing systems", "Explains client-side scripting and browser integration", "Mentions event-driven nature"],
                "sample_answer": "JavaScript is a lightweight, dynamically typed, interpreted scripting language primarily executed in web browsers and Node.js environments. Java is a statically typed, compiled, object-oriented language executed on the JVM. JavaScript excels in web development because web browsers have native JavaScript engines (like V8) capable of manipulating the Document Object Model (DOM) and handling asynchronous, event-driven user interactions."
            },
            {
                "topic": "Web Fundamentals",
                "question": "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
                "expected_concepts": ["initial load time", "SEO", "browser JavaScript execution", "HTML generated on server", "user experience"],
                "evaluation_criteria": ["Explains where HTML is constructed", "Compares SEO implications", "Discusses initial page load vs subsequent transitions"],
                "sample_answer": "Client-Side Rendering (CSR) delivers a minimal HTML shell with a bundled JavaScript file; the browser executes the JavaScript to build the DOM dynamically. In Server-Side Rendering (SSR), the server renders the complete HTML for each page on demand before sending it to the client. CSR offers snappy subsequent page transitions but slower initial loads and SEO challenges, whereas SSR provides faster First Contentful Paint (FCP) and superior SEO."
            },
            {
                "topic": "Frontend Frameworks",
                "question": "What are React hooks, and why were they introduced in place of class components?",
                "expected_concepts": ["useState", "useEffect", "functional components", "code reuse", "this binding", "lifecycle methods"],
                "evaluation_criteria": ["Names core hooks like useState and useEffect", "Identifies problems with class components (this binding, verbose lifecycle)", "Explains state and lifecycle in functional components"],
                "sample_answer": "React Hooks are functions introduced in React 16.8 that allow developers to use state and lifecycle features inside functional components without writing ES6 classes. They eliminate issues with 'this' binding, reduce boilerplate, and make it easy to encapsulate and reuse stateful logic across multiple components using custom hooks."
            },
            {
                "topic": "RESTful APIs",
                "question": "What is a RESTful API and what are the main HTTP methods used in REST architecture?",
                "expected_concepts": ["stateless", "resources", "GET", "POST", "PUT/PATCH", "DELETE", "HTTP status codes"],
                "evaluation_criteria": ["Defines REST architectural constraints (statelessness)", "Explains CRUD mapping to GET, POST, PUT/PATCH, DELETE", "Mentions standard status codes"],
                "sample_answer": "A RESTful API conforms to Representational State Transfer principles, where client-server communication is stateless and interactions occur over standard HTTP protocols targeting specific resource URIs. The standard HTTP methods include GET (retrieve resource), POST (create resource), PUT (replace resource), PATCH (partial update), and DELETE (remove resource)."
            },
            {
                "topic": "Database Basics",
                "question": "What are the primary differences between SQL (relational) and NoSQL (document-based) databases?",
                "expected_concepts": ["structured schema vs schema-less", "tables/rows vs documents/collections", "ACID compliance", "horizontal vs vertical scaling", "joins"],
                "evaluation_criteria": ["Compares table structure with flexible document models", "Mentions ACID transactions vs eventual consistency", "Discusses scaling characteristics"],
                "sample_answer": "SQL databases (like PostgreSQL, MySQL) are relational, use structured schemas with tables, rows, and foreign key relations, and prioritize ACID compliance. NoSQL databases (like MongoDB) are non-relational, store flexible JSON-like documents, allow dynamic schemas, and excel at horizontal scaling across distributed clusters."
            }
        ],
        "Intermediate": [
            {
                "topic": "Node.js Architecture",
                "question": "Explain the Node.js event loop and how Node handles asynchronous I/O despite being single-threaded.",
                "expected_concepts": ["call stack", "event loop", "libuv", "thread pool", "microtask queue", "callback queue", "non-blocking I/O"],
                "evaluation_criteria": ["Explains single-threaded JavaScript execution", "Identifies libuv and worker thread pool for system tasks", "Differentiates macrotask and microtask queues"],
                "sample_answer": "Node.js operates on a single-threaded event loop for executing JavaScript code, backed by the C++ libuv library for asynchronous I/O. When an asynchronous operation (like a file read, network request, or DB query) is initiated, it is delegated to the operating system kernel or libuv's worker thread pool. When the operation completes, its callback is placed in the task queue (microtask queue for Promises/process.nextTick, or macrotask queue for timers/I/O). The event loop continuously inspects the call stack, moving queued callbacks to the stack when it becomes empty."
            },
            {
                "topic": "Express.js Architecture",
                "question": "What is middleware in Express.js, and how does error-handling middleware differ from regular middleware?",
                "expected_concepts": ["req, res, next", "middleware chain", "4 parameters (err, req, res, next)", "request pipeline", "centralized error handler"],
                "evaluation_criteria": ["Explains the signature and execution of standard middleware", "Identifies four parameters for error-handling middleware", "Explains calling next(err)"],
                "sample_answer": "Middleware in Express.js refers to functions that execute in the request-response lifecycle with access to the req, res, and next callback. Middleware can parse request bodies, verify authentication tokens, log requests, or modify headers. Error-handling middleware is distinguished by having four parameters: (err, req, res, next). Express recognizes this four-argument signature and automatically bypasses normal middleware to route errors triggered via next(err) or thrown exceptions to it."
            },
            {
                "topic": "State Management & React Performance",
                "question": "How does React's Virtual DOM work, and how can you prevent unnecessary component re-renders?",
                "expected_concepts": ["virtual DOM", "reconciliation / diffing algorithm", "React.memo", "useMemo", "useCallback", "shallow comparison"],
                "evaluation_criteria": ["Explains in-memory representation and diffing against real DOM", "Names React.memo, useMemo, or useCallback", "Explains prop change triggers"],
                "sample_answer": "The Virtual DOM is a lightweight in-memory JavaScript representation of the actual DOM. When state or props change, React creates a new Virtual DOM tree, diffs it against the previous tree using its reconciliation algorithm, and calculates the minimal batch of mutations required on the real DOM. To avoid unnecessary re-renders, developers can wrap functional components in React.memo (for shallow prop comparison), cache expensive computations with useMemo, and preserve function references across renders with useCallback."
            },
            {
                "topic": "Authentication & Security",
                "question": "Compare Session-based authentication with Token-based (JWT) authentication in modern web applications. What are the security trade-offs?",
                "expected_concepts": ["cookies", "JWT", "stateless vs stateful", "HTTP-only cookies", "XSS", "CSRF", "token expiration"],
                "evaluation_criteria": ["Compares server memory storage vs client-side signed tokens", "Addresses XSS mitigation via HttpOnly cookies", "Explains token invalidation challenges"],
                "sample_answer": "Session-based auth is stateful: the server stores session data in memory or Redis and transmits a session ID cookie to the client. Token-based auth (JWT) is stateless: the server cryptographically signs a JSON payload containing user claims and sends it to the client, requiring no server session lookup on subsequent requests. While JWTs scale well across distributed microservices, revoking an active JWT before expiration is difficult without a token blacklist. For security, JWTs should be stored in HTTP-only, secure, SameSite cookies to protect against Cross-Site Scripting (XSS) attacks."
            },
            {
                "topic": "Database Optimization",
                "question": "How do database indexes work in MongoDB or SQL, and what are the trade-offs of adding too many indexes?",
                "expected_concepts": ["B-tree / B+tree", "query performance", "read vs write trade-off", "memory/disk overhead", "index scan vs collection scan"],
                "evaluation_criteria": ["Explains how indexes prevent full collection/table scans", "Identifies write latency degradation on inserts/updates", "Mentions storage and RAM consumption"],
                "sample_answer": "Database indexes are specialized data structures (typically B-Trees) that maintain an ordered reference to document or row locations based on specified fields. Instead of executing an expensive full collection or table scan (O(N)), the database performs a fast binary search or tree traversal (O(log N)). The trade-off is that every index consumes memory (RAM) and disk space, and degrades write performance (INSERT, UPDATE, DELETE) because every index must be synchronously updated whenever data changes."
            }
        ],
        "Advanced": [
            {
                "topic": "Distributed Systems & Microservices",
                "question": "How do you handle distributed transactions and maintain data consistency across multiple microservices without 2-phase commit?",
                "expected_concepts": ["Saga pattern", "choreography vs orchestration", "compensating transactions", "eventual consistency", "idempotency", "outbox pattern"],
                "evaluation_criteria": ["Explains Saga pattern and compensating transactions", "Contrasts choreography and orchestration", "Highlights eventual consistency and idempotency"],
                "sample_answer": "In distributed microservice architectures where Two-Phase Commit (2PC) creates blocking and single points of failure, the Saga pattern is the gold standard for maintaining consistency. A Saga breaks a distributed transaction into a series of local transactions coordinated through events or an orchestrator. If one local transaction fails, the Saga executes compensating transactions in reverse order to roll back prior mutations. The Transactional Outbox pattern guarantees reliable event publishing, and consumers implement idempotency keys to ensure at-least-once message processing without duplicate state mutations."
            },
            {
                "topic": "Web Application Security",
                "question": "Describe Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). How do you safeguard a full-stack application against both?",
                "expected_concepts": ["stored vs reflected XSS", "input sanitization & output encoding", "Content Security Policy (CSP)", "CSRF tokens", "SameSite cookie attribute", "HTTP-only flags"],
                "evaluation_criteria": ["Clearly distinguishes XSS (script injection) from CSRF (unauthorized state change)", "Details XSS defenses (CSP, sanitization, encoding)", "Details CSRF defenses (SameSite cookies, anti-CSRF tokens)"],
                "sample_answer": "XSS occurs when malicious scripts are injected into web pages viewed by other users, allowing attackers to steal session tokens or manipulate DOM content. Defenses include context-aware output encoding, HTML sanitization (DOMPurify), and strict Content Security Policies (CSP). CSRF tricks an authenticated user's browser into executing unauthorized requests against a trusted server using the user's stored cookies. Defenses include configuring auth cookies with SameSite=Strict/Lax, enforcing custom request headers (Authorization: Bearer), and validating synchronizer CSRF tokens on state-changing requests."
            },
            {
                "topic": "Scalability & Caching",
                "question": "Explain caching strategies (Cache-Aside, Write-Through, Write-Behind) and how you handle cache invalidation and the 'thundering herd' problem.",
                "expected_concepts": ["Redis / Memcached", "cache-aside (lazy loading)", "write-through", "TTL", "cache stampede / thundering herd", "mutex locks / probabilistic early expiration"],
                "evaluation_criteria": ["Explains Cache-Aside vs Write-Through flows", "Identifies cache invalidation strategies", "Provides concrete mitigation for thundering herd (locks, staggered TTL)"],
                "sample_answer": "In Cache-Aside, the application queries the cache first; on a cache miss, it reads from the database, populates the cache, and returns the data. In Write-Through, data is written simultaneously to the cache and the database. The 'thundering herd' (or cache stampede) problem occurs when a hot cached item expires and thousands of concurrent requests all hit the underlying database at once. Solutions include implementing distributed mutex locks (only one worker regenerates the cache while others wait), using probabilistic early expiration (XFetch algorithm), or setting staggered TTLs with background asynchronous pre-warming."
            },
            {
                "topic": "Full-Stack System Architecture",
                "question": "How would you design a real-time collaborative document editing application like Google Docs? Explain the concurrency control mechanism.",
                "expected_concepts": ["WebSockets", "Operational Transformation (OT) or CRDTs", "conflict resolution", "eventual consistency", "presence / cursor tracking"],
                "evaluation_criteria": ["Selects WebSockets for bi-directional real-time transport", "Explains OT or CRDT for concurrent character insertion/deletion", "Discusses client-side optimistic updates"],
                "sample_answer": "A real-time collaborative editor uses full-duplex WebSockets for low-latency bi-directional messaging between clients and an event broker. To handle concurrent edits at identical character positions without race conditions, the system uses Conflict-free Replicated Data Types (CRDTs, like Yjs or Automerge) or Operational Transformation (OT). CRDTs mathematically guarantee eventual consistency by assigning unique, immutable identifiers to each character so operations can be applied concurrently in any order across distributed peers without central coordination."
            }
        ]
    },

    "Frontend Developer": {
        "Beginner": [
            {
                "topic": "HTML & Semantic Web",
                "question": "What is semantic HTML and why is it important for accessibility and SEO?",
                "expected_concepts": ["<header>, <nav>, <main>, <article>, <section>, <footer>", "screen readers / ARIA", "SEO indexing", "DOM clarity"],
                "evaluation_criteria": ["Defines semantic tags vs generic <div> and <span>", "Mentions accessibility benefits for screen readers", "Explains SEO search engine crawlers understanding page structure"],
                "sample_answer": "Semantic HTML uses meaningful markup elements (like <header>, <nav>, <article>, <main>, <footer>) instead of generic <div> and <span> tags. It conveys the role and structure of content to web browsers, assistive technologies (screen readers for visually impaired users), and search engine crawlers, which directly improves accessibility (WCAG compliance) and SEO rankings."
            },
            {
                "topic": "CSS Layouts",
                "question": "What are the primary differences between CSS Flexbox and CSS Grid, and when should you use each?",
                "expected_concepts": ["one-dimensional vs two-dimensional", "flex-direction (rows OR columns)", "grid-template-columns and rows", "content-first vs layout-first"],
                "evaluation_criteria": ["Specifies 1D for Flexbox and 2D for Grid", "Gives practical examples of use cases for both", "Mentions alignment properties"],
                "sample_answer": "CSS Flexbox is a one-dimensional layout model designed for distributing space along either a single row or a single column (ideal for navbars, toolbars, and linear item alignment). CSS Grid is a two-dimensional layout system that manages rows and columns simultaneously, making it ideal for overall page layouts, complex dashboard card arrangements, and responsive galleries."
            },
            {
                "topic": "JavaScript Scoping",
                "question": "Explain the differences between var, let, and const in modern JavaScript.",
                "expected_concepts": ["block scope vs function scope", "hoisting", "temporal dead zone", "reassignment vs mutation"],
                "evaluation_criteria": ["Explains block scope for let/const vs function scope for var", "Mentions Temporal Dead Zone (TDZ)", "Notes that const objects can have mutated properties"],
                "sample_answer": "'var' is function-scoped and hoisted to the top of its scope initialized to undefined. 'let' and 'const' are block-scoped (confined within curly braces {}) and are hoisted into a Temporal Dead Zone (TDZ), meaning accessing them before declaration throws a ReferenceError. 'let' allows variable reassignment, while 'const' forbids reassignment of the variable binding (though properties of const objects or arrays can still be mutated)."
            },
            {
                "topic": "Browser Storage",
                "question": "Compare localStorage, sessionStorage, and cookies. When would you use each?",
                "expected_concepts": ["storage size limit", "expiration", "transmitted with HTTP requests", "tab/window lifecycle", "security"],
                "evaluation_criteria": ["Compares size capacity (5MB vs 4KB)", "Explains expiration rules (sessionStorage clears on tab close, localStorage persists)", "Mentions cookies sent to server"],
                "sample_answer": "localStorage stores 5-10MB of key-value data with no expiration date; data persists until explicitly cleared by the user or code. sessionStorage stores data for the duration of the browser tab session and is cleared when the tab closes. Cookies store up to 4KB, can have expiration dates, and are automatically transmitted with every HTTP request to the matching domain, making them suitable for authentication tokens when combined with the HttpOnly flag."
            }
        ],
        "Intermediate": [
            {
                "topic": "React Lifecycle & Hooks",
                "question": "How does the dependency array in useEffect work, and what happens when it is omitted, empty, or populated?",
                "expected_concepts": ["omitted (runs on every render)", "empty array (runs once on mount)", "populated array (runs when values change)", "cleanup function", "stale closures"],
                "evaluation_criteria": ["Explains the three dependency array states clearly", "Mentions the cleanup return function for unmounting / re-running", "Identifies risk of stale closures or infinite loops"],
                "sample_answer": "The useEffect dependency array determines when the effect executes. If omitted, the effect runs after every component render. If an empty array [] is passed, it runs exactly once after the initial mount. If populated with variables [dep1, dep2], React compares current and previous values using Object.is and only executes the effect if at least one dependency has changed. Returning a function from useEffect acts as a cleanup routine to cancel subscriptions, abort fetches, or clear timers before the next run or component unmount."
            },
            {
                "topic": "Web Performance",
                "question": "What techniques can you use to improve Core Web Vitals (LCP, FID/INP, CLS) in a modern frontend application?",
                "expected_concepts": ["Largest Contentful Paint (LCP)", "Cumulative Layout Shift (CLS)", "Interaction to Next Paint (INP)", "code splitting / dynamic import", "image optimization / webp", "font-display / size attributes"],
                "evaluation_criteria": ["Defines or references LCP, CLS, or INP", "Provides code splitting / lazy loading techniques", "Discusses image optimization and preventing layout shifts"],
                "sample_answer": "To optimize Largest Contentful Paint (LCP), compress and serve responsive modern image formats (WebP/AVIF), preload critical hero assets, and utilize CDNs. To prevent Cumulative Layout Shift (CLS), explicitly reserve aspect-ratio or width/height attributes on media and use font-display: swap. To optimize Interaction to Next Paint (INP), split bundles using React.lazy and dynamic imports, offload heavy computations to Web Workers, and avoid blocking the main thread with long JavaScript tasks."
            },
            {
                "topic": "CSS Methodologies & Tailwind",
                "question": "What are the advantages and potential drawbacks of using utility-first CSS frameworks like Tailwind CSS compared to traditional CSS or CSS Modules?",
                "expected_concepts": ["utility classes", "purge / JIT compiler", "no context switching", "consistency / design tokens", "HTML readability / clutter"],
                "evaluation_criteria": ["Mentions utility classes and speed of prototyping", "Explains build-time purging / small production CSS footprint", "Discusses trade-offs like HTML verbosity"],
                "sample_answer": "Tailwind CSS provides low-level utility classes directly in the markup, eliminating the cognitive overhead of inventing arbitrary class names and switching between files. Its Just-In-Time (JIT) compiler purges unused styles, producing extremely small production CSS bundles (typically < 15KB). Drawbacks include cluttered HTML markup with long class lists and initial learning curves for utility class syntax, though these can be mitigated by abstracting reusable React components."
            }
        ],
        "Advanced": [
            {
                "topic": "Frontend Architecture",
                "question": "How would you design a micro-frontend architecture for a large enterprise web application? Discuss module federation and state sharing.",
                "expected_concepts": ["Webpack Module Federation", "independent deployment", "shared dependencies", "event bus / custom events", "style isolation (CSS modules/shadow DOM)"],
                "evaluation_criteria": ["Explains independent build and deploy pipelines", "Details Webpack 5 Module Federation for runtime remotes", "Addresses shared libraries (React, state) and style encapsulation"],
                "sample_answer": "A micro-frontend architecture decomposes a monolithic web app into autonomous, independently deployable client applications managed by separate teams. Using Webpack 5 Module Federation or single-spa, individual micro-apps are exposed as dynamic remote modules loaded at runtime by a host shell. The host orchestrates routing and shares singletons (like React and global auth state) to prevent duplicate downloads. Inter-app communication is kept minimal and decoupled using browser CustomEvents or a lightweight publish-subscribe event bus."
            },
            {
                "topic": "Advanced React Patterns",
                "question": "Explain the React 18 Concurrent Features: Suspense, Transitions (useTransition), and how React achieves non-blocking rendering.",
                "expected_concepts": ["concurrent renderer", "fiber architecture", "interruptible rendering", "startTransition / useTransition", "Suspense for data fetching", "useDeferredValue"],
                "evaluation_criteria": ["Explains interruptible rendering priority", "Differentiates urgent updates (typing) from non-urgent updates (filtering)", "Mentions Suspense boundaries"],
                "sample_answer": "React 18's Concurrent Renderer transforms rendering from a synchronous, uninterruptible process into a cooperatively scheduled task that can be paused, aborted, or prioritized. Urgent updates (like typing in an input field or clicking a button) are prioritized, while expensive non-urgent transitions (like filtering a massive list) are wrapped in startTransition or useTransition. If an urgent user interaction occurs during a transition render, React yields control back to the browser main thread to maintain 60 FPS responsiveness."
            }
        ]
    },

    "Backend Developer": {
        "Beginner": [
            {
                "topic": "HTTP Protocol",
                "question": "Explain the difference between HTTP and HTTPS, and how the SSL/TLS handshake establishes a secure connection.",
                "expected_concepts": ["port 80 vs 443", "TLS/SSL certificate", "asymmetric encryption (handshake)", "symmetric encryption (session)", "data integrity and privacy"],
                "evaluation_criteria": ["Identifies encryption in HTTPS", "Explains asymmetric key exchange followed by symmetric session keys", "Mentions certificate verification by CA"],
                "sample_answer": "HTTP transmits data as plaintext over port 80, making it vulnerable to eavesdropping and man-in-the-middle attacks. HTTPS encrypts traffic using Transport Layer Security (TLS) over port 443. During the TLS handshake, the client verifies the server's digital certificate issued by a trusted Certificate Authority (CA). They use asymmetric encryption (public/private keys) to securely agree upon a shared symmetric session key, which encrypts all subsequent HTTP payloads with minimal performance overhead."
            },
            {
                "topic": "API Design",
                "question": "What are HTTP status codes and what do the 2xx, 3xx, 4xx, and 5xx series represent?",
                "expected_concepts": ["2xx Success", "3xx Redirection", "4xx Client Errors", "5xx Server Errors", "common codes like 200, 201, 400, 401, 403, 404, 500"],
                "evaluation_criteria": ["Categorizes all 4 main status families correctly", "Distinguishes 401 Unauthorized from 403 Forbidden", "Mentions 201 Created and 500 Internal Server Error"],
                "sample_answer": "HTTP status codes indicate the result of a client request: 2xx represents successful operations (200 OK, 201 Created for resource creation); 3xx represents redirection (301 Moved Permanently); 4xx indicates client-side errors (400 Bad Request, 401 Unauthorized for missing auth, 403 Forbidden for insufficient permissions, 404 Not Found); and 5xx indicates server-side errors (500 Internal Server Error, 503 Service Unavailable)."
            },
            {
                "topic": "Relational Databases",
                "question": "What are database transactions, and what does the ACID acronym stand for?",
                "expected_concepts": ["Atomicity", "Consistency", "Isolation", "Durability", "commit / rollback", "all-or-nothing"],
                "evaluation_criteria": ["Defines all 4 ACID properties accurately", "Explains all-or-nothing execution", "Mentions rollback on error"],
                "sample_answer": "A database transaction is a sequence of one or more SQL operations executed as a single logical unit of work. ACID guarantees reliability: Atomicity ensures all operations succeed or all are rolled back (all-or-nothing); Consistency ensures data transitions from one valid state to another according to all rules and constraints; Isolation ensures concurrent transactions do not interfere with each other; and Durability guarantees that committed data survives power failures and crashes."
            }
        ],
        "Intermediate": [
            {
                "topic": "Concurrency & Message Queues",
                "question": "Why would you introduce a message broker like RabbitMQ, Kafka, or Redis BullMQ into a backend architecture?",
                "expected_concepts": ["asynchronous background processing", "decoupling services", "load leveling / backpressure", "task queues (emails, video processing)", "fault tolerance"],
                "evaluation_criteria": ["Identifies offloading slow operations from the HTTP request-response cycle", "Discusses decoupling and producer-consumer model", "Mentions horizontal worker scaling"],
                "sample_answer": "Message brokers decouple producers and consumers, enabling asynchronous background task execution without blocking HTTP request threads. Tasks that require significant CPU or I/O time—such as sending emails, generating PDF reports, or transcribing media—are pushed to a message queue and processed by worker pools. This architecture provides load leveling (preventing traffic spikes from crashing downstream services), guaranteed delivery, and independent horizontal scaling."
            },
            {
                "topic": "Database Scalability",
                "question": "What is the difference between database replication and database sharding?",
                "expected_concepts": ["read replicas vs horizontal partitioning", "leader-follower (primary-replica)", "read scaling vs write scaling", "sharding keys", "failover"],
                "evaluation_criteria": ["Differentiates data duplication (replication) from data splitting (sharding)", "Explains read scaling with replicas", "Explains write/storage scaling with sharding"],
                "sample_answer": "Database replication copies the entire dataset across multiple nodes (usually primary-replica/leader-follower). Writes go to the primary, while reads can be distributed across read replicas, scaling read throughput and providing failover high-availability. Sharding (horizontal partitioning) splits the dataset across distinct database instances based on a shard key (e.g., user_id or region). Sharding is used to scale write throughput and total storage capacity beyond the limits of a single machine."
            },
            {
                "topic": "Authentication & Authorization",
                "question": "What is Role-Based Access Control (RBAC), and how do you implement it effectively in an Express or FastAPI backend?",
                "expected_concepts": ["roles and permissions", "middleware / dependency injection", "least privilege", "declarative decorators / route guards", "token claims"],
                "evaluation_criteria": ["Defines users, roles, and permissions", "Explains middleware-based checking in the request lifecycle", "Discusses storing roles in JWT or database lookup"],
                "sample_answer": "Role-Based Access Control (RBAC) restricts system access by assigning permissions to roles (e.g., Admin, Editor, Viewer) and roles to users. In an Express backend, RBAC is implemented via higher-order middleware functions (e.g., authorize('admin', 'manager')) placed after the authentication middleware. The middleware inspects req.user.role (decoded from the verified JWT) and returns HTTP 403 Forbidden if the user's role lacks the necessary permissions."
            }
        ],
        "Advanced": [
            {
                "topic": "API Rate Limiting & Resilience",
                "question": "How do you design a distributed rate-limiting system across multiple backend server instances? Compare the Token Bucket and Leaky Bucket algorithms.",
                "expected_concepts": ["Token Bucket vs Leaky Bucket", "Redis (atomic INCR / Lua scripts)", "sliding window counter", "HTTP 429 Too Many Requests", "Retry-After header"],
                "evaluation_criteria": ["Explains Token Bucket (bursts allowed) vs Leaky Bucket (smooth rate)", "Uses centralized memory store like Redis for distributed state", "Mentions atomic Lua scripts to prevent race conditions"],
                "sample_answer": "In a distributed backend with multiple load-balanced instances, rate limiting state must be centralized in a high-speed in-memory store like Redis. The Token Bucket algorithm allows a fixed bucket capacity that fills with tokens at a steady rate; requests consume a token and are admitted, accommodating traffic bursts up to bucket capacity. The Leaky Bucket processes requests at a constant smooth rate, discarding overflows. In production, Redis Lua scripts or Sliding Window Counter algorithms ensure atomic increment and time checks without concurrency race conditions, returning 429 Too Many Requests with a Retry-After header when limits are reached."
            },
            {
                "topic": "System Reliability & Fault Tolerance",
                "question": "Explain the Circuit Breaker pattern in microservices. What are the closed, open, and half-open states?",
                "expected_concepts": ["cascading failures", "closed state (normal)", "open state (failing fast)", "half-open state (testing recovery)", "fallback responses"],
                "evaluation_criteria": ["Defines the purpose (preventing cascading failures)", "Accurately describes Closed, Open, and Half-Open transitions", "Mentions fallback degraded modes"],
                "sample_answer": "The Circuit Breaker pattern prevents cascading failures when a downstream microservice experiences downtime or high latency. In the 'Closed' state, requests flow normally; the breaker tracks failure rates. If failures exceed a defined threshold within a time window, it trips to the 'Open' state: subsequent requests immediately fail fast or return fallback responses without invoking the downstream service, saving CPU threads. After a cooldown timeout, it transitions to 'Half-Open', permitting a limited probe of requests; if successful, it resets to Closed; if failures persist, it reopens."
            }
        ]
    },

    "Data Analyst": {
        "Beginner": [
            {
                "topic": "SQL Fundamentals",
                "question": "Explain the difference between WHERE and HAVING clauses in SQL.",
                "expected_concepts": ["WHERE filters rows before aggregation", "HAVING filters groups after GROUP BY", "aggregate functions (COUNT, SUM, AVG) cannot be used in WHERE"],
                "evaluation_criteria": ["Distinguishes row-level filtering from group-level filtering", "Explicitly notes aggregate function restrictions in WHERE", "Provides clear syntax context"],
                "sample_answer": "The WHERE clause filters individual rows before any grouping or aggregation takes place; aggregate functions (like SUM, COUNT, AVG) cannot be used in WHERE. The HAVING clause filters summarized groups after the GROUP BY clause has aggregated the rows, allowing conditions based on aggregate metrics (e.g., HAVING COUNT(*) > 5)."
            },
            {
                "topic": "SQL Joins",
                "question": "What is the difference between an INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?",
                "expected_concepts": ["INNER JOIN (matching rows in both tables)", "LEFT JOIN (all rows from left + matched right)", "FULL OUTER JOIN (all rows from both tables, nulls where unmatched)"],
                "evaluation_criteria": ["Accurately describes all three join types", "Explains NULL filling for unmatched rows", "Mentions practical analytical use cases"],
                "sample_answer": "An INNER JOIN returns only records that have matching keys in both tables. A LEFT JOIN returns all records from the left table, along with matched records from the right table; unmatched right-side columns are filled with NULL. A FULL OUTER JOIN returns all records when there is a match in either the left or right table, filling missing data with NULL on either side."
            },
            {
                "topic": "Data Cleaning",
                "question": "What strategies do you use to handle missing (NULL) values in a dataset?",
                "expected_concepts": ["deletion (listwise/pairwise)", "imputation (mean, median, mode)", "forward fill / backward fill for time series", "domain-specific defaults", "identifying MCAR/MAR/MNAR"],
                "evaluation_criteria": ["Mentions dropping vs imputing", "Considers data distribution (median for skewed data)", "Highlights time-series techniques"],
                "sample_answer": "Handling missing data depends on the nature and volume of missingness: 1) Removal (dropping rows) if missingness is rare (< 3%) and completely at random; 2) Imputation with mean (for normal distributions) or median (for skewed distributions with outliers); 3) Mode imputation for categorical features; 4) Forward/backward fill for time-series data; or 5) Flagging missingness with a dedicated indicator column if the absence itself contains analytical signal."
            }
        ],
        "Intermediate": [
            {
                "topic": "Advanced SQL",
                "question": "What are SQL Window Functions (like ROW_NUMBER, RANK, DENSE_RANK), and how do they differ from GROUP BY?",
                "expected_concepts": ["OVER (PARTITION BY ... ORDER BY ...)", "retains individual rows", "ROW_NUMBER (sequential)", "RANK (skips ranks on ties)", "DENSE_RANK (no skipped ranks)"],
                "evaluation_criteria": ["Explains that window functions retain individual row identities unlike GROUP BY", "Contrasts ROW_NUMBER, RANK, and DENSE_RANK tie-breaking", "Mentions PARTITION BY clause"],
                "sample_answer": "Unlike GROUP BY which collapses multiple rows into a single aggregated row, SQL Window Functions calculate aggregate or ranking values across a set of rows related to the current row while retaining each individual row's identity. Using the OVER (PARTITION BY ... ORDER BY ...) clause, ROW_NUMBER assigns sequential integers; RANK assigns ranks and skips numbers after ties (e.g., 1, 2, 2, 4); and DENSE_RANK assigns ranks without gaps after ties (e.g., 1, 2, 2, 3)."
            },
            {
                "topic": "Pandas & Python Analysis",
                "question": "How do you detect and handle outliers in a continuous numerical variable using Python?",
                "expected_concepts": ["IQR method (Q1 - 1.5*IQR to Q3 + 1.5*IQR)", "Z-score (> 3 standard deviations)", "boxplots", "capping / winsorizing", "log transformation"],
                "evaluation_criteria": ["Explains IQR or Z-score statistical definitions", "Mentions visual inspection (boxplots, scatter)", "Discusses treatment options beyond just dropping data"],
                "sample_answer": "Outliers can be detected using: 1) The Interquartile Range (IQR) method, where values below Q1 - 1.5*IQR or above Q3 + 1.5*IQR are flagged; 2) The Z-score method, flagging values with absolute Z > 3; and 3) Visualization with Boxplots or Histograms. To handle outliers, analysts can remove them if they result from data entry errors, cap them using Winsorization, or apply a log or Box-Cox transformation to reduce skewness."
            }
        ],
        "Advanced": [
            {
                "topic": "Business Intelligence & Metric Design",
                "question": "How would you design an Executive Dashboard to track Customer Churn? What key metrics and cohort analyses would you present?",
                "expected_concepts": ["churn rate", "Customer Lifetime Value (LTV)", "Customer Acquisition Cost (CAC)", "cohort retention analysis", "leading vs lagging indicators", "drill-down capabilities"],
                "evaluation_criteria": ["Identifies churn rate and cohort retention tables", "Compares CAC to LTV ratio", "Differentiates actionable insights from vanity metrics"],
                "sample_answer": "An Executive Churn Dashboard should blend high-level lagging indicators with actionable leading indicators. Core metrics include: 1) Monthly Churn Rate (% of subscribers lost) segmented by subscription tier; 2) Net Revenue Retention (NRR); 3) LTV to CAC ratio; and 4) A Cohort Retention Heatmap displaying month-over-month retention decay. Leading indicators include product engagement scores, login frequency drop-offs, and open support tickets, accompanied by interactive drill-down filters for geography and acquisition channels."
            }
        ]
    },

    "Software Developer": {
        "Beginner": [
            {
                "topic": "OOP Principles",
                "question": "Explain the four core principles of Object-Oriented Programming (OOP) with real-world analogies.",
                "expected_concepts": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
                "evaluation_criteria": ["Defines all 4 pillars accurately", "Provides clear analogies or code concepts", "Explains practical benefits of modularity and reuse"],
                "sample_answer": "The four pillars of OOP are: 1) Encapsulation: Bundling data and methods into a single class while restricting direct access to internal state using private variables and public getters/setters (like a medical capsule); 2) Abstraction: Hiding internal complexity and showing only essential interfaces to the caller (like driving a car by using pedals without needing to understand combustion physics); 3) Inheritance: Allowing child classes to inherit attributes and methods from a parent class for code reuse (e.g., Dog inherits from Animal); and 4) Polymorphism: The ability of different classes to respond to the same method call in role-specific ways (e.g., Shape.draw() executes differently for Circle and Square)."
            },
            {
                "topic": "Data Structures",
                "question": "What is the difference between an Array and a Linked List in terms of memory layout and time complexity?",
                "expected_concepts": ["contiguous vs non-contiguous memory", "random access O(1) vs sequential access O(N)", "insertion/deletion at head O(1) vs O(N)", "memory pointer overhead"],
                "evaluation_criteria": ["Contrasts contiguous memory blocks with pointer nodes", "Compares lookup time complexity (O(1) vs O(N))", "Compares insertion/deletion costs"],
                "sample_answer": "Arrays store elements in contiguous memory locations, enabling instant random access by index in O(1) time, but insertions or deletions at arbitrary positions require shifting elements in O(N) time. Linked Lists store nodes scattered throughout memory, where each node contains data and a pointer to the next node; random access requires sequential traversal in O(N) time, but inserting or deleting a node at the head or when a pointer is already available is fast O(1)."
            },
            {
                "topic": "Version Control",
                "question": "Explain the difference between 'git merge' and 'git rebase'. When should you avoid using rebase?",
                "expected_concepts": ["merge commit", "linear commit history", "rewriting commit history", "golden rule of rebase: avoid on public shared branches"],
                "evaluation_criteria": ["Explains merge preserves full historical timeline with a merge commit", "Explains rebase rewrites commits onto new base for linear history", "Emphasizes never rebasing public shared branches"],
                "sample_answer": "'git merge' takes the contents of a source branch and integrates them into the target branch via a dedicated merge commit, preserving the exact chronological history of all commits and branch context. 'git rebase' takes your commits and reapplies them one by one on top of the target branch, producing a clean, linear commit history without merge commits. You should never rebase shared public branches (like main) because it rewrites commit hashes, causing history divergence and merge conflicts for collaborators."
            }
        ],
        "Intermediate": [
            {
                "topic": "Algorithms & Complexity",
                "question": "What is Big O notation, and what is the difference in scalability between O(N), O(N log N), and O(N^2)?",
                "expected_concepts": ["upper bound of time/space complexity", "linear O(N)", "linearithmic O(N log N) e.g. MergeSort/QuickSort", "quadratic O(N^2) nested loops", "worst-case analysis"],
                "evaluation_criteria": ["Defines Big O as asymptotic worst-case growth rate", "Relates complexities to real algorithm examples", "Explains how execution time scales as input N explodes"],
                "sample_answer": "Big O notation describes the limiting behavior of an algorithm's execution time or space usage as the input size (N) grows towards infinity. O(N) represents linear time (e.g., iterating through an array once). O(N log N) is linearithmic time (typical of optimal comparison sorts like MergeSort and QuickSort), which scales efficiently even with millions of elements. O(N^2) represents quadratic time (such as nested loops in BubbleSort), which becomes computationally prohibitive as N scales into tens of thousands."
            },
            {
                "topic": "Design Principles",
                "question": "Explain the Single Responsibility Principle (SRP) and Open/Closed Principle (OCP) from SOLID design.",
                "expected_concepts": ["one reason to change", "open for extension, closed for modification", "loose coupling", "interfaces / polymorphism"],
                "evaluation_criteria": ["Defines SRP clearly (single purpose / single reason to change)", "Defines OCP (extending behavior via subclassing/interfaces without altering existing code)", "Explains how this prevents regression bugs"],
                "sample_answer": "The Single Responsibility Principle (SRP) dictates that a class or module should have one, and only one, reason to change, ensuring focused, cohesive functionality. The Open/Closed Principle (OCP) states that software entities should be open for extension but closed for modification; you should be able to introduce new behavior or features (e.g., through interfaces, abstract classes, or polymorphism) without altering and risking regressions in existing, tested source code."
            }
        ],
        "Advanced": [
            {
                "topic": "System Design",
                "question": "How would you design a scalable URL shortener service (like Bitly)? Outline database schema, hashing/encoding, and collision handling.",
                "expected_concepts": ["Base62 encoding", "MD5/SHA256 vs auto-increment ID", "database schema (id, short_url, long_url, created_at)", "caching hot URLs with Redis", "distributed ID generators (Snowflake)"],
                "evaluation_criteria": ["Uses Base62 encoding on unique IDs", "Discusses collision-free generation or hashing with truncation", "Includes caching and database indexing for high read-to-write ratio"],
                "sample_answer": "A URL shortener requires high availability and ultra-fast read redirection (typically 100:1 read-to-write ratio). The optimal approach is to generate a unique 64-bit auto-incrementing integer ID using a distributed ID generator (like Twitter Snowflake) and convert it to a 6-to-7 character string using Base62 encoding [a-zA-Z0-9]. The database stores short_key, original_url, and created_at with an index on short_key. High-frequency redirects are cached in Redis with an LRU eviction policy to serve 99% of requests in single-digit milliseconds without hitting the database."
            }
        ]
    },

    "Data Scientist": {
        "Beginner": [
            {
                "topic": "Statistics & Foundations",
                "question": "What is the difference between supervised and unsupervised learning? Provide examples of algorithms for each.",
                "expected_concepts": ["labeled vs unlabeled data", "target variable / ground truth", "classification / regression", "clustering / dimensionality reduction"],
                "evaluation_criteria": ["Defines labeled data for supervised and unlabeled for unsupervised", "Gives algorithms: Linear Regression, Random Forest for supervised; K-Means, PCA for unsupervised"],
                "sample_answer": "Supervised learning trains models on labeled datasets where each input has a known ground truth target, aiming to learn a mapping function for classification (predicting discrete labels) or regression (predicting continuous values). Common algorithms include Logistic Regression, Decision Trees, and Random Forests. Unsupervised learning finds hidden patterns, structures, or groupings in unlabeled data without target guidance, with common algorithms including K-Means Clustering, DBSCAN, and Principal Component Analysis (PCA)."
            },
            {
                "topic": "Model Evaluation",
                "question": "Why is accuracy often a misleading evaluation metric for imbalanced classification datasets, and what metrics should you use instead?",
                "expected_concepts": ["class imbalance", "accuracy paradox", "Precision", "Recall", "F1-Score", "ROC-AUC", "confusion matrix"],
                "evaluation_criteria": ["Explains accuracy paradox (e.g., 99% majority class)", "Defines Precision (false positive focus) and Recall (false negative focus)", "Mentions F1-Score or ROC-AUC"],
                "sample_answer": "In imbalanced datasets (such as credit card fraud detection where only 0.1% of transactions are fraudulent), a naive model that always predicts 'not fraud' achieves 99.9% accuracy while failing completely at its objective. Instead of accuracy, data scientists evaluate imbalanced models using Precision (TP / (TP + FP)), Recall (TP / (TP + FN)), the F1-Score (harmonic mean of precision and recall), and the Area Under the ROC Curve (ROC-AUC) to measure discrimination ability across classification thresholds."
            }
        ],
        "Intermediate": [
            {
                "topic": "Bias-Variance Trade-off",
                "question": "Explain the Bias-Variance trade-off and how regularization techniques (L1 Lasso and L2 Ridge) mitigate overfitting.",
                "expected_concepts": ["underfitting (high bias)", "overfitting (high variance)", "penalty term", "L1 Lasso (feature selection / sparsity)", "L2 Ridge (shrinks weights)", "regularization parameter lambda/alpha"],
                "evaluation_criteria": ["Defines bias (simplifying assumptions) and variance (sensitivity to training noise)", "Explains how regularization penalizes large model weights", "Differentiates L1 (drives weights to zero) from L2 (shrinks weights uniformly)"],
                "sample_answer": "The Bias-Variance trade-off represents the balance between model underfitting and overfitting. High bias occurs when an overly simple model fails to capture underlying patterns (underfitting). High variance occurs when an overly complex model fits the noise of the training data and fails to generalize (overfitting). Regularization adds a penalty term to the loss function to constrain model weights: L1 Regularization (Lasso) adds the absolute sum of weights, driving non-essential coefficients to exactly zero (performing automatic feature selection). L2 Regularization (Ridge) adds the squared sum of weights, shrinking coefficients towards zero to prevent any single feature from dominating."
            },
            {
                "topic": "Feature Engineering",
                "question": "What is multicollinearity, why is it problematic in regression models, and how do you detect and resolve it?",
                "expected_concepts": ["correlated predictors", "Variance Inflation Factor (VIF)", "unstable coefficients", "standard errors inflated", "PCA / dropping features"],
                "evaluation_criteria": ["Explains correlated independent variables", "Names VIF or correlation matrices for detection", "Provides solutions like dropping features or applying PCA"],
                "sample_answer": "Multicollinearity occurs when two or more independent predictor variables in a multiple regression model are highly correlated, providing redundant information. This inflates standard errors and makes regression coefficients unstable and sensitive to minor data fluctuations, rendering p-values and feature importance unreliable. Multicollinearity is detected using correlation matrices and Variance Inflation Factor (VIF > 5 or 10 indicates severe multicollinearity). It is resolved by dropping redundant features, combining correlated features into a composite index, or applying Principal Component Analysis (PCA)."
            }
        ],
        "Advanced": [
            {
                "topic": "Ensemble Methods & Explainability",
                "question": "Compare Random Forests with Gradient Boosted Trees (like XGBoost or LightGBM). How do you explain complex model predictions using SHAP values?",
                "expected_concepts": ["bagging vs boosting", "parallel trees vs sequential residual correction", "SHAP (Shapley Additive exPlanations)", "game theory", "local vs global feature attribution"],
                "evaluation_criteria": ["Contrasts bagging (independent trees) with boosting (correcting errors sequentially)", "Explains SHAP based on cooperative game theory", "Describes how SHAP explains both individual and global predictions"],
                "sample_answer": "Random Forest is a bagging ensemble that trains multiple independent decision trees in parallel on bootstrap samples, reducing variance through averaging. Gradient Boosted Trees (XGBoost/LightGBM) train trees sequentially, where each new tree fits the residual errors (gradient) of the preceding trees, optimizing a loss function. To interpret these 'black-box' models, SHAP (SHapley Additive exPlanations) grounds feature importance in cooperative game theory. SHAP computes the marginal contribution of each feature to a specific prediction across all feature coalitions, guaranteeing local accuracy and consistency to provide both global feature importance and granular individual prediction explanations."
            }
        ]
    },

    "Machine Learning Engineer": {
        "Beginner": [
            {
                "topic": "ML Fundamentals",
                "question": "What is the purpose of splitting data into Training, Validation, and Test sets? Why is K-Fold Cross-Validation useful?",
                "expected_concepts": ["training set (parameter learning)", "validation set (hyperparameter tuning)", "test set (unbiased final evaluation)", "data leakage", "K-fold folds and variance reduction"],
                "evaluation_criteria": ["Explains distinct roles of all three splits", "Addresses data leakage prevention", "Explains K-Fold rotation across folds"],
                "sample_answer": "The Training set trains model parameters (weights). The Validation set tunes hyperparameters and guides architecture decisions without overfitting to the training set. The Test set provides an unbiased benchmark of model generalization on completely unseen data. K-Fold Cross-Validation partitions data into K subsets; the model trains on K-1 folds and validates on the remaining fold, rotating K times. This averages out variance from arbitrary data splits and provides robust performance estimates, especially on smaller datasets."
            },
            {
                "topic": "Optimization & Loss Functions",
                "question": "What is Gradient Descent and what are the differences between Batch, Stochastic, and Mini-batch Gradient Descent?",
                "expected_concepts": ["learning rate", "loss function gradient", "Batch (entire dataset)", "Stochastic (single sample)", "Mini-batch (small batches like 32/64)", "computational efficiency & convergence"],
                "evaluation_criteria": ["Explains updating weights in opposite direction of gradient", "Compares convergence speed and memory usage", "Identifies Mini-batch as the standard in deep learning"],
                "sample_answer": "Gradient Descent is an iterative optimization algorithm that minimizes a loss function by updating model parameters in the direction opposite to the gradient. Batch Gradient Descent computes the gradient over the entire dataset per step, guaranteeing stable convergence but requiring excessive memory and time for large datasets. Stochastic Gradient Descent (SGD) updates parameters for each individual training sample, which is fast and escapes local minima but produces noisy oscillations. Mini-batch Gradient Descent balances both by computing gradients over small subsets (e.g., 32, 64, or 128 samples), leveraging GPU parallelization while ensuring smooth convergence."
            }
        ],
        "Intermediate": [
            {
                "topic": "Deep Learning Architectures",
                "question": "Explain the vanishing gradient problem in deep neural networks and how modern architectures (ReLU, Residual connections) resolve it.",
                "expected_concepts": ["backpropagation chain rule", "sigmoid / tanh derivatives < 0.25", "gradients shrink exponentially", "ReLU (derivative 1 for positive)", "ResNet skip / residual connections"],
                "evaluation_criteria": ["Explains exponential decay of gradients across deep layers", "Identifies why Sigmoid causes vanishing gradients", "Explains how ReLU and ResNet skip connections preserve gradient flow"],
                "sample_answer": "During backpropagation in deep neural networks, gradients are calculated via the chain rule by multiplying local derivatives backwards from the output layer. For activation functions like Sigmoid or Tanh, the maximum derivative is 0.25; repeatedly multiplying fractions across dozens of layers causes gradients to decay exponentially to near zero, preventing early layers from updating their weights. Modern architectures solve this by: 1) Using ReLU (Rectified Linear Unit), whose derivative is a constant 1 for positive activations, eliminating derivative attenuation; and 2) Utilizing Residual Connections (ResNets), where skip connections add identity mappings (F(x) + x) allowing gradients to flow directly back through early layers without degradation."
            },
            {
                "topic": "MLOps & Model Deployment",
                "question": "What is Data Drift and Concept Drift in production ML systems? How do you monitor and detect them?",
                "expected_concepts": ["data / covariate drift (P(X) changes)", "concept drift (P(Y|X) changes)", "KS-test / Population Stability Index (PSI)", "model retraining pipeline", "real-time monitoring"],
                "evaluation_criteria": ["Differentiates input distribution shift (data drift) from target relationship shift (concept drift)", "Mentions statistical tests (KS-test, PSI, Wasserstein)", "Discusses automated retraining triggers"],
                "sample_answer": "Data Drift (Covariate Shift) occurs when the statistical distribution of input features P(X) changes over time while the input-to-output relationship remains stable (e.g., users buying different products due to demographic shifts). Concept Drift occurs when the underlying relationship between inputs and target labels P(Y|X) fundamentally alters (e.g., consumer behavior shifting drastically during a global pandemic). MLOps pipelines monitor drift using statistical distance tests (Kolmogorov-Smirnov test for continuous features, Chi-square for categorical features, and Population Stability Index (PSI)). When drift exceeds predefined thresholds, automated alerts trigger retraining workflows on recent data."
            }
        ],
        "Advanced": [
            {
                "topic": "Transformers & LLMs",
                "question": "Explain the Multi-Head Self-Attention mechanism in the Transformer architecture. How does it compute Query, Key, and Value representations?",
                "expected_concepts": ["Query (Q), Key (K), Value (V)", "Scaled Dot-Product Attention: softmax(QK^T / sqrt(d_k)) * V", "multi-head subspace projections", "positional encodings", "parallelization vs RNNs"],
                "evaluation_criteria": ["Explains Scaled Dot-Product formula and scaling factor", "Explains Query matching Key to weight Values", "Highlights Multi-Head projection into distinct representation subspaces"],
                "sample_answer": "Self-attention enables input tokens to dynamically attend to and weigh relationships with every other token in a sequence regardless of distance, unlike sequential RNNs. Each token embedding is projected into Query (Q), Key (K), and Value (V) matrices through learnable linear weights. Attention weights are computed using Scaled Dot-Product Attention: softmax((Q * K^T) / sqrt(d_k)) * V, where the dot product of Q and K measures token compatibility, scaled by sqrt(d_k) to prevent vanishing softmax gradients in high dimensions. Multi-Head Attention projects Q, K, and V across multiple independent representation subspaces (heads) simultaneously, allowing the model to jointly attend to diverse semantic, syntactic, and contextual relationships at different positions."
            }
        ]
    },

    "Python Developer": {
        "Beginner": [
            {
                "topic": "Python Data Structures",
                "question": "Explain the differences between Lists, Tuples, Sets, and Dictionaries in Python. When would you use a tuple instead of a list?",
                "expected_concepts": ["ordered vs unordered", "mutable vs immutable", "duplicates allowed vs unique", "key-value pairs", "hashable / dictionary keys", "memory overhead"],
                "evaluation_criteria": ["Correctly categorizes all four structures on mutability and ordering", "Explains why tuples are used for immutable records or dictionary keys", "Mentions O(1) set/dict lookup vs O(N) list lookup"],
                "sample_answer": "In Python: 1) Lists are ordered, mutable collections that allow duplicates; 2) Tuples are ordered, immutable sequences (cannot be changed after creation), consuming less memory than lists and safe for use as dictionary keys or constant records; 3) Sets are unordered, mutable collections of unique, hashable elements with O(1) membership testing; and 4) Dictionaries are key-value mappings with unique hashable keys and O(1) average lookup. Tuples should be preferred over lists when representing fixed records (like coordinates or database row tuples) where data integrity must be guaranteed."
            },
            {
                "topic": "Python Execution Model",
                "question": "What is Python's Global Interpreter Lock (GIL) and how does it affect multi-threaded programs?",
                "expected_concepts": ["CPython implementation", "mutual exclusion lock", "one thread executes bytecode at a time", "CPU-bound vs I/O-bound", "multiprocessing module"],
                "evaluation_criteria": ["Defines GIL in CPython preventing true multi-core parallel thread execution", "Explains threads still help with I/O-bound tasks", "Recommends multiprocessing or external libraries for CPU-bound parallelism"],
                "sample_answer": "The Global Interpreter Lock (GIL) is a mutex in CPython that prevents multiple native threads from executing Python bytecode simultaneously on multiple CPU cores to ensure thread-safe memory management (specifically reference counting). Consequently, multi-threading in Python cannot accelerate CPU-bound computational workloads. However, threading remains effective for I/O-bound tasks (like network calls, file I/O, or web scraping) because the GIL is released during I/O operations. For true CPU parallelism, developers use the 'multiprocessing' module or compiled C-extensions (like NumPy)."
            }
        ],
        "Intermediate": [
            {
                "topic": "Python Internals & Decorators",
                "question": "What are Python Decorators, how do they work under the hood, and how do you write a decorator with arguments?",
                "expected_concepts": ["first-class functions", "closure / wrapper function", "@functools.wraps", "syntax sugar @decorator", "triple-nested function for decorator arguments"],
                "evaluation_criteria": ["Explains functions as first-class objects passed as arguments", "Details the wrapper function taking *args, **kwargs", "Uses @wraps to preserve original metadata", "Explains 3-level nesting for parameterized decorators"],
                "sample_answer": "Decorators in Python are higher-order functions that take a function as input, extend or modify its behavior using an internal wrapper function, and return the modified function without changing the original function's source code. The @decorator syntax is syntactic sugar for func = decorator(func). To write a decorator that accepts arguments (like @rate_limit(max_per_sec=5)), you create a three-level nested function: an outer factory function that accepts the decorator arguments, an inner decorator that receives the target function, and an innermost wrapper function (*args, **kwargs) that executes the custom logic. Always use @functools.wraps(func) on the wrapper to preserve the wrapped function's original docstring and function name."
            },
            {
                "topic": "Generators & Memory Efficiency",
                "question": "What is the difference between a normal function and a Generator function using 'yield'? What are the performance advantages for large datasets?",
                "expected_concepts": ["yield statement", "generator object / iterator protocol", "lazy evaluation", "memory footprint O(1) vs O(N)", "next() method"],
                "evaluation_criteria": ["Explains yield pauses function execution maintaining state", "Explains lazy on-demand evaluation", "Contrasts loading entire list in memory vs streaming item by item"],
                "sample_answer": "A normal function calculates all values and returns them at once in a data structure (like a list), allocating O(N) memory. A generator function contains one or more 'yield' statements; when called, it returns a generator iterator without immediately executing. When iterated over (via a loop or next()), it executes until it encounters 'yield', outputs the current value, and pauses its execution state. This lazy evaluation processes massive datasets (like multi-gigabyte log files) in constant O(1) memory because only a single item resides in RAM at any given instant."
            }
        ],
        "Advanced": [
            {
                "topic": "Asyncio & Concurrency",
                "question": "How does Python's asyncio module work? Compare asyncio coroutines with multi-threading and multi-processing.",
                "expected_concepts": ["async / await", "event loop", "cooperative multitasking", "non-blocking socket I/O", "asyncio.gather / Task"],
                "evaluation_criteria": ["Explains single-threaded cooperative multitasking", "Contrasts preemptive OS threading with cooperative async yielding", "Identifies asyncio as ideal for high-concurrency I/O (e.g. FastAPI, web crawlers)"],
                "sample_answer": "Python's asyncio provides single-threaded, cooperative multitasking using an event loop and coroutines declared with 'async def' and 'await'. Unlike OS multi-threading which relies on preemptive kernel context switching (which incurs thread stack memory overhead and synchronization locks), asyncio coroutines voluntarily yield control back to the event loop during non-blocking I/O operations (like network requests or database queries). This enables a single Python process to efficiently manage tens of thousands of concurrent network connections with minimal memory overhead, powering modern asynchronous frameworks like FastAPI."
            }
        ]
    },

    "Java Developer": {
        "Beginner": [
            {
                "topic": "Java Fundamentals",
                "question": "Explain the differences between JDK, JRE, and JVM. Why is Java called 'write once, run anywhere'?",
                "expected_concepts": ["JVM (Java Virtual Machine)", "JRE (Java Runtime Environment)", "JDK (Java Development Kit)", "Bytecode (.class files)", "platform independence"],
                "evaluation_criteria": ["Correctly defines relationship: JDK contains JRE, JRE contains JVM", "Explains bytecode execution on platform-specific JVMs", "Explains 'write once, run anywhere' portability"],
                "sample_answer": "The JVM (Java Virtual Machine) executes Java bytecode. The JRE (Java Runtime Environment) bundles the JVM along with core class libraries required to run Java applications. The JDK (Java Development Kit) includes the JRE plus developer tools such as the compiler (javac) and debugger. Java achieves 'Write Once, Run Anywhere' (WORA) because source code (.java) is compiled into platform-independent intermediate bytecode (.class). Any operating system with a platform-specific JVM installed can interpret and execute this bytecode identically."
            },
            {
                "topic": "Memory & Collections",
                "question": "What is the difference between Heap memory and Stack memory in Java? Where are objects and primitive variables stored?",
                "expected_concepts": ["Stack (method frames, primitive local variables, object references)", "Heap (actual object instances, shared)", "Garbage Collection runs on Heap", "StackOverflowError vs OutOfMemoryError"],
                "evaluation_criteria": ["Explains stack for thread-local method execution and references", "Explains heap for global dynamic object storage", "Mentions Garbage Collection reclaiming heap memory"],
                "sample_answer": "In Java: Stack memory is thread-specific and stores method execution frames, primitive local variables, and reference pointers to objects in memory; it operates on LIFO (Last-In, First-Out) and is automatically deallocated when a method scope finishes. Heap memory is shared across all threads and stores all created object instances and instance variables. While Stack memory is fast and compact (overflow causes StackOverflowError), Heap memory is dynamically allocated and managed by the Garbage Collector (exhaustion causes OutOfMemoryError)."
            }
        ],
        "Intermediate": [
            {
                "topic": "Collections & HashMaps",
                "question": "How does Java's HashMap work internally? What are hash collisions and how does Java 8 handle them?",
                "expected_concepts": ["hash(key) and bucket index", "hashCode() and equals() contract", "linked list chaining", "balanced Red-Black trees (TREEIFY_THRESHOLD = 8)", "O(1) to O(log N) lookup"],
                "evaluation_criteria": ["Explains bucket array indexing via hash", "Explains the equals and hashCode contract", "Identifies conversion from linked list to red-black tree when chain length reaches 8 in Java 8"],
                "sample_answer": "Java's HashMap uses an array of Node buckets. When put(key, value) is invoked, it computes key.hashCode(), passes it through an internal hash function, and calculates the array bucket index. If multiple keys map to the same bucket (hash collision), entries are stored in a linked list and differentiated using key.equals(). Since Java 8, when a bucket's linked list length exceeds the threshold of 8 (and total table capacity >= 64), the linked list converts into a balanced Red-Black Tree, improving worst-case search complexity from O(N) to O(log N)."
            },
            {
                "topic": "Spring Framework",
                "question": "What is Dependency Injection (DI) and Inversion of Control (IoC) in Spring Boot? Compare constructor injection with field injection.",
                "expected_concepts": ["IoC container", "loose coupling", "ApplicationContext / Bean lifecycle", "@Autowired", "constructor injection allows immutability and easy unit testing"],
                "evaluation_criteria": ["Defines IoC container managing object creation and lifecycle", "Defines DI as injecting dependencies rather than using 'new'", "Explains why constructor injection is preferred over @Autowired field injection"],
                "sample_answer": "Inversion of Control (IoC) shifts the responsibility of object creation, lifecycle management, and dependency wiring from manual 'new' instantiations in application code to the Spring IoC Container (ApplicationContext). Dependency Injection (DI) is the pattern used to inject required dependencies into a class. While field injection (@Autowired on private fields) is convenient, Constructor Injection is strongly recommended by the Spring team: it guarantees required dependencies are not null, enables class immutability using 'final' fields, prevents circular dependency anti-patterns, and makes unit testing straightforward with simple mocks without needing a Spring container."
            }
        ],
        "Advanced": [
            {
                "topic": "JVM Concurrency & Performance",
                "question": "Explain Java's Garbage Collection generational hypothesis (Eden, Survivor, Tenured/Old generation) and compare the G1 GC with ZGC.",
                "expected_concepts": ["weak generational hypothesis (most objects die young)", "Young Generation (Eden, S0, S1)", "Old / Tenured Generation", "Minor GC vs Major/Full GC", "G1 GC (regional, concurrent marking)", "ZGC (sub-millisecond pause times)"],
                "evaluation_criteria": ["Explains object lifecycle across Eden, Survivor spaces, and promotion to Old generation", "Contrasts Stop-the-World pauses with concurrent collection", "Compares G1 GC region-based collection with ultra-low latency ZGC"],
                "sample_answer": "Java's Garbage Collectors rely on the Weak Generational Hypothesis: the vast majority of objects die shortly after creation. Heap memory is split into the Young Generation (Eden space and two Survivor spaces, S0 and S1) and the Old/Tenured Generation. New objects allocate in Eden; surviving objects transfer between S0 and S1 during fast Minor GCs until reaching an age threshold (tenuring threshold), upon which they are promoted to the Old Generation. The Garbage-First (G1) collector partitions the heap into equal-sized regions, prioritizing regions with the most reclaimable space to meet user-defined pause targets. In Java 17+, ZGC (Z Garbage Collector) performs virtually all GC phases concurrently using colored pointers and load barriers, keeping Stop-the-World pause times under 1 millisecond regardless of multi-terabyte heap sizes."
            }
        ]
    },

    "DevOps Engineer": {
        "Beginner": [
            {
                "topic": "Containers & Virtualization",
                "question": "What is the difference between a Virtual Machine (VM) and a Docker Container?",
                "expected_concepts": ["hypervisor vs container engine", "guest OS vs shared host kernel", "startup speed (seconds vs minutes)", "resource overhead and density"],
                "evaluation_criteria": ["Explains VM virtualization of hardware via hypervisor with dedicated Guest OS", "Explains Docker virtualization of OS sharing host kernel", "Compares resource footprint and boot time"],
                "sample_answer": "Virtual Machines virtualize physical hardware via a hypervisor (Type 1 or Type 2), with each VM bundling a complete guest operating system, virtual drivers, and binaries, resulting in gigabytes of storage and multi-minute boot times. Docker Containers virtualize at the operating system level, sharing the host Linux kernel while isolating processes, file systems, and networks using Linux namespaces and cgroups. Containers are lightweight (megabytes), boot in sub-seconds, and achieve much higher server density."
            },
            {
                "topic": "CI/CD Concepts",
                "question": "What is Continuous Integration (CI) and Continuous Deployment (CD), and why are automated testing pipelines critical?",
                "expected_concepts": ["frequent code commits", "automated builds & unit tests", "continuous delivery vs continuous deployment", "faster feedback loops", "reducing integration debt"],
                "evaluation_criteria": ["Defines CI as automated merging, building, and testing", "Distinguishes Continuous Delivery (manual approve) from Continuous Deployment (automatic production release)", "Emphasizes early bug detection"],
                "sample_answer": "Continuous Integration (CI) is the practice where developers regularly merge code changes into a central repository, triggering automated builds and test suites to detect regressions early. Continuous Delivery (CD) automates releasing validated code to staging environments, making releases ready at the push of a button. Continuous Deployment takes this further by automatically releasing every passing build directly to production without manual intervention. Automated CI/CD pipelines reduce integration debt, guarantee software quality, and accelerate release velocity."
            }
        ],
        "Intermediate": [
            {
                "topic": "Kubernetes Architecture",
                "question": "Explain the core components of Kubernetes: Control Plane (API Server, etcd, Scheduler, Controller Manager) and Worker Nodes (Kubelet, Kube-proxy).",
                "expected_concepts": ["Control plane vs worker node", "kube-apiserver", "etcd (distributed key-value store)", "kube-scheduler", "kubelet", "kube-proxy", "Pods"],
                "evaluation_criteria": ["Identifies roles of API Server, etcd, Scheduler, and Controller Manager", "Explains Kubelet agent on worker nodes executing containers", "Mentions Kube-proxy handling network routing and services"],
                "sample_answer": "A Kubernetes cluster consists of a Control Plane and Worker Nodes. The Control Plane manages cluster state: kube-apiserver is the central REST gateway; etcd is the consistent, highly available distributed key-value store holding all cluster configuration; kube-scheduler assigns newly created Pods to optimal worker nodes based on resource constraints; and kube-controller-manager regulates cluster state (e.g., node health, replication). Worker Nodes run containerized workloads: the Kubelet agent communicates with the API server to ensure Pod containers are running healthily; the Container Runtime (containerd) runs the containers; and Kube-proxy maintains network routing rules across Pods and Services."
            },
            {
                "topic": "Infrastructure as Code (IaC)",
                "question": "What is Infrastructure as Code (IaC), and what is the difference between declarative tools (Terraform) and imperative tools (Ansible)?",
                "expected_concepts": ["version-controlled infrastructure", "declarative (what to achieve) vs imperative (how to achieve)", "Terraform state file", "idempotency", "drift detection"],
                "evaluation_criteria": ["Defines IaC as managing cloud resources via versioned code", "Contrasts declarative target state with imperative step-by-step procedures", "Explains idempotency and state tracking"],
                "sample_answer": "Infrastructure as Code (IaC) manages and provisions cloud infrastructure through machine-readable definition files rather than manual console clicks. Declarative tools like Terraform describe the desired end state (what the infrastructure should look like); Terraform calculates the execution plan to reach that state and tracks real-world state in a state file, automatically detecting and resolving drift. Imperative tools like Ansible describe the specific sequential commands and procedures (how to configure a machine step-by-step). Both prioritize idempotency, guaranteeing that applying the configuration multiple times results in the identical final state."
            }
        ],
        "Advanced": [
            {
                "topic": "Observability & SRE",
                "question": "Explain the Three Pillars of Observability (Metrics, Logs, Traces). How does Distributed Tracing work in a microservice ecosystem?",
                "expected_concepts": ["Metrics (numeric time-series)", "Logs (timestamped discrete events)", "Distributed Tracing (request flow across services)", "Trace ID and Span ID", "OpenTelemetry / Jaeger", "context propagation"],
                "evaluation_criteria": ["Defines all 3 pillars accurately", "Explains context propagation with Trace ID across HTTP headers", "Highlights root cause latency diagnosis across microservices"],
                "sample_answer": "The Three Pillars of Observability are: 1) Metrics: Aggregated numeric time-series data (CPU, memory, request rates) ideal for real-time alerting; 2) Logs: Structured timestamped textual events capturing granular system events; and 3) Distributed Tracing: The representation of a single end-to-end request's journey as it traverses multiple distributed microservices. In distributed tracing (using OpenTelemetry and Jaeger), an ingress gateway assigns a unique Trace ID and root Span ID to an incoming request. As the request invokes downstream services, this trace context is injected into HTTP/gRPC metadata headers (W3C Trace Context). Each microservice logs its own span with duration and status, allowing SREs to visualize the full call graph, identify latency bottlenecks, and isolate failures across complex service topologies."
            }
        ]
    },

    "Database Administrator": {
        "Beginner": [
            {
                "topic": "Database Fundamentals",
                "question": "What is Database Normalization? Explain the First (1NF), Second (2NF), and Third (3NF) Normal Forms.",
                "expected_concepts": ["reducing data redundancy", "data integrity", "1NF (atomic values, unique records)", "2NF (1NF + no partial dependencies on composite keys)", "3NF (2NF + no transitive dependencies)"],
                "evaluation_criteria": ["Explains purpose: eliminate update/insert/delete anomalies and redundancy", "Defines 1NF, 2NF, and 3NF accurately", "Mentions trade-off with query joins"],
                "sample_answer": "Database Normalization organizes relational tables to eliminate data redundancy and prevent insertion, update, and deletion anomalies. 1NF (First Normal Form) requires that every column contains atomic (indivisible) values and each row is uniquely identifiable with a primary key. 2NF requires 1NF compliance plus the removal of partial dependencies, meaning all non-key attributes must depend on the entire primary key (relevant for composite keys). 3NF requires 2NF compliance plus the removal of transitive dependencies, meaning non-key columns must depend strictly on the primary key and not on any other non-key columns."
            },
            {
                "topic": "Backup & Recovery",
                "question": "What is the difference between a Full Backup, Differential Backup, and Incremental Backup? What are RPO and RTO?",
                "expected_concepts": ["Full (entire database)", "Differential (changes since last full)", "Incremental (changes since last backup)", "Recovery Point Objective (RPO)", "Recovery Time Objective (RTO)"],
                "evaluation_criteria": ["Defines all three backup types accurately", "Defines RPO (acceptable data loss in time) and RTO (acceptable downtime)"],
                "sample_answer": "A Full Backup copies the complete database. A Differential Backup copies all data that has changed since the last Full backup, growing larger each day but requiring only the Full and latest Differential to restore. An Incremental Backup copies only the data changed since the last backup (Full or Incremental), saving storage and backup time but requiring restoring the Full backup plus every sequential incremental backup in order. Recovery Point Objective (RPO) defines the maximum acceptable data loss measured in time (e.g., losing at most 15 minutes of transactions). Recovery Time Objective (RTO) defines the maximum acceptable duration of system downtime to restore operations after a disaster."
            }
        ],
        "Intermediate": [
            {
                "topic": "Query Optimization & Execution Plans",
                "question": "How do you analyze and optimize a slow-running SQL query using EXPLAIN or EXPLAIN ANALYZE?",
                "expected_concepts": ["EXPLAIN / EXPLAIN ANALYZE", "Seq Scan / Full Table Scan vs Index Scan", "cost estimate vs actual execution time", "nested loops vs hash joins", "missing indexes or outdated statistics"],
                "evaluation_criteria": ["Identifies EXPLAIN for query execution plans", "Points out full table/sequential scans as warning flags", "Discusses adding indexes, rewriting joins, or updating statistics (ANALYZE)"],
                "sample_answer": "To optimize a slow query, run EXPLAIN ANALYZE to view the query planner's execution plan alongside actual execution times. Look for key red flags: 1) Sequential Scans (Seq Scan) on large tables where an Index Scan or Index Only Scan was expected; 2) Significant discrepancies between estimated rows and actual rows, indicating outdated database statistics (resolved by running ANALYZE); 3) High-cost Sort operations that spill to disk (WorkMem tuning required); and 4) Inefficient Nested Loop joins on large datasets where Hash Joins or Merge Joins would be faster. Fixes include adding composite or covering indexes, updating statistics, and rewriting non-sargable WHERE clauses (e.g., avoiding functions on indexed columns)."
            },
            {
                "topic": "Concurrency & Locking",
                "question": "Explain database deadlocks, isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable), and concurrency phenomena (Dirty Read, Non-repeatable Read, Phantom Read).",
                "expected_concepts": ["Deadlock (circular wait for locks)", "Dirty Read (reading uncommitted data)", "Non-repeatable Read (row value changes mid-transaction)", "Phantom Read (new rows appear mid-transaction)", "Serializable isolation"],
                "evaluation_criteria": ["Explains deadlock and resolution (deadlock detection engine aborting victim)", "Defines all 4 SQL isolation levels", "Connects isolation levels to prevented phenomena"],
                "sample_answer": "A Deadlock occurs when two or more transactions hold locks on separate resources and each waits for the other's resource in a circular wait; the database engine detects this cycle and automatically aborts a victim transaction. SQL defines four Transaction Isolation Levels to govern concurrency anomalies: 1) Read Uncommitted: Allows Dirty Reads (reading data that may be rolled back); 2) Read Committed: Prevents Dirty Reads by reading only committed data; 3) Repeatable Read: Prevents Non-repeatable Reads by ensuring a re-read row within the transaction retains identical values, though Phantom Reads (new rows inserted by concurrent transactions) may still appear; and 4) Serializable: The highest level, preventing all anomalies (including Phantoms) by simulating sequential execution using range locks or Snapshot Isolation."
            }
        ],
        "Advanced": [
            {
                "topic": "High Availability & Disaster Recovery",
                "question": "How do you architect a High-Availability PostgreSQL or MySQL cluster with automatic failover, minimal data loss, and zero-downtime maintenance?",
                "expected_concepts": ["synchronous vs asynchronous streaming replication", "Write-Ahead Log (WAL) / Binlog", "failover orchestrator (Patroni, Orchestrator, Raft/Consul)", "split-brain prevention (quorum / fencing)", "connection poolers (PgBouncer)"],
                "evaluation_criteria": ["Explains primary-replica WAL streaming", "Addresses automatic failover with consensus (etcd/Patroni)", "Explains split-brain mitigation via quorum fencing"],
                "sample_answer": "A production high-availability PostgreSQL cluster utilizes Streaming Replication via Write-Ahead Logs (WAL) across a primary and multiple standby replicas (with at least one synchronous replica to ensure zero RPO). Automatic failover and consensus are orchestrated by Patroni backed by a distributed consensus store (like etcd or Consul) using the Raft protocol. When the primary fails, Patroni reaches quorum, fences off the old primary to prevent split-brain data corruption, and promotes the most up-to-date standby to primary. Client applications connect through a connection pooling proxy (like PgBouncer or HAProxy) that dynamically redirects write traffic to the new leader and read traffic across surviving replicas without manual client configuration changes."
            }
        ]
    }
}


# -------------------------------------------------------------------------
# HR & Behavioral Questions (Common across all roles)
# -------------------------------------------------------------------------
HR_QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "General & Introduction": [
        {
            "topic": "Self Introduction",
            "question": "Tell me about yourself. Walk me through your background, technical interests, and why you are interested in this career path.",
            "expected_concepts": ["educational background", "key technical projects or skills", "passion for problem-solving", "alignment with company/role"],
            "evaluation_criteria": ["Concise professional summary", "Highlights hands-on projects and relevant skills", "Articulates clear career motivation"],
            "sample_answer": "I recently completed my degree in Computer Science, where I built a solid foundation in software engineering, data structures, and web technologies. Throughout my academic journey, I discovered a passion for building full-stack web applications and solving real-world challenges with clean code. For example, I developed an e-commerce platform and an analytics dashboard using React and Node.js. I'm excited about this role because it allows me to contribute to scalable products while continuing to learn alongside experienced engineers."
        },
        {
            "topic": "Strengths & Weaknesses",
            "question": "What do you consider your greatest technical strength, and what is one area you are actively working to improve?",
            "expected_concepts": ["specific strength with evidence", "genuine weakness", "active mitigation / learning steps"],
            "evaluation_criteria": ["Provides concrete strength backed by experience", "Shares honest, non-cliché weakness", "Demonstrates self-awareness and proactive learning"],
            "sample_answer": "My greatest strength is my ability to quickly break down complex technical problems and learn new frameworks autonomously. When building my capstone project, I learned Docker and CI/CD pipelines from scratch to containerize our backend services. An area I am actively improving is balancing perfectionism with delivery timelines: early on, I would spend excessive time refactoring code before having a working prototype. Now, I use the 'make it work, make it right, make it fast' approach to deliver functional code first before optimizing."
        },
        {
            "topic": "Career Goals",
            "question": "Where do you see yourself in the next 3 to 5 years in your software engineering career?",
            "expected_concepts": ["technical depth and mastery", "mentorship / team impact", "system architecture contribution", "continuous learning"],
            "evaluation_criteria": ["Realistic and ambitious roadmap", "Focus on technical growth and team contribution", "Demonstrates commitment to engineering excellence"],
            "sample_answer": "Over the next three to five years, my goal is to evolve from a junior engineer into a proficient, dependable senior developer who takes ownership of end-to-end features. In the first two years, I want to master backend architecture, cloud infrastructure, and performance optimization. By year four and five, I aim to lead technical design discussions for complex features, mentor junior team members, and help drive best practices in code quality and system reliability."
        }
    ],
    "Behavioral (STAR Method)": [
        {
            "topic": "Teamwork & Collaboration",
            "question": "Describe a time when you worked on a team project and had a disagreement with a team member about a technical approach. How did you resolve it?",
            "expected_concepts": ["Situation context", "Task objective", "Action taken (data-driven discussion, compromise)", "Positive Result"],
            "evaluation_criteria": ["Follows STAR structure", "Demonstrates active listening and objective communication", "Prioritizes project goals over ego"],
            "sample_answer": "Situation: During our final semester capstone project, our team of four needed to choose a database for a real-time messaging application. Task: A teammate strongly advocated for a relational database (PostgreSQL), while I proposed MongoDB for its flexible document model and native JSON handling. Action: Instead of debating opinions, I suggested we build two quick prototypes and benchmark query performance against our expected data schema. We found MongoDB handled our nested message threads with less code and lower latency. However, we agreed to use PostgreSQL for user authentication and billing where strict ACID transactions were vital. Result: We implemented a hybrid approach that combined the strengths of both systems and completed the project two weeks ahead of schedule."
        },
        {
            "topic": "Overcoming Challenges",
            "question": "Tell me about a challenging bug or technical obstacle you encountered in a project. How did you diagnose and solve it?",
            "expected_concepts": ["Situation & problem", "Investigation & debugging methodology", "Solution implementation", "Key takeaway"],
            "evaluation_criteria": ["Uses structured debugging approach (logging, isolation, reading docs)", "Explains technical resolution clearly", "Reflects on preventive lessons learned"],
            "sample_answer": "Situation: While testing an API for our student portal, users experienced intermittent authentication failures during peak traffic. Task: As the backend lead, I needed to identify and resolve the root cause before our campus demonstration. Action: I reproduced the error under simulated load using Apache Bench and analyzed server logs, discovering that our JWT verification middleware was throwing database timeout errors because it performed an unindexed user lookup on every single API request. I added an index on the user ID field in MongoDB and implemented a Redis caching layer for active user sessions. Result: API latency dropped from 1,200ms to 45ms, authentication failures were completely eliminated, and our presentation went smoothly."
        },
        {
            "topic": "Time Management & Pressure",
            "question": "Describe a situation where you had multiple competing deadlines or an unexpected project change. How did you prioritize your work?",
            "expected_concepts": ["Situation with tight deadlines", "Prioritization criteria (impact vs urgency)", "Communication with stakeholders", "Outcome"],
            "evaluation_criteria": ["Explains prioritization matrix or clear decision logic", "Highlights proactive communication", "Delivered core requirements successfully"],
            "sample_answer": "Situation: Last semester, I had a final project deliverable for Database Systems due the same week as mid-term exams and an internship assignment. Task: I needed to deliver quality results across all three commitments without compromising my academic standing. Action: I broke down each deliverable into daily milestone tasks using Trello and prioritized them based on deadline urgency and grading weight. I proactively communicated with my project team members to clearly assign task ownership and dedicate focused blocks of deep work to the hardest components early in the mornings. Result: I scored an 'A' grade in both courses, submitted the internship assignment on time, and learned the value of proactive time blocking and transparent team communication."
        }
    ]
}


def get_role_questions(role: str, difficulty: str) -> List[Dict[str, Any]]:
    """Retrieve technical questions for a given role and difficulty with fallback."""
    # Direct match
    if role in ROLE_QUESTION_BANK:
        role_data = ROLE_QUESTION_BANK[role]
        if difficulty in role_data:
            return role_data[difficulty]
        # Return whatever difficulty is available
        for diff in ["Intermediate", "Beginner", "Advanced"]:
            if diff in role_data and role_data[diff]:
                return role_data[diff]

    # Keyword matching for specialized/custom roles
    role_lower = role.lower()
    if "machine learning" in role_lower or "ml" in role_lower:
        fallback_role = "Machine Learning Engineer"
    elif "data scientist" in role_lower or "scientist" in role_lower:
        fallback_role = "Data Scientist"
    elif "data" in role_lower or "analyst" in role_lower or "bi" in role_lower:
        fallback_role = "Data Analyst"
    elif "devops" in role_lower or "cloud" in role_lower or "sre" in role_lower:
        fallback_role = "DevOps Engineer"
    elif "database" in role_lower or "dba" in role_lower:
        fallback_role = "Database Administrator"
    elif "python" in role_lower:
        fallback_role = "Python Developer"
    elif "java" in role_lower and "script" not in role_lower:
        fallback_role = "Java Developer"
    elif "front" in role_lower or "react" in role_lower or "web" in role_lower:
        fallback_role = "Frontend Developer"
    elif "back" in role_lower or "api" in role_lower or "node" in role_lower:
        fallback_role = "Backend Developer"
    elif "full" in role_lower or "stack" in role_lower:
        fallback_role = "Full Stack Developer"
    else:
        fallback_role = "Software Developer"

    role_data = ROLE_QUESTION_BANK.get(fallback_role, ROLE_QUESTION_BANK["Software Developer"])
    return role_data.get(difficulty, role_data.get("Intermediate", []))


def get_hr_questions() -> List[Dict[str, Any]]:
    """Retrieve all available HR and behavioral questions."""
    hr_questions = []
    for category_questions in HR_QUESTION_BANK.values():
        hr_questions.extend(category_questions)
    return hr_questions
