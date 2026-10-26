import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || (err instanceof ApiError ? err.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`, err.stack || err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};
