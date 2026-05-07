import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import sendResponse from './app/utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import router from './app/routes/router';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();

// middlewares==>
app.use(express.json());
app.use(cors());

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
