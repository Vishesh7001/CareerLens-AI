const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose
 * Reads connection URI from MONGODB_URI environment variable
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables.');
    throw new Error('MONGODB_URI must be provided.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully close database connection
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error('[Database] Error closing MongoDB connection:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };

