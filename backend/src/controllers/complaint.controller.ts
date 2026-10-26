import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from '../services/complaint.service';
import { sendResponse } from '../utils/apiResponse';

export class ComplaintController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const complaints = await ComplaintService.getComplaints(user, req.query as any);
      return sendResponse(res, 200, true, 'Complaints retrieved successfully', complaints);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await ComplaintService.getComplaintById(req.params.id as string, user);
      return sendResponse(res, 200, true, 'Complaint details retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const complaint = await ComplaintService.createComplaint(userId, req.body);
      return sendResponse(res, 201, true, 'Complaint submitted successfully', complaint);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const complaint = await ComplaintService.updateComplaint(req.params.id as string, req.body);
      return sendResponse(res, 200, true, 'Complaint updated', complaint);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await ComplaintService.updateComplaintStatus(
        req.params.id as string,
        userId,
        req.body
      );
      return sendResponse(res, 200, true, 'Complaint status updated successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
