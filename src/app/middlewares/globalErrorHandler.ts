import { NextFunction, Request, Response } from 'express';
import sendResponse from '../utils/sendResponse';
import httpStatusCode from 'http-status-codes';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatusCode.NOT_FOUND;
  let message = 'Something went wrong';

  sendResponse(res, {
    success: false,
    statusCode,
    message,
  });
};

export default globalErrorHandler;
