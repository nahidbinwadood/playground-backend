import { Server } from 'http';
import app from './app';
import { connectDB } from './app/db/connectDB';
import { envVars } from './app/config/env';

let server: Server;

const PORT = envVars.PORT;
const DB_URL = envVars.DB_URL;

const startServer = async () => {
  try {
    await connectDB(DB_URL);
  } catch (error) {
    // Deliberately not fatal. A cold container that cannot reach Atlas should
    // fail only the request that needs the database (checkDBConnection answers
    // 503) and retry on the next one, instead of killing the whole invocation.
    console.error(
      '❌ Initial database connection failed — will retry per request'
    );
    console.error(error);
  }

  server = app.listen(PORT, () => {
    console.info(`🚀 Server started successfully`);
    console.info(`📡 Listening on port: ${PORT}`);
    console.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
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
