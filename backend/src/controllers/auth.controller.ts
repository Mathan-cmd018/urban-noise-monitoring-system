import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/apiResponse';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendResponse(res, 201, true, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendResponse(res, 200, true, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getCurrentUser(req.user!.userId);
      return sendResponse(res, 200, true, 'Current user profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }
}
