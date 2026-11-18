const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const jobRoutes = require('./routes/jobRoutes');
const careerRoutes = require('./routes/careerRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFound } = require('./middleware/notFoundMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

const app = express();

// Trust reverse proxy (Vercel / Cloudflare / Nginx) for accurate client IP and secure HTTPS cookies
app.set('trust proxy', 1);

// Allowed origins list (explicitly configured domains)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Helper to add comma-separated or single domain strings
const addOrigins = (originStr) => {
  if (!originStr) return;
  originStr.split(',').map((url) => url.trim().replace(/\/+$/, '')).forEach((url) => {
    if (url && !allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
};

addOrigins(process.env.CLIENT_URL);
addOrigins(process.env.ALLOWED_ORIGINS);

// Trusted frontend project preview prefix (allows this project's frontend preview deployments e.g. careerlens-frontend-*.vercel.app, while rejecting arbitrary *.vercel.app domains)
const frontendProjectSlug = (process.env.FRONTEND_PROJECT_NAME || process.env.FRONTEND_PREVIEW_SLUG || 'careerlens-frontend').toLowerCase();
const frontendPreviewRegex = new RegExp(`^https:\\/\\/${frontendProjectSlug}(-[a-z0-9-]+)?\\.vercel\\.app$`, 'i');

/**
 * Validate incoming Origin header:
 * 1. Allow non-browser requests (no origin header, e.g. curl, server-to-server)
 * 2. Allow exact matches in allowedOrigins (controlled by CLIENT_URL and ALLOWED_ORIGINS)
 * 3. Allow trusted project-specific Vercel preview deployments (strictly scoped to the frontend project slug)
 */
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (frontendPreviewRegex.test(origin)) return true;
  return false;
};

// CORS configuration supporting credentials (cookies / authorization headers)
const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser for HTTP-only JWT
app.use(cookieParser());

// Base Health Check endpoints (respond instantly without database dependency)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CareerLens AI Backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CareerLens AI Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Database connection readiness middleware for serverless invocations
// Ensures MongoDB connection is ready before protected and data-dependent routes execute
app.use(async (req, res, next) => {
  // 1. If connection is already open, proceed immediately
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return next();
  }

  // 2. Health check endpoints respond instantly without database dependency
  if (
    req.path === '/health' ||
    req.path === '/api/health' ||
    req.path === '/api/ai/health'
  ) {
    return next();
  }

  // 3. In automated test environment without MONGODB_URI, allow mock/unit tests without DB to pass
  if (process.env.NODE_ENV === 'test' && !process.env.MONGODB_URI) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[Database Middleware] Connection error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please try again shortly.',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

