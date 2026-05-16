import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import { getDBStatus } from '../db/connectDB';
import sendResponse from '../utils/sendResponse';

const checkDBConnection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!getDBStatus()) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatusCode.SERVICE_UNAVAILABLE,
      message: 'Database connection failed. Please try again later.',
    });
    return;
  }

  next();
};

export default checkDBConnection;
