import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import { ZodObject } from 'zod';
import { AppError } from '../errorHelpers/appError';

const validateRequest = (zodSchema: ZodObject, fileName?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file && fileName) {
        req.body = { ...req.body, [fileName]: req.file.path };
      }
      // check the empty body==>
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError(httpStatusCode.BAD_REQUEST, 'Request body is empty');
      }

      // parse the schema==>
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
