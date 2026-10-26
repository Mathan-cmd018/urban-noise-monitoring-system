import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  meta?: Record<string, any>
) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  });
};
