import { Request, Response, NextFunction } from 'express';
import { StationService } from '../services/station.service';
import { sendResponse } from '../utils/apiResponse';

export class StationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stations = await StationService.getAllStations(req.query as any);
      return sendResponse(res, 200, true, 'Monitoring stations retrieved', stations);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await StationService.getStationById(req.params.id as string);
      return sendResponse(res, 200, true, 'Monitoring station retrieved', station);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await StationService.createStation(req.body);
      return sendResponse(res, 201, true, 'Monitoring station created successfully', station);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await StationService.updateStation(req.params.id as string, req.body);
      return sendResponse(res, 200, true, 'Monitoring station updated successfully', station);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await StationService.deleteStation(req.params.id as string);
      return sendResponse(res, 200, true, 'Monitoring station deleted successfully', station);
    } catch (error) {
      next(error);
    }
  }
}
