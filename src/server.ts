import { Server } from 'http';
import app, { envVars } from './app';
import { connectDB } from './connectDB';

let server: Server;

const PORT = envVars.PORT;
const DB_URL = envVars.DB_URL;

const startServer = async () => {
  try {
    try {
      await connectDB(DB_URL);
    } catch (dbError) {
      console.error('⚠️ WARNING: Database connection failed on startup');
      console.error('The server will start, but database operations may fail');
      console.error(dbError);
    }

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
  console.log('Unhandled error occured', error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// uncaught execption ==>
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception occured', error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
