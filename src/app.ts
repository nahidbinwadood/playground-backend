import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import { loadEnvironmentVariables } from './app/config/env';
import checkDBConnection from './app/middlewares/checkDBConnection';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes/router';
import sendResponse from './app/utils/sendResponse';
import { getDBStatus } from './app/db/connectDB';

const app: Application = express();

export const envVars = loadEnvironmentVariables();

// const allowedOrigins = [
//   envVars.FRONTEND_URL_LOCAL,
//   envVars.FRONTEND_URL_PRODUCTION,
// ].filter(Boolean) as string[];

// const corsOptions = {
//   origin: (origin: string | undefined, callback: any) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new AppError(401, 'Now Allowed Origin'));
//     }
//   },
//   credentials: true,
// };

// middlewares==>
app.use(express.json());
app.use(cors());

// router==>
app.use('/api/v1', checkDBConnection, router);

// base route==>
app.get('/', (req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatusCode.OK,
    message: 'The playground server is running',
  });
});

// health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = getDBStatus();

  sendResponse(res, {
    success: dbStatus,
    statusCode: dbStatus
      ? httpStatusCode.OK
      : httpStatusCode.SERVICE_UNAVAILABLE,
    message: dbStatus
      ? 'Server is healthy and database is connected'
      : 'Server is running but database connection failed',
    data: {
      server: 'running',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

// Debug endpoint - remove after testing
app.get('/debug', (req: Request, res: Response) => {
  const dbUrl = envVars.DB_URL;
  const masked = dbUrl.replace(/:([^@]+)@/, ':***@');

  res.json({
    dbUrlMasked: masked,
    dbConnected: getDBStatus(),
    nodeEnv: process.env.NODE_ENV,
  });
});

// not found==>
app.use(notFound);

// global error handler==>
app.use(globalErrorHandler);

export default app;
