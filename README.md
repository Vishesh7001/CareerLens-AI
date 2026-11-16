# CareerLens AI — Modern AI-Powered Career Guidance & Resume Intelligence Platform

> **"Your Career. Your Potential. Your Future."**

CareerLens AI is an enterprise-grade, full-stack platform engineered to empower modern job seekers, college students, and freshers with advanced AI analytics, deep resume intelligence, skill gap identification, precision career path mapping, and text-based mock interview preparation.

This repository represents **Phase 1: Foundation, Project Architecture & Authentication**, **Phase 2: Resume Upload & Parsing**, **Phase 3: AI Resume Analysis**, **Phase 4: Intelligent Job Matching & Career Intelligence**, and **Phase 5: AI-Powered Text-Based Mock Interview System**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Phases & Deliverables](#phases--deliverables)
   - [Phase 1: Foundation & Authentication](#phase-1-foundation--authentication)
   - [Phase 2: Resume Upload & Parsing](#phase-2-resume-upload--parsing)
   - [Phase 3: AI-Powered Resume Analysis](#phase-3-ai-powered-resume-analysis)
   - [Phase 4: Job Matching & Career Intelligence](#phase-4-job-matching--career-intelligence)
   - [Phase 5: AI-Powered Text-Based Mock Interview System](#phase-5-ai-powered-text-based-mock-interview-system)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Monorepo Directory Structure](#monorepo-directory-structure)
6. [Prerequisites](#prerequisites)
7. [Environment Variables Setup](#environment-variables-setup)
8. [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
9. [Step-by-Step Installation & Running Guide](#step-by-step-installation--running-guide)
   - [Running All Services (Concurrently)](#quick-start-single-command--runs-all-services)
   - [Running Services Independently](#alternative-running-services-independently)
10. [API Endpoint Documentation](#api-endpoint-documentation)
    - [Authentication APIs (`/api/auth`)](#authentication-endpoints-apiauth)
    - [User Profile APIs (`/api/users`)](#user-profile-endpoints-apiusers)
    - [Resume Management APIs (`/api/resumes`)](#resume-management-endpoints-apiresumes)
    - [Resume Analysis APIs (`/api/analysis`)](#resume-analysis-endpoints-apianalysis)
    - [Job Matching & Career Intelligence APIs (`/api/jobs`, `/api/matches`, `/api/career-paths`, `/api/roadmaps`)](#job-matching--career-intelligence-endpoints)
    - [Mock Interview APIs (`/api/interviews`)](#mock-interview-endpoints-apiinterviews)
    - [FastAPI AI Microservice APIs](#fastapi-ai-microservice-apis-httplocalhost8000)
11. [Interview Rubric & Evaluation System](#interview-rubric--evaluation-system)
12. [Authentication & Security Flow](#authentication--security-flow)
13. [Testing & Verification](#testing--verification)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Roadmap](#roadmap)

---

## Project Overview

CareerLens AI transforms how candidates navigate their career trajectories. By unifying high-performance web engineering with microservice-driven AI analytics, CareerLens AI provides candidates with ATS-aligned resume reviews, real-time market skill gap diagnostics, hyper-personalized career roadmaps, and realistic, interactive text-based technical and HR mock interviews.

Key platform pillars:
- **Responsive SaaS Frontend**: Modern, accessible React (Vite) + Tailwind CSS dashboard with dark/light themes, real-time feedback, and intuitive candidate workflows.
- **Secure Express.js Backend**: Robust Node.js/Express gateway enforcing strict HTTP-only cookie JWT auth, data sanitization, user isolation, and resilient transparent fallbacks.
- **Python FastAPI AI Microservice**: Modular high-speed microservice delivering ATS scoring, semantic job matching, customized interview question synthesis, and multi-factor rubric evaluations.
- **Resilient Offline Architecture**: Every AI module operates seamlessly with or without external AI service availability through deterministic, rule-based fallback engines.

---

## Phases & Deliverables

### Phase 1: Foundation & Authentication
- [x] **Monorepo Architecture**: Clean separation between `frontend/`, `backend/`, and `ai-service/`.
- [x] **Authentication Engine**: Bcrypt password hashing (salt factor 12), JWT issuance, HTTP-only cookies (preventing client-side token exposure via XSS), and `SameSite` attribute controls paired with CORS origin whitelisting.
- [x] **Node.js-to-FastAPI Communication**: Built-in `fetch()` proxy layer with `AbortController` timeout handling, safe error classification, and Express route `GET /api/ai/health`.
- [x] **Protected Routes**: Client-side route guards and server-side middleware verifying active sessions across page reloads.
- [x] **User Profile Management**: Authenticated users can view and update their profile with field validations.

### Phase 2: Resume Upload & Parsing
- [x] **Secure PDF Resume Upload**: Drag-and-drop interface, client & server file type validation (.pdf), 5MB size limit, magic byte validation (`%PDF-`).
- [x] **Isolated Disk Storage**: Configurable `RESUME_STORAGE_PATH` with automatic user directory isolation, safe cleanup on replace/delete, path traversal prevention.
- [x] **Robust PDF Text Extraction**: Unpooled memory handling, multi-page extraction, blank/corrupted PDF rejection.
- [x] **Rule-Based Resume Parser**: Modular regex/pattern classification across 6 structured categories (Personal Info, Technical Skills, Work Experience, Education, Projects, Certifications).
- [x] **Phone Number Parser**: Full support for Indian formats (+91, spaced, hyphenated, 10-digit continuous) with zero digit loss and protection against false positives.

### Phase 3: AI-Powered Resume Analysis
- [x] **Comprehensive ATS Scoring**: Multi-factor scoring evaluating Technical Skills (30%), Experience (25%), Projects (20%), Education (15%), and Formatting (10%).
- [x] **Actionable Strengths & Weaknesses**: Identification of high-impact accomplishments, missing technical proficiencies, and structural improvements.
- [x] **Dual AI & Fallback Engine**: FastAPI NLP-based evaluation backed by an automatic deterministic Node.js fallback analyzer.

### Phase 4: Job Matching & Career Intelligence
- [x] **Job Description Management**: Create, edit, list, and delete target job postings.
- [x] **Intelligent Skill Gap Matching**: Weighted 35/25/15/15/10 rubric comparing candidate profile to job requirements with normalized semantic skill mapping.
- [x] **Primary & Alternative Career Paths**: Personalized career trajectories tailored for students and freshers.
- [x] **Personalized 4-Week Learning Roadmaps**: Actionable weekly learning modules with interactive, persistent completion tracking (0%, 25%, 50%, 75%, 100%).

### Phase 5: AI-Powered Text-Based Mock Interview System
- [x] **Flexible Interview Configuration**:
  - 11 pre-configured roles (Full Stack, Frontend, Backend, AI/ML, Data Analyst, DevOps, Mobile, QA, Cloud, Cybersecurity, Product Management) + Custom Role support.
  - Round Types: Technical, Behavioral / HR, or Mixed.
  - Difficulty Levels: Beginner (Junior/Fresher), Intermediate, Advanced.
  - Question Counts: 3, 5, or 7 questions.
  - Resume & Job Description Context Integration: Dynamic question tailoring based on candidate's uploaded resume and saved target jobs.
- [x] **Strict Security & Anti-Cheat Protections**:
  - Questions in `pending` state strictly omit `expectedConcepts`, `evaluationCriteria`, and `sampleAnswer` in all API responses.
  - User isolation guarantees: candidates can only view, answer, or delete their own interview sessions.
  - Completed interviews are locked against subsequent edits or submissions.
  - Input validations: answers must be between 10 and 4,000 characters.
- [x] **Multi-Dimensional Answer Evaluation**:
  - **Technical Rubric**: Technical Accuracy (40%), Relevance (25%), Completeness (20%), Clarity (15%).
  - **HR / Behavioral Rubric**: Relevance (25%), Clarity (25%), Completeness (20%), Structure & STAR method (15%), Real-World Examples (15%).
  - Specific feedback per answer: Identified Strengths, Areas for Improvement, Missing Key Concepts, Actionable Tips, and a Benchmark Sample Answer with a copy button.
- [x] **Interactive Active Interview Room**:
  - Live character/word counter with minimum length indicators.
  - Autosave / draft answer capability to prevent loss of work during typing.
  - Retry evaluation on failed/stalled evaluations.
  - Exit modal with confirmation and progress preservation.
- [x] **Comprehensive Interview Performance Report**:
  - Overall Performance Score (0–100) and Readiness Assessment (Ready, Near Ready, Needs Practice).
  - Average rubric scores with visual progress meters.
  - Consolidated Strengths & Priority Improvement Areas.
  - Collapsible question-by-question breakdown showing candidate answers, scores, feedback, missing concepts, and ideal answers.
- [x] **Session History & KPI Analytics**:
  - Complete history view with status tags, question counts, difficulty badges, and date filters.
  - Summary KPI cards on Dashboard and History pages (Total Sessions, Completed Sessions, Average Score, Top Role).
- [x] **Transparent Dual-Engine Fallback**:
  - High-performance FastAPI evaluation service (`fastapi-ai-engine`) with deterministic JavaScript fallback engine (`rule-based-fallback`) ensuring 100% uptime even without external network/API keys.

---

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (configured with `withCredentials: true`)
- **Icons**: Lucide React

### Backend (Main Application Server)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & HTTP-only cookies (`cookie-parser`)
- **Security & Password Hashing**: `bcryptjs`, `express-rate-limit`, CORS origin whitelist
- **Microservice Communication**: Node.js native `fetch()` with `AbortController` timeout management

### AI Microservice
- **Runtime**: Python 3.10+
- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Data Validation**: Pydantic v2
- **Documentation**: Swagger UI (`/docs`) & ReDoc (`/redoc`)

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React Frontend (Vite)         │
                      │  - Tailwind CSS SaaS Dashboard         │
                      │  - AuthContext & Axios Interceptors    │
                      │  - Interactive Mock Interview Room     │
                      │  - Port: 5173                          │
                      └──────────────────┬─────────────────────┘
                                         │
                    HTTP-Only Cookie /   │   CORS Credentials
                    REST API Calls       │   (JSON)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Node.js / Express Backend        │
                      │  - Authentication & Session Gateway    │
                      │  - Rate Limiting & User Management     │
                      │  - Interview Session State Controller  │
                      │  - Fallback Engine (Transparent Fail)  │
                      │  - Port: 5000                          │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                 Mongoose ODM │ (TLS Encrypted)        │ Node.js fetch()
                              ▼                        │ (AbortController Timeout)
       ┌───────────────────────────────┐               ▼
       │         MongoDB Atlas         │    ┌───────────────────────────────────┐
       │  - Clustered Database Storage │    │      FastAPI AI Microservice      │
       │  - Users, Resumes, Analyses   │    │  - High-Speed Python ASGI Service │
       │  - Jobs, Matches, Roadmaps    │    │  - Question Synthesis & Bank      │
       │  - InterviewSessions Model    │    │  - Multi-Factor Rubric Evaluator  │
       └───────────────────────────────┘    │  - Port: 8000                     │
                                            └───────────────────────────────────┘
```

---

## Monorepo Directory Structure

```
CareerLens-AI/
├── .env.example              # Root environment template
├── .gitignore                # Global git ignore configuration
├── package.json              # Monorepo management scripts
├── README.md                 # Complete project documentation
│
├── frontend/                 # React (Vite) Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Button, Input, Card, LoadingSpinner
│   │   │   ├── layout/       # Navbar, Footer, Sidebar, Topbar, DashboardLayout
│   │   │   ├── resume/       # ResumeSection, ResumeUploadCard, ParsedResumeView
│   │   │   └── interview/    # AnswerEvaluationCard, InterviewReportView
│   │   ├── context/          # AuthContext (session persistence, login, logout)
│   │   ├── hooks/            # useAuth hook
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ResumeAnalysisPage.jsx
│   │   │   ├── JobMatchingPage.jsx
│   │   │   ├── CareerPathsPage.jsx
│   │   │   ├── LearningRoadmapPage.jsx
│   │   │   ├── InterviewSetupPage.jsx    # [Phase 5] Interview configuration
│   │   │   ├── ActiveInterviewPage.jsx   # [Phase 5] Interactive interview room
│   │   │   ├── InterviewReportPage.jsx   # [Phase 5] Full performance report
│   │   │   ├── InterviewHistoryPage.jsx  # [Phase 5] Historical sessions & KPIs
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── api.js                   # Axios instance with credentials
│   │   │   ├── authService.js
│   │   │   ├── resumeService.js
│   │   │   ├── analysisService.js
│   │   │   ├── jobMatchingService.js
│   │   │   └── interviewService.js      # [Phase 5] Interview API client
│   │   ├── App.jsx                      # Route definitions
│   │   └── main.jsx
│
├── backend/                  # Express.js Application Server
│   ├── config/
│   │   └── db.js                        # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── userController.js
│   │   ├── analysisController.js
│   │   ├── jobMatchingController.js
│   │   └── interviewController.js       # [Phase 5] Interview session controller
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── ResumeAnalysis.js
│   │   ├── JobDescription.js
│   │   ├── JobMatchResult.js
│   │   ├── LearningRoadmap.js
│   │   └── InterviewSession.js          # [Phase 5] Embedded question & rubric schema
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── userRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── jobMatchingRoutes.js
│   │   └── interviewRoutes.js           # [Phase 5] /api/interviews endpoints
│   ├── services/
│   │   ├── aiService.js                 # Microservice dispatcher with timeout & fallback
│   │   ├── resumeParserService.js
│   │   ├── resumeService.js
│   │   ├── tokenService.js
│   │   ├── fallbackAnalysisService.js
│   │   ├── fallbackInterviewService.js  # [Phase 5] Deterministic interview engine
│   │   ├── jobMatchingService.js
│   │   └── roadmapService.js
│   ├── tests/
│   │   ├── ai.test.js                   # Node-to-FastAPI proxy suite (5 tests)
│   │   ├── analysis.test.js             # Resume analysis suite (12 tests)
│   │   ├── auth.test.js                 # Authentication & security suite (22 tests)
│   │   ├── interview.test.js            # [Phase 5] Mock interview suite (8 tests)
│   │   ├── jobMatching.test.js          # Job matching & roadmap suite (11 tests)
│   │   └── resume.test.js               # Resume upload & parsing suite (27 tests)
│   └── app.js
│
└── ai-service/               # FastAPI AI Microservice
    ├── app/
    │   ├── routes/
    │   │   ├── health.py
    │   │   ├── analysis.py
    │   │   ├── matching.py
    │   │   └── interview.py             # [Phase 5] /interview/* FastAPI endpoints
    │   ├── schemas/
    │   │   ├── health.py
    │   │   ├── analysis.py
    │   │   ├── matching.py
    │   │   └── interview.py             # [Phase 5] Pydantic models for interview
    │   ├── services/
    │   │   ├── analyzer.py
    │   │   ├── matcher.py
    │   │   ├── question_bank.py         # [Phase 5] Catalog across 11 roles & STAR HR
    │   │   └── interview_service.py     # [Phase 5] Q synthesis & rubric evaluator
    │   └── main.py
    └── tests/
        ├── test_health.py
        ├── test_analysis.py
        ├── test_matching.py
        └── test_interview.py            # [Phase 5] AI Service test suite (11 tests)
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node.js v24.21.0)
- **npm**: v9.0.0 or higher (Tested on npm 11.19.0)
- **Python**: v3.10 or higher (Tested on Python 3.14.7)
- **MongoDB Atlas** account (or local MongoDB for development)

---

## Environment Variables Setup

### 1. Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/careerlens?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
RESUME_STORAGE_PATH=./uploads/resumes
NODE_ENV=development
```

### 2. Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. AI Service (`ai-service/.env`)
```env
AI_SERVICE_PORT=8000
NODE_ENV=development
```

---

## Step-by-Step Installation & Running Guide

### Quick Start (Single Command — Runs All Services)

From the project root:
```bash
npm install
npm run dev
```

This concurrently boots:
- **Frontend**: `http://localhost:5173`
- **Express Backend**: `http://localhost:5000`
- **FastAPI Microservice**: `http://localhost:8000`

---

## API Endpoint Documentation

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue HTTP-only cookie |
| `GET`  | `/api/auth/me` | Protected | Return currently logged-in user profile |
| `POST` | `/api/auth/logout` | Public/Protected | Invalidate session & clear auth cookie |

### Resume Management Endpoints (`/api/resumes`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/resumes/upload` | Protected | Upload & parse PDF resume (max 5MB) |
| `GET`  | `/api/resumes` | Protected | Retrieve authenticated user's active resume |
| `GET`  | `/api/resumes/download` | Protected | Download user's original stored resume PDF |
| `DELETE` | `/api/resumes` | Protected | Delete resume and unlink from disk storage |

### Resume Analysis Endpoints (`/api/analysis`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/analysis/:resumeId` | Protected | Run ATS scoring and feedback analysis |
| `GET`  | `/api/analysis/:resumeId` | Protected | Retrieve stored analysis results |
| `DELETE` | `/api/analysis/:resumeId` | Protected | Clear stored analysis results |

### Job Matching & Career Intelligence Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/jobs` | Protected | Create a new target job description |
| `GET`  | `/api/jobs` | Protected | List all jobs for the current user |
| `POST` | `/api/matches/analyze` | Protected | Run 35/25/15/15/10 rubric job match |
| `GET`  | `/api/matches/history` | Protected | Fetch past job match results |
| `GET`  | `/api/career-paths/recommendations` | Protected | Generate recommended career paths |
| `POST` | `/api/roadmaps/generate` | Protected | Generate 4-week learning roadmap |
| `PATCH`| `/api/roadmaps/:roadmapId/progress` | Protected | Update weekly module completion status |

### Mock Interview Endpoints (`/api/interviews`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/interviews` | Protected | Create new session and generate tailored questions |
| `GET`  | `/api/interviews` | Protected | List candidate's interview sessions and summary metrics |
| `GET`  | `/api/interviews/:interviewId` | Protected | Get session state (strips rubric/answers on pending questions) |
| `DELETE`| `/api/interviews/:interviewId` | Protected | Delete interview session record |
| `GET`  | `/api/interviews/:interviewId/questions/current` | Protected | Retrieve current active question |
| `PUT`  | `/api/interviews/:interviewId/questions/:questionId/draft` | Protected | Save in-progress draft answer |
| `POST` | `/api/interviews/:interviewId/questions/:questionId/submit` | Protected | Submit answer for immediate rubric evaluation |
| `POST` | `/api/interviews/:interviewId/questions/:questionId/retry` | Protected | Retry evaluation on failed question submission |
| `POST` | `/api/interviews/:interviewId/questions/:questionId/next` | Protected | Advance to next pending question in session |
| `POST` | `/api/interviews/:interviewId/complete` | Protected | Finalize interview and generate performance report |
| `GET`  | `/api/interviews/:interviewId/report` | Protected | Retrieve completed session report |

### FastAPI AI Microservice APIs (`http://localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Microservice health check probe |
| `POST` | `/interview/generate-questions` | Synthesize customized questions based on role, difficulty, and resume context |
| `POST` | `/interview/evaluate-answer` | Evaluate candidate answer using multi-factor rubric |
| `POST` | `/interview/generate-report` | Compute aggregate session statistics, score breakdown, and readiness |

---

## Interview Rubric & Evaluation System

Every submitted candidate answer is evaluated using a weighted multi-criteria rubric:

### 1. Technical Questions Rubric
- **Technical Accuracy (40%)**: Correctness of concepts, principles, algorithms, and syntax.
- **Relevance (25%)**: Directly addresses the specific question prompt without straying off-topic.
- **Completeness (20%)**: Depth of coverage, edge cases, trade-offs, and architectural considerations.
- **Clarity & Articulation (15%)**: Professional terminology, logical explanation flow, and concise phrasing.

### 2. Behavioral / HR Questions Rubric
- **Relevance (25%)**: Directly answers the behavioral situational prompt.
- **Clarity & Communication (25%)**: Well-articulated thought process and tone.
- **Completeness (20%)**: Addresses what was asked with sufficient detail.
- **Structure (STAR Method) (15%)**: Situation, Task, Action, Result framework compliance.
- **Real-World Examples (15%)**: Concrete past experiences and measurable outcomes.

### 3. Final Readiness Classification
- **Ready for Interviews (Score ≥ 80%)**: Demonstrates solid technical mastery and articulate communication.
- **Near Ready — Minor Practice Needed (Score 60–79%)**: Good foundation; needs refinement on edge cases and structure.
- **Needs Practice (Score < 60%)**: Foundational gaps detected; recommends structured review via Learning Roadmaps.

---

## Testing & Verification

The system includes automated end-to-end test suites across the entire stack:

### 1. Backend Integration & Unit Tests
Run in the `backend/` directory:
```bash
cd backend
npm test
```

**Verified Test Results (6 Suites, 85 Tests Passed, 0 Failed, 0 Skipped):**
- `ai.test.js`: Node.js to FastAPI communication layer & timeout resilience (5 tests)
- `analysis.test.js`: Phase 3 resume analysis, ATS scoring, and isolation (12 tests)
- `auth.test.js`: Phase 1 authentication, rate limiting, and cookie security (22 tests)
- `interview.test.js`: Phase 5 mock interview creation, draft autosaving, answer evaluation, question navigation, completion, report generation, user isolation, and CORS (8 tests)
- `jobMatching.test.js`: Phase 4 job posting, 35/25/15/15/10 match rubric, career paths, and roadmap progress tracking (11 tests)
- `resume.test.js`: Phase 2 resume upload, magic byte validation, storage isolation, phone number extraction (+91 formats) (27 tests)

### 2. FastAPI AI Service Unit Tests
Run in the `ai-service/` directory:
```bash
cd ai-service
.\venv\Scripts\python.exe -m unittest discover tests
```
**Verified Test Results: 34 Tests Passed, 0 Failed.**

### 3. Frontend Production Build
Run in the `frontend/` directory:
```bash
cd frontend
npm run build
```
**Verified: Built in ~11s, zero syntax or bundling errors.**

---

## Troubleshooting Guide

### 1. AI Service Not Running
- If the FastAPI microservice on port 8000 is stopped, CareerLens AI automatically engages its built-in JavaScript fallback engine (`rule-based-fallback`). The user experience remains functional without downtime.

### 2. CORS Errors in Frontend
- Ensure `CLIENT_URL=http://localhost:5173` is set in `backend/.env`.
- Ensure frontend calls use `withCredentials: true`.

### 3. Cookie Storage Issues
- Check that cookies are sent with `sameSite: 'lax'` in development.
- Always access the application consistently via `http://localhost:5173` (do not interchange with `127.0.0.1`).

---

## Roadmap

- [x] **Phase 1**: Foundation, Project Architecture & Authentication (Completed)
- [x] **Phase 2**: Resume Upload, Text Extraction & Rule-Based Parsing (Completed)
- [x] **Phase 3**: AI-Powered Resume Analysis & ATS Scoring (Completed)
- [x] **Phase 4**: Intelligent Job Matching & Career Intelligence (Completed)
- [x] **Phase 5**: AI-Powered Text-Based Mock Interview System (Completed)
- [ ] **Phase 6**: Analytics Dashboard & Exportable Resume Optimizer

---

## License

ISC License © CareerLens AI Team.
