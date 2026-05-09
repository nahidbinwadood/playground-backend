import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

// create user==>
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.CREATED,
      message: 'User created successfullY',
      data: response,
    });
  }
);

// get all users==>
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await UserServices.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Users data retrieved successfullY',
      data: response,
    });
  }
);

// login==>
const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await UserServices.loginUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Login Successfull',
      data: response,
    });
  }
);
export const UserController = { getAllUsers, createUser, loginUser };
