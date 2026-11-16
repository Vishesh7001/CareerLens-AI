# CareerLens AI — Modern AI-Powered Career Guidance & Resume Intelligence Platform

> **"Your Career. Your Potential. Your Future."**

CareerLens AI is an enterprise-grade, full-stack platform engineered to empower modern job seekers, college students, and freshers with advanced AI analytics, deep resume intelligence, skill gap identification, precision career path mapping, text-based mock interview preparation, and centralized career intelligence.

This repository represents the complete platform encompassing:
- **Phase 1: Foundation, Project Architecture & Authentication**
- **Phase 2: Resume Upload & Parsing**
- **Phase 3: AI-Powered Resume Analysis**
- **Phase 4: Intelligent Job Matching & Career Intelligence**
- **Phase 5: AI-Powered Text-Based Mock Interview System**
- **Phase 6: Complete Dashboard Redesign, Career Intelligence & Final Platform Integration**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Phases & Deliverables](#phases--deliverables)
   - [Phase 1: Foundation & Authentication](#phase-1-foundation--authentication)
   - [Phase 2: Resume Upload & Parsing](#phase-2-resume-upload--parsing)
   - [Phase 3: AI-Powered Resume Analysis](#phase-3-ai-powered-resume-analysis)
   - [Phase 4: Job Matching & Career Intelligence](#phase-4-job-matching--career-intelligence)
   - [Phase 5: AI-Powered Text-Based Mock Interview System](#phase-5-ai-powered-text-based-mock-interview-system)
   - [Phase 6: Dashboard Redesign, Career Intelligence & Platform Integration](#phase-6-dashboard-redesign-career-intelligence--platform-integration)
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
    - [Dashboard & Career Readiness APIs (`/api/dashboard`)](#dashboard--career-readiness-endpoints-apidashboard)
    - [In-App Notification APIs (`/api/notifications`)](#in-app-notification-endpoints-apinotifications)
    - [FastAPI AI Microservice APIs](#fastapi-ai-microservice-apis-httplocalhost8000)
11. [Career Readiness Scoring & Renormalization Engine](#career-readiness-scoring--renormalization-engine)
12. [Unified Skill Intelligence Engine](#unified-skill-intelligence-engine)
13. [Interview Rubric & Evaluation System](#interview-rubric--evaluation-system)
14. [Authentication & Security Flow](#authentication--security-flow)
15. [Testing & Verification](#testing--verification)
16. [Troubleshooting Guide](#troubleshooting-guide)
17. [Roadmap](#roadmap)

---

## Project Overview

CareerLens AI transforms how candidates navigate their career trajectories. By unifying high-performance web engineering with microservice-driven AI analytics, CareerLens AI provides candidates with ATS-aligned resume reviews, real-time market skill gap diagnostics, hyper-personalized career roadmaps, realistic interactive mock interviews, and a centralized career intelligence hub.

Key platform pillars:
- **Unified Modern SaaS Dashboard**: Accessible, responsive React (Vite) + Tailwind CSS dashboard synthesizing resume metrics, job compatibility, interview scores, and skill progression in one unified view.
- **Career Readiness Engine**: 5-pillar dynamic weighted evaluation with automatic missing-data weight renormalization preventing zero penalties for fresh profiles.
- **Unified Skill Intelligence**: Aggregates skills across uploaded resumes, parsed profiles, target job requirements, mock interview question answers, and completed roadmap modules.
- **Secure Express.js Backend**: Robust Node.js/Express gateway enforcing strict HTTP-only cookie JWT auth, data sanitization, user isolation, and resilient transparent fallbacks.
- **Python FastAPI AI Microservice**: High-speed microservice delivering ATS scoring, semantic job matching, customized interview question synthesis, and multi-factor rubric evaluations.
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
- [x] **Flexible Interview Configuration**: 11 pre-configured roles + Custom Role, Technical, Behavioral/HR, or Mixed rounds, Beginner/Intermediate/Advanced difficulty, 3/5/7 questions.
- [x] **Strict Security & Anti-Cheat**: Questions in `pending` state omit rubric concepts, criteria, and answers. User isolation guarantees.
- [x] **Multi-Dimensional Rubric**: Technical Accuracy (40%), Relevance (25%), Completeness (20%), Clarity (15%) for technical questions; STAR framework & real examples for HR.
- [x] **Active Interview Room**: Live character/word counters, draft autosaving, retry evaluation, exit modal, and progress preservation.
- [x] **Performance Report & History**: Overall score, readiness tier (Ready, Near Ready, Needs Practice), rubric breakdown, collapsible question review, and session KPIs.

### Phase 6: Dashboard Redesign, Career Intelligence & Platform Integration
- [x] **Complete Dashboard Redesign**: Modern, polished SaaS interface integrating all phases into a cohesive student career hub.
- [x] **Personalized Welcome & Quick Actions**: Dynamic greeting based on time of day, candidate profile summary, readiness dial, and deep-link quick actions.
- [x] **6 Key Performance Indicator (KPI) Metric Cards**:
  1. Overall Career Readiness Score
  2. Resume ATS Score (with target delta)
  3. Target Job Match Rate
  4. Mock Interview Performance
  5. Learning Roadmap Completion Rate
  6. Verified Skills Count
- [x] **Career Readiness Score Engine**: 5 weighted pillars with dynamic weight renormalization for missing data and 4-tier readiness classification.
- [x] **5 Career Development Pillars Tracking**: Visual status cards for Resume, Job Matching, Roadmap, Interview Prep, and Verified Skills.
- [x] **Unified Skill Intelligence**: 5 categorized tabs (`Strong Skills`, `Needs Improvement`, `Missing Required`, `Frequently Required`, `Recently Improved`) with cross-phase evidence levels.
- [x] **Career Progress Analytics**: Interactive responsive SVG time-series charts for Mock Interview Trend, Job Match Compatibility, and Resume ATS Score Progression without external heavy libraries.
- [x] **Personalized Actionable Recommendations**: Synthesizes candidate state into prioritized recommendation cards with one-click deep navigation.
- [x] **Chronological Recent Activity Feed**: Unified audit trail of resume uploads, analyses, job matches, roadmap progress, and mock interviews.
- [x] **Preserved Phase 2 Resume Management Dropzone**: Original resume upload, parser preview, and PDF download accessible at `/dashboard#resume-section`.
- [x] **In-App Persistent Notifications**: Notification center with topbar bell, unread badge counter, slideover drawer, mark read, mark all read, and delete endpoints.
- [x] **Reorganized 4-Section Sidebar Navigation**: `OVERVIEW`, `CAREER DEVELOPMENT`, `INTERVIEW PREPARATION`, and `ACCOUNT`.

---

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (configured with `withCredentials: true`)
- **Icons**: Lucide React
- **Visuals & Charts**: Pure Native Responsive SVG charts

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
                      │  - Redesigned SaaS Dashboard           │
                      │  - Career Readiness & SVG Charts       │
                      │  - Unified Skill Intelligence Hub      │
                      │  - Notification Center & Topbar Bell   │
                      │  - Port: 5173                          │
                      └──────────────────┬─────────────────────┘
                                         │
                    HTTP-Only Cookie /   │   CORS Credentials
                    REST API Calls       │   (JSON)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Node.js / Express Backend        │
                      │  - Authentication & Session Gateway    │
                      │  - Career Readiness Engine (Dynamic Wt)│
                      │  - Unified Skill Intelligence Service  │
                      │  - In-App Notification Controller      │
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
        │  - Notification Model         │    │  - Port: 8000                     │
        └───────────────────────────────┘    └───────────────────────────────────┘
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
│   │   │   ├── layout/       # Navbar, Footer, Sidebar (4 sections), Topbar, DashboardLayout
│   │   │   ├── notifications/# [Phase 6] NotificationBell, NotificationPanel
│   │   │   ├── dashboard/    # [Phase 6] WelcomeSection, OverviewStats, CareerReadinessCard,
│   │   │   │                 #           CareerProgressCard, SkillIntelligenceCard,
│   │   │   │                 #           AnalyticsCharts, CareerRecommendations, RecentActivity
│   │   │   ├── resume/       # ResumeSection, ResumeUploadCard, ParsedResumeView
│   │   │   └── interview/    # AnswerEvaluationCard, InterviewReportView
│   │   ├── context/          # AuthContext (session persistence, login, logout)
│   │   ├── hooks/            # useAuth hook
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx         # [Phase 6] Complete Redesigned Dashboard
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ResumeAnalysisPage.jsx
│   │   │   ├── JobMatchingPage.jsx
│   │   │   ├── CareerPathsPage.jsx
│   │   │   ├── LearningRoadmapPage.jsx
│   │   │   ├── InterviewSetupPage.jsx
│   │   │   ├── ActiveInterviewPage.jsx
│   │   │   ├── InterviewReportPage.jsx
│   │   │   ├── InterviewHistoryPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── api.js                   # Axios instance with credentials
│   │   │   ├── authService.js
│   │   │   ├── resumeService.js
│   │   │   ├── analysisService.js
│   │   │   ├── jobMatchingService.js
│   │   │   ├── interviewService.js
│   │   │   ├── dashboardService.js      # [Phase 6] Dashboard & analytics client
│   │   │   └── notificationService.js   # [Phase 6] Notifications API client
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
│   │   ├── interviewController.js
│   │   ├── dashboardController.js       # [Phase 6] Dashboard overview, readiness, skills
│   │   └── notificationController.js    # [Phase 6] Notifications CRUD controller
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
│   │   ├── InterviewSession.js
│   │   └── Notification.js              # [Phase 6] User notifications schema
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── userRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── jobMatchingRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── dashboardRoutes.js           # [Phase 6] /api/dashboard routes
│   │   └── notificationRoutes.js        # [Phase 6] /api/notifications routes
│   ├── services/
│   │   ├── aiService.js
│   │   ├── resumeParserService.js
│   │   ├── resumeService.js
│   │   ├── tokenService.js
│   │   ├── fallbackAnalysisService.js
│   │   ├── fallbackInterviewService.js
│   │   ├── jobMatchingService.js
│   │   ├── roadmapService.js
│   │   ├── careerReadinessService.js    # [Phase 6] Readiness score & renormalization
│   │   ├── dashboardService.js          # [Phase 6] Unified aggregation services
│   │   └── notificationService.js       # [Phase 6] Async notification trigger helper
│   ├── tests/
│   │   ├── ai.test.js                   # Node-to-FastAPI proxy suite (5 tests)
│   │   ├── analysis.test.js             # Resume analysis suite (12 tests)
│   │   ├── auth.test.js                 # Authentication & security suite (22 tests)
│   │   ├── interview.test.js            # Mock interview suite (9 tests)
│   │   ├── jobMatching.test.js          # Job matching & roadmap suite (11 tests)
│   │   ├── resume.test.js               # Resume upload & parsing suite (27 tests)
│   │   └── dashboard.test.js            # [Phase 6] Dashboard & notifications suite (9 tests)
│   └── app.js
│
└── ai-service/               # FastAPI AI Microservice
    ├── app/
    │   ├── routes/
    │   │   ├── health.py
    │   │   ├── analysis.py
    │   │   ├── matching.py
    │   │   └── interview.py
    │   ├── schemas/
    │   │   ├── health.py
    │   │   ├── analysis.py
    │   │   ├── matching.py
    │   │   └── interview.py
    │   ├── services/
    │   │   ├── analyzer.py
    │   │   ├── matcher.py
    │   │   ├── question_bank.py
    │   │   └── interview_service.py
    │   └── main.py
    └── tests/
        ├── test_health.py
        ├── test_analysis.py
        ├── test_matching.py
        └── test_interview.py            # AI Service test suite (35 unit tests)
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

### Dashboard & Career Readiness Endpoints (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/dashboard/overview` | Protected | Returns 6 KPI stats, welcome summary, and quick metrics |
| `GET`  | `/api/dashboard/career-readiness` | Protected | Returns overall readiness score, category breakdowns, weights, and classification |
| `GET`  | `/api/dashboard/skill-intelligence` | Protected | Returns cross-phase aggregated skills across 5 distinct categories |
| `GET`  | `/api/dashboard/analytics` | Protected | Returns time-series data for interviews, job matches, and resume scores |
| `GET`  | `/api/dashboard/recommendations` | Protected | Returns personalized, prioritized actionable career suggestions |
| `GET`  | `/api/dashboard/activities` | Protected | Returns chronological audit trail of all candidate actions |

### In-App Notification Endpoints (`/api/notifications`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/notifications` | Protected | Retrieve user's notifications (supports `?limit=20` and returns `unreadCount`) |
| `PATCH`| `/api/notifications/:id/read` | Protected | Mark a single notification as read |
| `PATCH`| `/api/notifications/read-all` | Protected | Mark all user notifications as read |
| `DELETE`| `/api/notifications/:id` | Protected | Delete a notification |

### FastAPI AI Microservice APIs (`http://localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Microservice health check probe |
| `POST` | `/interview/generate-questions` | Synthesize customized questions based on role, difficulty, and resume context |
| `POST` | `/interview/evaluate-answer` | Evaluate candidate answer using multi-factor rubric |
| `POST` | `/interview/generate-report` | Compute aggregate session statistics, score breakdown, and readiness |

---

## Career Readiness Scoring & Renormalization Engine

The **Career Readiness Score** provides candidates with an objective, data-backed assessment of their overall employability.

### 1. Five Foundation Pillars & Nominal Weights

| Pillar | Base Weight | Data Source |
|--------|-------------|-------------|
| **Resume Quality** | 20% | ATS score from Phase 3 resume analysis |
| **Job Compatibility** | 25% | Latest/Average match score from Phase 4 job descriptions |
| **Technical Skills** | 20% | Ratio of verified skills vs. market target benchmark (target: 10 skills) |
| **Learning Progress** | 15% | Average completion percentage across active Phase 4 learning roadmaps |
| **Interview Performance** | 20% | Average score across completed Phase 5 mock interview sessions |

### 2. Dynamic Weight Renormalization (Missing Data Handling)

College students and fresh accounts often begin with only a subset of activities completed (e.g., they have uploaded a resume, but have not yet taken an interview). To prevent unfair score penalization (assigning 0% for unattempted pillars):

$$\text{Career Readiness Score} = \frac{\sum_{i \in \text{Available}} S_i \times W_i}{\sum_{i \in \text{Available}} W_i}$$

Where:
- $S_i$ is the raw percentage score $(0–100)$ for category $i$.
- $W_i$ is the nominal base weight for category $i$.
- If no categories have data yet, the baseline score defaults to `0` with classification `Getting Started`.

### 3. Readiness Classifications

- **Highly Prepared (Score ≥ 80%)**: Candidate exhibits exceptional alignment across resume, skills, and mock interviews.
- **Progressing Well (Score 65–79%)**: Solid core capabilities; recommended to complete active roadmap modules and run targeted interviews.
- **Developing Skills (Score 50–64%)**: Foundation established; targeted skill acquisition and resume optimization advised.
- **Getting Started (Score < 50%)**: Early preparation phase; guided through uploading a resume and analyzing first job target.

---

## Unified Skill Intelligence Engine

Rather than displaying isolated skill tags, the Unified Skill Intelligence Engine synthesizes candidate capabilities across all phases:

```
      Phase 2 Resume Extraction ────┐
      Phase 3 ATS Analysis ─────────┼──► [Skill Normalization] ──► Unified Skill Intelligence
      Phase 4 Job Matching ─────────┤                                 ├── Strong Skills
      Phase 5 Mock Interviews ──────┘                                 ├── Needs Improvement
                                                                      ├── Missing Required
                                                                      ├── Frequently Required
                                                                      └── Recently Improved
```

### Categorization Logic:
1. **Strong Skills**: Verified in the resume AND evaluated with high proficiency ($\ge 70\%$) during mock interviews.
2. **Needs Improvement**: Required by target jobs OR tested in interviews with scores $< 70\%$.
3. **Missing Required**: Explicitly identified as missing required competencies in Phase 4 target job match analyses.
4. **Frequently Required**: High-demand skills recurring across multiple target job postings.
5. **Recently Improved**: Skills covered in recently completed learning roadmap modules.

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

---

## Testing & Verification

The platform maintains automated test suites across all layers of the monorepo:

### 1. Backend Integration & Unit Tests
Run in the `backend/` directory:
```bash
cd backend
npm test
```

**Verified Test Results (7 Test Suites, 95 Tests Passed, 0 Failed, 0 Skipped):**
- `ai.test.js`: Node.js to FastAPI communication layer & timeout resilience (5 tests)
- `analysis.test.js`: Phase 3 resume analysis, ATS scoring, and isolation (12 tests)
- `auth.test.js`: Phase 1 authentication, rate limiting, and cookie security (22 tests)
- `dashboard.test.js`: Phase 6 dashboard overview, readiness weight renormalization, skill intelligence, analytics time-series, notifications CRUD, and user isolation (9 tests)
- `interview.test.js`: Phase 5 mock interview creation, draft autosaving, answer evaluation, question navigation, completion, report generation, user isolation, and CORS (9 tests)
- `jobMatching.test.js`: Phase 4 job posting, 35/25/15/15/10 match rubric, career paths, and roadmap progress tracking (11 tests)
- `resume.test.js`: Phase 2 resume upload, magic byte validation, storage isolation, phone number extraction (+91 formats) (27 tests)

### 2. FastAPI AI Service Unit Tests
Run in the `ai-service/` directory:
```bash
cd ai-service
.\venv\Scripts\python.exe -m unittest discover tests
```
**Verified Test Results: 35 Unit Tests Passed, 0 Failed.**

### 3. Frontend Production Build
Run in the `frontend/` directory:
```bash
cd frontend
npm run build
```
**Verified: Vite production build succeeded in ~8s with zero syntax or bundling errors.**

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
- [x] **Phase 6**: Complete Dashboard Redesign, Career Intelligence & Final Platform Integration (Completed)

---

## License

ISC License © CareerLens AI Team.
