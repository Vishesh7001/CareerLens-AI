const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFound } = require('./middleware/notFoundMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Allowed origins
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration supporting credentials (cookies)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl, postman) or matching origin
    if (!origin || origin === clientUrl || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser for HTTP-only JWT
app.use(cookieParser());

// Base Health Check endpoints
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

