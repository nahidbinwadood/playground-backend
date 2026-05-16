import { loadEnvironmentVariables } from './app/config/env';
import { Server } from 'http';

import app from './app';
import { connectDB } from './app/db/connectDB';

let server: Server;

const envVars = loadEnvironmentVariables();

const PORT = envVars.PORT;
const DB_URL = envVars.DB_URL;

const startServer = async () => {
  try {
    await connectDB(DB_URL);
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

startServer();

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
process.on('unhandledRejection', (error) => {
  console.log('Unhandled error occurred', error);
  if (server) {
    startServer();
  }
});

// uncaught exception ==>
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception occurred', error);

  if (server) {
    startServer();
  }
});
