import { NextFunction, Request, Response } from 'express';
import { parseAsync, ZodError, ZodObject } from 'zod';
import { AppError } from '../errorHelpers/appError';
import httpStatusCode from 'http-status-codes';
import sendResponse from '../utils/sendResponse';

const validateRequest = (zodSchema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check the empty body==>
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError(httpStatusCode.BAD_REQUEST, 'Request body is empty');
      }
      // parse the schema==>
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      // console.log()
      if (error instanceof ZodError) {

        console.log("ZodError",error?.issues)
        const formattedErrors = error?.issues?.map((err) => ({
          path: err?.path?.join(', '),
          message: err?.message,
        }));

        sendResponse(res, {
          success: false,
          statusCode: httpStatusCode.BAD_GATEWAY,
          message: 'Validation Error',
          errors: formattedErrors,
        });
      }

      next(error);
    }
  };
};

export default validateRequest;
