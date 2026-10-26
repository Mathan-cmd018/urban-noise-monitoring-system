import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { ApiError } from '../utils/apiError';
import { AuthUserPayload } from '../types';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token has expired'));
    }
    return next(new ApiError(401, 'Invalid authentication token'));
  }
};
