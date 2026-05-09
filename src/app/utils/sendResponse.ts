import { Response } from 'express';

interface IResponseData<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  token?: string;
  errors?: any;
  meta?: {
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
  const { success, statusCode, message, data, token, meta, errors } =
    responseData;

  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    errors,
    data,
    token,
    meta,
  });
};

export default sendResponse;
