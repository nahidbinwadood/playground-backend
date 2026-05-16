import { Response } from 'express';
import envVars from '../../server';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, tokenInfo: IAuthTokens) => {
  // set access token==>
  if (tokenInfo?.accessToken) {
    res.cookie('accessToken', tokenInfo?.accessToken, {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // set refresh token==>
  if (tokenInfo?.refreshToken) {
    res.cookie('refreshToken', tokenInfo?.refreshToken, {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
};

export const removeAuthCookie = (res: Response, cookieNames: string[]) => {
  cookieNames.forEach((cookie) =>
    res.clearCookie(cookie, {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    })
  );
};
