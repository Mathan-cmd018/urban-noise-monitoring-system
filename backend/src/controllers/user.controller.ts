import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { sendResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search } = req.query;
      const query: any = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(query).sort({ createdAt: -1 });
      return sendResponse(res, 200, true, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) throw new ApiError(404, 'User not found');
      return sendResponse(res, 200, true, 'User retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { ...(name && { name }), ...(phone && { phone }), ...(role && { role }) },
        { new: true, runValidators: true }
      );
      if (!user) throw new ApiError(404, 'User not found');
      return sendResponse(res, 200, true, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) throw new ApiError(404, 'User not found');
      return sendResponse(res, 200, true, 'User deleted successfully', { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}
