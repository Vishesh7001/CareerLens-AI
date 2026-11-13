# CareerLens AI — Modern AI-Powered Career Guidance & Resume Intelligence Platform

> **"Your Career. Your Potential. Your Future."**

CareerLens AI is an enterprise-grade, full-stack platform engineered to empower modern job seekers with advanced AI analytics, deep resume intelligence, skill gap identification, and precision career path mapping.

This repository represents **Phase 1: Foundation, Project Architecture & Authentication**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Phase 1 Objectives & Deliverables](#phase-1-objectives--deliverables)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Monorepo Directory Structure](#monorepo-directory-structure)
6. [Prerequisites](#prerequisites)
7. [Environment Variables Setup](#environment-variables-setup)
8. [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
9. [Step-by-Step Installation & Running Guide](#step-by-step-installation--running-guide)
   - [Running the Express Backend](#1-running-the-express-backend)
   - [Running the React Frontend](#2-running-the-react-frontend)
   - [Running the FastAPI AI Microservice](#3-running-the-fastapi-ai-microservice)
10. [API Endpoint Documentation](#api-endpoint-documentation)
11. [Authentication & Security Flow](#authentication--security-flow)
12. [Testing & Verification](#testing--verification)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Roadmap (Future Phases)](#roadmap-future-phases)

---

## Project Overview

CareerLens AI transforms how professionals navigate their career trajectories. By unifying high-performance web engineering with microservice-driven AI analytics, CareerLens AI provides candidates with deep ATS-aligned resume reviews, real-time market skill gap diagnostics, and hyper-personalized career roadmaps.

Phase 1 establishes the rock-solid architectural core:
- A responsive, SaaS-style **React (Vite) + Tailwind CSS** frontend.
- A secure **Express.js + Node.js** main application backend with HTTP-only cookie JWT authentication and MongoDB Atlas persistence.
- An independent **FastAPI + Python** AI microservice ready to receive machine learning models in subsequent phases.
- A production-conscious **Node.js-to-FastAPI communication layer** using native `fetch()` and `AbortController` timeout management.

---

## Phase 1 Objectives & Deliverables

- [x] **Monorepo Architecture**: Clean separation between `frontend/`, `backend/`, and `ai-service/`.
- [x] **Authentication Engine**: Bcrypt password encryption (salt factor 12), JWT issuance, HTTP-only cookies (preventing client-side token exposure via XSS), and `SameSite` attribute controls paired with CORS origin whitelisting.
- [x] **Node.js-to-FastAPI Communication**: Built-in `fetch()` proxy layer with `AbortController` timeout handling, safe error classification, and Express route `GET /api/ai/health`.
- [x] **Protected Routes**: Client-side route guards and server-side middleware verifying active sessions across page reloads.
- [x] **MongoDB Integration**: Robust Mongoose schemas, unique email index, field validation, and connection error handling.
- [x] **User Profile Management**: Authenticated users can view details and update their name; email remains locked in Phase 1 for credential integrity.
- [x] **FastAPI Microservice**: Standalone service featuring CORS, OpenAPI/Swagger documentation, and a monitored `/health` endpoint.
- [x] **Responsive UI/UX**: Full desktop sidebar, tablet collapsible mode, mobile drawer navigation, single-column responsive auth forms, and touch-friendly controls without unnecessary visual clutter.
- [x] **Automated Testing Suite**: 26 automated integration and unit tests across 2 test suites covering authentication, session lifecycle, security boundaries, rate limiting, and AI microservice communication.

---

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (configured with `withCredentials: true`)
- **Icons**: Lucide React

### Main Application Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & HTTP-only cookies (`cookie-parser`)
- **Security & Password Hashing**: `bcryptjs`, `express-rate-limit`, CORS origin whitelist
- **Microservice Communication**: Node.js native `fetch()` with `AbortController`
- **Environment**: `dotenv`

### AI Backend Microservice
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
                      │  - Port: 5173                          │
                      └──────────────────┬─────────────────────┘
                                         │
                   HTTP-Only Cookie /    │   CORS Credentials
                   REST API Calls        │   (JSON)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Node.js / Express Backend        │
                      │  - Authentication & Session Gateway    │
                      │  - Rate Limiting & User Management     │
                      │  - AI Gateway Proxy Service            │
                      │  - Port: 5000                          │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                 Mongoose ODM │ (TLS Encrypted)        │ Node.js fetch()
                              ▼                        │ (AbortController Timeout)
       ┌───────────────────────────────┐               ▼
       │         MongoDB Atlas         │    ┌───────────────────────────────────┐
       │  - Clustered Database Storage │    │      FastAPI AI Microservice      │
       │  - Unique Index & User Models │    │  - High-Speed Python ASGI Service │
       └───────────────────────────────┘    │  - Health Endpoint & Swagger Docs │
                                            │  - Port: 8000                     │
                                            └───────────────────────────────────┘
```

---

## Monorepo Directory Structure

```
CareerLens-Ai/
├── .env.example              # Root environment template
├── .gitignore                # Global git ignore configuration
├── package.json              # Monorepo management scripts
├── README.md                 # Complete documentation
│
├── frontend/                 # React (Vite) Client
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/       # Button, Input, Card, LoadingSpinner
│   │   │   └── layout/       # Navbar, Footer, Sidebar, Topbar, DashboardLayout
│   │   ├── context/          # AuthContext (login, register, logout, session persistence)
│   │   ├── hooks/            # useAuth hook
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   ├── api.js         # Axios instance with credentials
│   │   │   └── authService.js # API calls for auth and user profile
│   │   ├── utils/
│   │   │   └── validation.js  # Form validation & password strength
│   │   ├── App.jsx            # Route definitions
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind base directives
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                  # Express.js Application Server
│   ├── config/
│   │   └── db.js              # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── aiController.js    # AI microservice status dispatcher
│   │   ├── authController.js  # Register, Login, GetMe, Logout
│   │   └── userController.js  # GetProfile, UpdateProfile
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT & Cookie verification
│   │   ├── errorMiddleware.js     # Centralized error handler
│   │   ├── notFoundMiddleware.js  # 404 handler
│   │   └── rateLimitMiddleware.js # Brute-force rate limiter
│   ├── models/
│   │   └── User.js            # Mongoose User schema & bcrypt hooks
│   ├── routes/
│   │   ├── aiRoutes.js        # /api/ai endpoints
│   │   ├── authRoutes.js      # /api/auth endpoints
│   │   └── userRoutes.js      # /api/users endpoints
│   ├── services/
│   │   ├── aiService.js       # Node.js-to-FastAPI fetch client & timeout
│   │   └── tokenService.js    # JWT generation & cookie helpers
│   ├── utils/
│   │   └── generateToken.js   # JWT & cookie configuration
│   ├── tests/
│   │   ├── ai.test.js         # AI communication test suite (5 tests)
│   │   └── auth.test.js       # Authentication & security test suite (21 tests)
│   ├── app.js                 # Express app initialization
│   ├── server.js              # Server entry point
│   ├── package.json
│   └── .env.example
│
└── ai-service/               # FastAPI AI Microservice
    ├── app/
    │   ├── routes/
    │   │   ├── __init__.py
    │   │   └── health.py      # GET /health endpoint
    │   ├── schemas/
    │   │   ├── __init__.py
    │   │   └── health.py      # Pydantic response models
    │   ├── services/          # Future AI modules
    │   ├── __init__.py
    │   └── main.py            # FastAPI app & CORS setup
    ├── requirements.txt
    ├── .env.example
    └── README.md
```

---

## Prerequisites

Ensure you have the following installed on your host system:
- **Node.js**: v18.0.0 or higher (Tested on Node.js v24.21.0)
- **npm**: v9.0.0 or higher (Tested on npm 11.19.0)
- **Python**: v3.10 or higher (Tested on Python 3.14.7)
- **MongoDB Atlas** account (or local MongoDB for development)

---

## Environment Variables Setup

### 1. Root / Monorepo
Create a `.env` file from the example in the project root:
```bash
copy .env.example .env    # Windows
cp .env.example .env      # Linux/macOS
```

### 2. Backend (`backend/.env`)
Create `backend/.env` with your actual MongoDB connection string, JWT secret, and microservice URL:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/careerlens?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

### 3. Frontend (`frontend/.env`)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. AI Service (`ai-service/.env`)
Create `ai-service/.env`:
```env
AI_SERVICE_PORT=8000
NODE_ENV=development
```

---

## MongoDB Atlas Setup Guide

To connect the backend to MongoDB Atlas:

1. **Sign in to MongoDB Atlas**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Cluster**:
   - Choose the free **M0 Sandbox** tier.
   - Select your preferred cloud provider and region.
3. **Configure Database User**:
   - Under **Security** > **Database Access**, click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username and secure password (e.g. `careerlens_admin`).
   - Grant the role **Read and write to any database**.
4. **Configure Network Access**:
   - Under **Security** > **Network Access**, click **Add IP Address**.
   - **Recommended:** Click **Add Current IP Address** to restrict cluster access exclusively to your workstation's IP address.
   - *Note on dynamic IP environments:* If your local development environment has a frequently rotating IP address, `0.0.0.0/0` (Allow Access from Anywhere) can be used as a temporary fallback, but restricting to specific IPs or CIDR blocks is the recommended security best practice.
5. **Get Connection String**:
   - Go to **Database Deployments** > Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/careerlens?retryWrites=true&w=majority`).
6. **Paste into `backend/.env`**:
   - Replace `<username>` and `<password>` with your database user credentials.

---

## Step-by-Step Installation & Running Guide

### Quick Start (Single Command — Runs All Services)

To launch the entire CareerLens AI platform (React Frontend, Express Backend, and FastAPI AI Microservice) simultaneously with unified colored logs and clean process termination:

1. **Install Root Dependencies**:
   ```bash
   npm install
   ```

2. **Start All Services**:
   ```bash
   npm run dev
   ```

This command uses `concurrently` to launch all three services in parallel:
- **`[frontend]`**: React Vite development server at `http://localhost:5173`
- **`[backend]`**: Express Node.js server with nodemon at `http://localhost:5000`
- **`[ai-service]`**: FastAPI microservice via `ai-service/venv/Scripts/python.exe` at `http://localhost:8000`

Pressing `Ctrl + C` in the terminal stops all three development processes cleanly (`--kill-others`).

---

### Alternative: Running Services Independently

You can also run each service independently in separate terminals.

### 1. Running the Express Backend

Open Terminal 1:
```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:5000`.
- Health Check: `http://localhost:5000/health`
- API Base: `http://localhost:5000/api`
- AI Microservice Gateway Health: `http://localhost:5000/api/ai/health`

### 2. Running the React Frontend

Open Terminal 2:
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.
Open `http://localhost:5173` in your browser to view the application.

### 3. Running the FastAPI AI Microservice

Open Terminal 3:
```bash
cd ai-service

# (Optional but recommended) Create virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The AI microservice starts on `http://localhost:8000`.
- Health Check: `http://localhost:8000/health`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

---

## API Endpoint Documentation

### Express Backend APIs (`http://localhost:5000`)

#### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body |
|--------|----------|--------|-------------|--------------|
| `POST` | `/api/auth/register` | Public | Register new user account | `{ fullName, email, password, confirmPassword }` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue cookie | `{ email, password, rememberMe }` |
| `GET`  | `/api/auth/me` | Protected | Verify active session & return user info | *None (Cookie or Bearer token)* |
| `POST` | `/api/auth/logout` | Public/Protected | Clear auth cookie | *None* |

#### User Profile Endpoints (`/api/users`)

| Method | Endpoint | Access | Description | Request Body |
|--------|----------|--------|-------------|--------------|
| `GET`  | `/api/users/profile` | Protected | Get authenticated user profile | *None (Cookie or Bearer token)* |
| `PUT`  | `/api/users/profile` | Protected | Update full name (email is locked) | `{ fullName }` |

#### AI Microservice Gateway Endpoints (`/api/ai`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/ai/health` | Public | Express forwards health probe to FastAPI via `fetch()` with timeout and returns unified status |

#### System Health Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/health` | Public | Backend server health status |
| `GET`  | `/api/health` | Public | Backend API health status |

---

### FastAPI AI Microservice APIs (`http://localhost:8000`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/health` | Public | Microservice health check |
| `GET`  | `/docs`   | Public | Interactive Swagger UI |
| `GET`  | `/redoc`  | Public | OpenAPI documentation |

#### Expected Direct Response (`GET http://localhost:8000/health`):
```json
{
  "status": "healthy",
  "service": "CareerLens AI",
  "message": "AI service is running"
}
```

#### Expected Express Gateway Response (`GET http://localhost:5000/api/ai/health`):
```json
{
  "success": true,
  "status": "healthy",
  "message": "AI microservice is healthy and reachable",
  "aiService": {
    "status": "healthy",
    "service": "CareerLens AI",
    "message": "AI service is running"
  }
}
```

---

## Authentication & Security Flow

CareerLens AI implements a defense-in-depth security approach combining cookie-based token handling with server-side validations:

```
[User Form] ──(POST /api/auth/login)──▶ [Express Backend]
                                              │
                                     (Verify password with bcrypt)
                                              │
                                     (Sign JWT with JWT_SECRET)
                                              │
[Browser] ◀── Set-Cookie: token=...; HttpOnly; SameSite=Lax ──┘
    │
    │  (Subsequent Requests: withCredentials: true)
    ▼
[Axios API] ──(GET /api/auth/me)──▶ [authMiddleware]
                                              │
                                     (Reads req.cookies.token)
                                     (Verifies & attaches req.user)
                                              │
[React AuthContext] ◀── { user: { id, fullName, email } } ──┘
```

1. **XSS Protection (HTTP-Only Cookies)**:
   Authentication tokens are set with the `httpOnly: true` flag. This prevents client-side JavaScript from accessing the raw token via `document.cookie`, mitigating credential theft from Cross-Site Scripting (XSS).
2. **CSRF Mitigation (SameSite & CORS)**:
   Cookies are configured with `sameSite: 'lax'` in development and `sameSite: 'none'` with `secure: true` in production over HTTPS. Combined with strict server-side CORS origin checking (`origin: CLIENT_URL`), this prevents unauthorized third-party sites from executing arbitrary authenticated state mutations.
3. **Password Security**:
   Passwords are never stored in plain text. They are hashed using `bcryptjs` with 12 salt rounds before database persistence. User queries automatically omit the password hash.
4. **Brute-Force Rate Limiting**:
   Authentication routes (`/api/auth/register`, `/api/auth/login`) are protected by `express-rate-limit` to prevent brute-force credential stuffing.
5. **Session Verification & Refresh**:
   On page refresh or app reload, `AuthContext` calls `GET /api/auth/me`. The server verifies the cookie and returns the active user profile, maintaining session continuity without manual token handling in localStorage.

---

## Testing & Verification

The project includes an automated test suite executed via the Node.js native test runner (`node:test`) and an in-memory MongoDB server (`MongoMemoryServer`):

```bash
cd backend
npm test
```

### Verified Test Results (2 Suites, 26 Passed, 0 Failed, 0 Skipped):

```
▶ CareerLens AI - Node.js to FastAPI Communication Layer
  ✔ 1. GET /api/ai/health returns 200 and healthy status when FastAPI is running
  ✔ 2. GET /api/ai/health returns 503 when FastAPI service is unavailable
  ✔ 3. checkAiServiceHealth handles timeout via AbortController safely
  ✔ 4. checkAiServiceHealth handles upstream HTTP error (e.g. 500) safely
  ✔ 5. checkAiServiceHealth handles invalid JSON response safely
✔ CareerLens AI - Node.js to FastAPI Communication Layer (5 tests passed)

▶ CareerLens AI - Backend Authentication & Integration Suite
  ✔ 1 & 4. Health Check Endpoint works
  ✔ Validation: Invalid email format is rejected with 400
  ✔ Validation: Short password is rejected with 400
  ✔ Validation: Password mismatch is rejected with 400
  ✔ 5 & 7. User can register successfully, receives cookie, password is encrypted
  ✔ 6. Duplicate email registration is rejected with 409 Conflict
  ✔ 8. User can log in successfully and receive auth cookie
  ✔ 9. Incorrect password is rejected with 401
  ✔ 10. Protected routes reject unauthenticated requests with 401
  ✔ 11, 12 & 15. Authenticated session check via cookie and Bearer header works
  ✔ 13. User can update their full name, but cannot change email
  ✔ 14. Logout clears the HTTP-only cookie
  ✔ 16. Expired JWT sessions are handled gracefully with 401
  ✔ Scenario 1: Invalid JWT token should return HTTP 401
  ✔ Scenario 2: Expired JWT token should continue returning HTTP 401 on profile endpoint
  ✔ Scenario 3: Accessing /api/users/profile without authentication should return HTTP 401
  ✔ Scenario 4: Accessing /api/auth/me with a token belonging to a non-existent user should return HTTP 401
  ✔ Scenario 5: API responses must never expose the user's hashed or plain-text password
  ✔ Scenario 6: Profile update with invalid fullName types (number, object, null) should be rejected safely
  ✔ Scenario 7: Verify that rate limiting works and returns HTTP 429 after configured limit is exceeded
  ✔ Scenario 8: Verify that logout returns the correct cookie-clearing instructions
✔ CareerLens AI - Backend Authentication & Integration Suite (21 tests passed)

ℹ tests 26
ℹ suites 2
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

To test the frontend production build:
```bash
cd frontend
npm run build
```
Builds cleanly with zero errors.

To test the FastAPI health check directly:
```bash
cd ai-service
python -c "from fastapi.testclient import TestClient; from app.main import app; client = TestClient(app); res = client.get('/health'); print(res.status_code, res.json())"
```

---

## Troubleshooting Guide

### 1. MongoDB Connection Fails
- **Symptom**: `[Database] MongoDB connection failed: connect ECONNREFUSED` or MONGODB_URI error.
- **Solution**:
  1. Confirm your `backend/.env` file exists and contains `MONGODB_URI`.
  2. In MongoDB Atlas, verify your IP address is whitelisted under **Network Access** (use **Add Current IP Address**).
  3. Verify your database username and password do not contain unencoded special characters.

### 2. AI Microservice Returns 503 / 504 on `/api/ai/health`
- **Symptom**: `GET /api/ai/health` returns `{ "success": false, "status": "unhealthy", "message": "AI microservice is unavailable or unreachable" }`.
- **Solution**:
  1. Ensure the FastAPI microservice is running (`uvicorn app.main:app --port 8000`).
  2. Verify `AI_SERVICE_URL=http://127.0.0.1:8000` is defined in `backend/.env`.
  3. Check whether port 8000 is accessible from your local terminal via `curl http://127.0.0.1:8000/health`.

### 3. CORS Errors in Frontend
- **Symptom**: `Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`.
- **Solution**:
  - Check that `CLIENT_URL=http://localhost:5173` is defined in `backend/.env`.
  - Ensure `withCredentials: true` is enabled in `frontend/src/services/api.js`.

### 4. Cookies Not Stored in Browser
- **Symptom**: User logs in but is redirected back to login on refresh.
- **Solution**:
  - In development (`NODE_ENV=development`), cookies use `secure: false` and `sameSite: 'lax'`.
  - Ensure you are accessing frontend at `http://localhost:5173` (do not mix `localhost` and `127.0.0.1` origins).

### 5. FastAPI Port Already in Use
- **Symptom**: `[Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)`.
- **Solution**:
  - Change `AI_SERVICE_PORT=8001` in `ai-service/.env`, update `AI_SERVICE_URL=http://127.0.0.1:8001` in `backend/.env`, and restart services.

---

## Roadmap (Future Phases)

- **Phase 2**: Resume Parsing & ATS Intelligence Engine (FastAPI + NLP)
- **Phase 3**: Semantic Job Matching & Relevance Scoring
- **Phase 4**: Skill Gap Diagnostics & Course Recommendation Pathways
- **Phase 5**: Dynamic Multi-Year Career Roadmaps & Trajectory Projections
- **Phase 6**: AI Behavioral & Technical Mock Interview Simulator
- **Phase 7**: Analytics Dashboard & Exportable Resume Optimizer

---

## License

ISC License © CareerLens AI Team.
