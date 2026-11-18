const mongoose = require('mongoose');

/**
 * Serverless global connection cache
 * Preserves the database connection across warm Vercel serverless invocations
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB database using Mongoose with serverless connection pooling
 * Reads connection URI from MONGODB_URI environment variable
 */
const connectDB = async () => {
  // 1. If connection is already established and active (readyState 1 = connected)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // 2. Return cached connection if available
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables.');
    throw new Error('MONGODB_URI must be provided.');
  }

  // 3. Initiate new connection if promise is not already in-flight
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10, // Restrict connection pool to prevent exhausting MongoDB Atlas M0 free tier (max 500)
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[Database] MongoDB connected successfully: ${m.connection.host}`);
      return m;
    });
  }

  try {
    const m = await cached.promise;
    cached.conn = m.connection;

    // Attach event listeners once
    if (!mongoose.connection.listeners('error').length) {
      mongoose.connection.on('error', (err) => {
        console.error('[Database] MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
        cached.conn = null;
        cached.promise = null;
      });
    }

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully close database connection and reset cache
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    cached.conn = null;
    cached.promise = null;
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error('[Database] Error closing MongoDB connection:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };


