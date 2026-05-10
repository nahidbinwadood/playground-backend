import { NextFunction, Request, response, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AuthServices } from './auth.service';
import { removeAuthCookie, setAuthCookie } from '../../utils/setCookie';

// create user==>
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await AuthServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.CREATED,
      message: 'User created successfully',
      data: response,
    });
  }
);

// login==>
const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await AuthServices.loginUser(req.body);

    // set the cookie
    setAuthCookie(res, response?.tokens);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Login Successful',
      data: response,
    });
  }
);

// get profile==>
const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.user;
    const response = await AuthServices.getProfile(email);
    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'User data fetched successfully',
      data: response,
    });
  }
);

// update profile==>
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const payload = req.body;
    const response = await AuthServices.updateProfile(userId, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Profile updated successfully',
      data: response,
    });
  }
);

// change password==>
const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.user;

    const { oldPassword, newPassword } = req.body;
    const response = await AuthServices.changePassword({
      email,
      oldPassword,
      newPassword,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Password changed successfully',
      data: response,
    });
  }
);

// logOut==>
const logOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    removeAuthCookie(res, ['accessToken', 'refreshToken']);
    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'User Logged Out Successfully',
    });
  }
);

export const AuthControllers = {
  createUser,
  loginUser,
  getProfile,
  changePassword,
  logOut,
  updateProfile,
};
