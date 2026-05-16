import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import { loadEnvironmentVariables } from './app/config/env';
import { AppError } from './app/errorHelpers/appError';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes/router';
import sendResponse from './app/utils/sendResponse';

const app: Application = express();

export const envVars = loadEnvironmentVariables();

const allowedOrigins = [
  envVars.FRONTEND_URL_LOCAL,
  envVars.FRONTEND_URL_PRODUCTION,
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError(401, 'Now Allowed Origin'));
    }
  },
  credentials: true,
};

// middlewares==>
app.use(express.json());
app.use(cors(corsOptions));

// router==>
app.use('/api/v1', router);

// base route==>
app.get('/', (req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatusCode.OK,
    message: 'The playground server is running',
  });
});

// global error handler==>
app.use(globalErrorHandler);

// not found==>
app.use(notFound);

export default app;
