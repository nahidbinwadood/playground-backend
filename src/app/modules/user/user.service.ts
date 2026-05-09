import { AppError } from '../../errorHelpers/appError';
import { IUser } from './user.interface';
import { User } from './user.model';
import httpStatusCode from 'http-status-codes';
import envVars from '../../config/env';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/jwt';

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

// get all users==>
const getAllUsers = async () => {
  const allUsers = await User.find({}).select('-password');

  return allUsers;
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
    isExist?.password as string,
    payload.password as string
  );

  // throw error if the password is not matched==>
  if (passwordMatch) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      'The email or password doesn’t seem right. Please double-check and try again 🔁'
    );
  }

  const jwtPayload = {
    userId: isExist?._id,
    email: isExist?.email,
    role: isExist?.role,
  };

  const token = generateToken(
    jwtPayload,
    envVars.JWT_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return {
    token,
  };
};

export const UserServices = {
  getAllUsers,
  createUser,
  loginUser,
};
