import { NextFunction, Request, Response } from 'express';
import sendResponse from '../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../errorHelpers/appError';
import { ZodError } from 'zod';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatusCode.INTERNAL_SERVER_ERROR;
  let message = err.message;

  if (err instanceof AppError) {
    console.log('yes');
    statusCode = err.statusCode;
    message = err.message;
  }

  console.log(err)

  sendResponse(res, {
    success: false,
    statusCode,
    message,
  });
};

export default globalErrorHandler;
