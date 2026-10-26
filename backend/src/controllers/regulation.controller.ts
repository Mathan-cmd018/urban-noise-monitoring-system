import { Request, Response, NextFunction } from 'express';
import { ComplianceService } from '../services/compliance.service';
import { sendResponse } from '../utils/apiResponse';

export class RegulationController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const regulations = await ComplianceService.getRegulations();
      return sendResponse(res, 200, true, 'Regulations retrieved successfully', regulations);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const regulation = await ComplianceService.upsertRegulation({
        ...req.body,
        updatedBy: req.user?.userId,
      });
      return sendResponse(res, 201, true, 'Regulation threshold saved successfully', regulation);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const regulation = await ComplianceService.updateRegulation(req.params.id as string, {
        ...req.body,
        updatedBy: req.user?.userId,
      });
      return sendResponse(res, 200, true, 'Regulation threshold updated successfully', regulation);
    } catch (error) {
      next(error);
    }
  }
}
