import { NextFunction, Request, Response } from 'express';
import sendResponse from '../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../errorHelpers/appError';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

interface IErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, any>;
}

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatusCode.INTERNAL_SERVER_ERROR;
  let message = 'Something Went Wrong';
  let errors: Record<string, any> | undefined;

  // console.log('🔴 Error caught by global handler:', {
  //   name: err.name,
  //   message: err.message,
  //   type: err.constructor.name,
  //   stack: err.stack,
  // });

  // ========= CUSTOM APP ERROR=============
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    console.log('✓ Handled as AppError');
  }

  // ========= ZOD VALIDATION ERROR=============
  else if (err instanceof ZodError) {
    statusCode = httpStatusCode.BAD_REQUEST;
    message = 'Validation Error';

    // format zod errors in a readable object
    errors = err?.issues?.reduce(
      (acc, error) => {
        const path = error?.path.join('.');
        acc[path] = error?.message;
        return acc;
      },
      {} as Record<string, any>
    );

    console.log('✓ Handled as Zod Validation Error');
  }

  // ========= JWT ERROR(Token Expiration)=============
  else if (err instanceof jwt.TokenExpiredError) {
    statusCode = httpStatusCode.UNAUTHORIZED;
    message = 'Session has expired. Please login again';
  }

  // ========= JWT ERROR(Invalid Token)=============
  else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = httpStatusCode.UNAUTHORIZED;
    message = 'Invalid token. Please login again.';
    console.log('✓ Handled as Invalid Token Error');
  }

  // ========= MONGODB ERRORS=============
  // duplicate key error
  else if (err.code === 11000) {
    statusCode = httpStatusCode.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    console.log('✓ Handled as MongoDB Duplicate Error');
  }

  // Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = httpStatusCode.BAD_REQUEST;
    message = 'Validation Error';
    errors = Object.keys(err?.errors).reduce(
      (acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      },
      {} as Record<string, any>
    );
  }

  // Cast Error(Invalid Object Id)
  else if (err.name === 'CastError') {
    statusCode = httpStatusCode.BAD_REQUEST;
    message = 'Invalid Id Format';
    console.log('✓ Handled as Cast Error');
  }

  // ============ GENERIC ERRORS ============
  else if (err instanceof Error) {
    statusCode = httpStatusCode.INTERNAL_SERVER_ERROR;
    message = err.message || 'Internal Server Error';
    console.log('✓ Handled as Generic Error');
  }

  // ============ UNKNOWN ERRORS ============
  else {
    statusCode = httpStatusCode.INTERNAL_SERVER_ERROR;
    message = 'An unexpected error occurred';
    console.log('✓ Handled as Unknown Error');
  }

  // ============ SEND RESPONSE ============
  const errorResponse: IErrorResponse = {
    success: false,
    statusCode,
    message,
  };

  if (errors && Object.keys(errors).length > 0) {
    errorResponse.errors = errors;
  }

  sendResponse(res, errorResponse);
};

export default globalErrorHandler;
