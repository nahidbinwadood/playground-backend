import { Response } from 'express';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, tokenInfo: IAuthTokens) => {
  // set access token==>
  if (tokenInfo?.accessToken) {
    res.cookie('accessToken', tokenInfo?.accessToken, {
      httpOnly: true,
      secure: false,
    });
  }

  // set refresh token==>
  if (tokenInfo?.refreshToken) {
    res.cookie('refreshToken', tokenInfo?.refreshToken, {
      httpOnly: true,
      secure: false,
    });
  }
};

export const removeAuthCookie = (res: Response, cookieNames: string[]) => {
  cookieNames.forEach((cookie) =>
    res.clearCookie(cookie, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })
  );
};
