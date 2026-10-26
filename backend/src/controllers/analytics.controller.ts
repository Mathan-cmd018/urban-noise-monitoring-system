import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendResponse } from '../utils/apiResponse';

export class AnalyticsController {
  static async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await AnalyticsService.getOverview();
      return sendResponse(res, 200, true, 'Dashboard overview metrics retrieved', overview);
    } catch (error) {
      next(error);
    }
  }

  static async getNoiseAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const noise = await AnalyticsService.getNoiseAnalytics();
      return sendResponse(res, 200, true, 'Noise telemetry analytics retrieved', noise);
    } catch (error) {
      next(error);
    }
  }

  static async getComplaintAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const complaints = await AnalyticsService.getComplaintAnalytics();
      return sendResponse(res, 200, true, 'Complaint statistics retrieved', complaints);
    } catch (error) {
      next(error);
    }
  }

  static async getComplianceAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const compliance = await AnalyticsService.getComplianceAnalytics();
      return sendResponse(res, 200, true, 'Regulatory compliance metrics retrieved', compliance);
    } catch (error) {
      next(error);
    }
  }
}
