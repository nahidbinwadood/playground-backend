import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import envVars from '../config/env';
import { AppError } from '../errorHelpers/appError';
import httpStatusCode from 'http-status-codes';
import { User } from '../modules/user/user.model';
import { JwtPayload } from 'jsonwebtoken';
import { IsActive } from '../modules/user/user.interface';

const checkAuth = (...authRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      // throw error if no authentication token found==>
      if (!token) {
        throw new AppError(
          httpStatusCode.UNAUTHORIZED,
          'No authorization token found'
        );
      }

      const decodedToken = verifyToken(
        token,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({ _id: decodedToken?.userId });

      //throw error if the user doest not exist==>
      if (!isUserExist) {
        throw new AppError(httpStatusCode.BAD_REQUEST, 'User doest not exist');
      }

      // throw error if the user is not active==>
      if (isUserExist?.isActive !== IsActive.ACTIVE) {
        throw new AppError(
          httpStatusCode.BAD_REQUEST,
          `User is ${isUserExist?.isActive}`
        );
      }

      //throw error if the user is deleted==>
      if (isUserExist?.isDeleted) {
        throw new AppError(httpStatusCode.BAD_REQUEST, `User is Deleted`);
      }

      // throw error  if the user doesn't have permission ==>
      if (!!authRoles.length && !authRoles.includes(isUserExist?.role)) {
        throw new AppError(
          httpStatusCode.UNAUTHORIZED,
          `You dont have permission to access this feature`
        );
      }

      req.user = decodedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkAuth;
