import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import sendResponse from '../utils/sendResponse';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, {
    success: false,
    statusCode: httpStatusCode.NOT_FOUND,
    message: 'Route not found',
  });
};

export default notFound;
