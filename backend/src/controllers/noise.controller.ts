import { Request, Response, NextFunction } from 'express';
import { NoiseService } from '../services/noise.service';
import { sendResponse } from '../utils/apiResponse';

export class NoiseController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const readings = await NoiseService.queryReadings({
        stationId: req.query.stationId as string,
        areaType: req.query.areaType as string,
        from: req.query.from as string,
        to: req.query.to as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendResponse(res, 200, true, 'Noise readings retrieved', readings);
    } catch (error) {
      next(error);
    }
  }

  static async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const latest = await NoiseService.getLatestReadings();
      return sendResponse(res, 200, true, 'Latest telemetry readings retrieved', latest);
    } catch (error) {
      next(error);
    }
  }

  static async getByStation(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const readings = await NoiseService.getReadingsByStation(req.params.stationId as string, limit);
      return sendResponse(res, 200, true, `Readings for station ${req.params.stationId}`, readings);
    } catch (error) {
      next(error);
    }
  }

  static async createReading(req: Request, res: Response, next: NextFunction) {
    try {
      const reading = await NoiseService.recordReading(req.body);
      return sendResponse(res, 201, true, 'Noise reading recorded successfully', reading);
    } catch (error) {
      next(error);
    }
  }
}
