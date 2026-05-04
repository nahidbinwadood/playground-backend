import { Response } from 'express';

interface IResponseData<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  token?: string;
  meta?: {
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
  const { success, statusCode, message, data, token, meta } = responseData;

  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    token,
    meta,
  });
};

export default sendResponse;
