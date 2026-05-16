import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import sendResponse from '../utils/sendResponse';
import { connectDB, getDBStatus } from '../db/connectDB';
import { envVars } from '../../app';

const checkDBConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // If already connected, proceed immediately
  if (getDBStatus()) {
    return next();
  }

  // Connection dropped (e.g. Atlas idle timeout) — try to reconnect once
  try {
    console.warn('⚠️ DB not connected on request. Attempting reconnect...');
    await connectDB(envVars.DB_URL);
    return next();
  } catch {
    sendResponse(res, {
      success: false,
      statusCode: httpStatusCode.SERVICE_UNAVAILABLE,
      message: 'Database connection failed. Please try again later.',
    });
  }
};

export default checkDBConnection;
