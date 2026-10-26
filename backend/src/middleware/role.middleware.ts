import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { UserRole } from '../types';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized access: user not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
