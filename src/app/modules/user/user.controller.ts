import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

// get all users==>
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await UserServices.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Users data retrieved successfully',
      data: response,
    });
  }
);

export const UserController = { getAllUsers };
