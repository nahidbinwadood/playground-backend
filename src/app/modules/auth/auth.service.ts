import { AppError } from '../../errorHelpers/appError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import httpStatusCode from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/jwt';
import { envVars } from '../../config/env';

// create user==>
const createUser = async (payload: Partial<IUser>) => {
  const isExist = await User.findOne({ email: payload.email });
  // throw error if the user exists==>
  if (isExist) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      'User already exist with this email'
    );
  }

  // hash the password
  payload.password = await bcrypt.hash(
    payload.password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  // create user==>
  const user = await User.create({ ...payload });

  const { password, ...rest } = user?.toObject();
  return rest;
};

// login user==>
const loginUser = async (payload: Partial<IUser>) => {
  const isExist = await User.findOne({ email: payload.email });

  // throw error is the email doest match==>
  if (!isExist) {
    throw new AppError(
      httpStatusCode.NOT_FOUND,
      'No user found with this email'
    );
  }

  const passwordMatch = await bcrypt.compare(
    payload.password as string,
    isExist?.password as string
  );

  // throw error if the password is not matched==>
  if (!passwordMatch) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      'The email or password doesn’t seem right. Please double-check and try again 🔁'
    );
  }

  const { password, ...rest } = isExist.toObject();

  const userTokens = generateToken(isExist);

  return {
    ...rest,
    tokens: {
      accessToken: userTokens?.accessToken,
      refreshToken: userTokens?.refreshToken,
    },
  };
};

// get profile==>
const getProfile = async (email: string) => {
  const isExist = await User.findOne({ email });

  // throw the error if the user not found==>
  if (!isExist) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'User not found');
  }

  const { password, ...rest } = isExist.toObject();

  return {
    ...rest,
  };
};

// update profile==>
const updateProfile = async (userId: string, payload: Partial<IUser>) => {
  const response = await User.findByIdAndUpdate(userId, payload, {
    returnDocument: 'after',
  });

  if (response) {
    const { password, ...updatedResponse } = response.toObject();
    return updatedResponse;
  }
};

// change password==>
const changePassword = async (payload: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) => {
  const isExist = await User.findOne({ email: payload.email });

  // throw the error if the user not found==>
  if (!isExist) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'User not found');
  }

  const userData = isExist?.toObject();

  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  // throw error if the old password doest not match==>
  if (!isPasswordMatched) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      'Your old password is incorrect'
    );
  }

  const isNewPasswordIsSameAsOldPassword = await bcrypt.compare(
    payload.newPassword,
    userData?.password
  );
  //throw error if new password and old password is same==>
  if (isNewPasswordIsSameAsOldPassword) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      'New Password cannot be same as the old password'
    );
  }

  // hash the password==>
  const updatedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  // update the password==>
  const response = await User.findOneAndUpdate(
    { email: payload.email },
    { password: updatedPassword },
    { returnDocument: 'after' }
  );

  if (response) {
    const { password, ...updatedResponse } = response?.toObject();
    return updatedResponse;
  }
};

export const AuthServices = {
  createUser,
  loginUser,
  getProfile,
  changePassword,
  updateProfile,
};
