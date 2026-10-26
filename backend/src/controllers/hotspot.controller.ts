import { Request, Response, NextFunction } from 'express';
import { HotspotService } from '../services/hotspot.service';
import { sendResponse } from '../utils/apiResponse';

export class HotspotController {
  static async getHotspots(_req: Request, res: Response, next: NextFunction) {
    try {
      const hotspots = await HotspotService.calculateHotspots();
      return sendResponse(res, 200, true, 'Hotspot analysis calculated successfully', hotspots);
    } catch (error) {
      next(error);
    }
  }
}
