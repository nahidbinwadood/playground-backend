import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import { ZodObject } from 'zod';
import { AppError } from '../errorHelpers/appError';
import { uploadImageToCloudinary } from '../config/cloudinary.config';
import { isAllowedImage } from '../utils/isAllowedImage';

const validateRequest = (zodSchema: ZodObject, fileName?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file && fileName) {
        // reject before uploading so a spoofed mimetype never reaches Cloudinary
        if (!isAllowedImage(req.file.buffer)) {
          throw new AppError(
            httpStatusCode.BAD_REQUEST,
            'Only JPEG, PNG, GIF or WEBP images are allowed'
          );
        }
        // keep url on req.file.path so globalErrorHandler can clean up on later errors
        req.file.path = await uploadImageToCloudinary(req.file.buffer);
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
