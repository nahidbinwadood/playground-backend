import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { IsActive, IUser } from '../modules/user/user.interface';
import envVars from '../config/env';
import { AppError } from '../errorHelpers/appError';
import httpStatusCode from 'http-status-codes';
import { User } from '../modules/user/user.model';

export const generateToken = (data: Partial<IUser>) => {
  const payload = {
    userId: data?.id,
    email: data?.email,
    role: data?.role,
  };

  // generate access token==>
  const accessToken = jwt.sign(payload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: envVars.JWT_ACCESS_EXPIRES,
  } as SignOptions);

  // generate refresh token==>
  const refreshToken = jwt.sign(payload, envVars.JWT_REFRESH_SECRET, {
    expiresIn: envVars.JWT_REFRESH_EXPIRES,
  } as SignOptions);

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const createNewAccessToken = async (refreshToken: string) => {
  const isVerified = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload;

  // throw error if the access token is invalid==>
  if (!isVerified) {
    throw new AppError(httpStatusCode.BAD_REQUEST, 'Invalid Access Token');
  }

  const isUserExist = await User.findOne({ email: isVerified?.email });

  // throw error if the user doest not exist==>
  if (!isUserExist) {
    throw new AppError(httpStatusCode.UNAUTHORIZED, 'User doest not exist');
  }

  // throw error if the user is not active==>
  if (isUserExist?.isActive !== IsActive.ACTIVE) {
    throw new AppError(
      httpStatusCode.BAD_GATEWAY,
      `User is ${isUserExist?.isActive}`
    );
  }

  // throw error if the user is deleted==>
  if (isUserExist?.isDeleted) {
    throw new AppError(
      httpStatusCode.BAD_GATEWAY,
      `User is ${isUserExist?.isDeleted}`
    );
  }

  const newAccessToken = generateToken(isUserExist);
  return newAccessToken;
};
