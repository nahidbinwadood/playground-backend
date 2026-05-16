import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { loadEnvironmentVariables } from './app/config/env';

let server: Server;

const envVars = loadEnvironmentVariables();

const startServer = async () => {
  try {
    const PORT = envVars.PORT;
    const DB_URL = envVars.DB_URL;

    console.info('🔄 Initializing server...');
    await mongoose.connect(DB_URL);
    console.info('✅ Database connection established successfully');
    server = app.listen(PORT, () => {
      console.info(`🚀 Server started successfully`);
      console.info(`📡 Listening on port: ${PORT}`);
      console.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server');
    console.error(error);
    process.exit(1);
  }
};

(async () => {
  await startServer();
})();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received...Server is shutting down');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received...Server is shutting down');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// unhandled error==>
process.on('unhandledRejection', (err) => {
  startServer();
});

// uncaught exception==>
process.on('uncaughtException', (err) => {
  startServer();
});

export default envVars;
