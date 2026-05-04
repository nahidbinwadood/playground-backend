import { NextFunction, Request, Response, Router } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';

const userRoutes = Router();

// get all users==>
userRoutes.get('/', (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatusCode.OK,
    message: 'All user data retrieved successfully',
  });
});

export default userRoutes;
