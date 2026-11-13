const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start the Express Server only after successful MongoDB connection
 */
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  CareerLens AI Backend running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`  Port: ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/health`);
      console.log(`  API Base:     http://localhost:${PORT}/api`);
      console.log(`===============================================`);
    });

    // 3. Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      console.log(`\n[Process] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10s if hanging
      setTimeout(() => {
        console.error('[Process] Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('[Process] Unhandled Promise Rejection:', err);
      // In production, you may want to gracefully shut down
    });

  } catch (error) {
    console.error(`[Server] Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

