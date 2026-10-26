import { MonitoringStation, IMonitoringStation } from '../models/station.model';
import { ApiError } from '../utils/apiError';
import { RedisService } from './redis.service';

export class StationService {
  static async getAllStations(query: { areaType?: string; status?: string } = {}) {
    const filter: any = {};
    if (query.areaType) filter.areaType = query.areaType;
    if (query.status) filter.status = query.status;

    return MonitoringStation.find(filter).sort({ name: 1 });
  }

  static async getStationById(id: string) {
    const station = await MonitoringStation.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { stationId: id }],
    });
    if (!station) throw new ApiError(404, 'Monitoring station not found');
    return station;
  }

  static async createStation(data: Partial<IMonitoringStation>) {
    const exists = await MonitoringStation.findOne({ stationId: data.stationId });
    if (exists) throw new ApiError(409, `Station ID '${data.stationId}' already exists`);

    const station = await MonitoringStation.create(data);
    await RedisService.del('dashboard:overview');
    return station;
  }

  static async updateStation(id: string, data: Partial<IMonitoringStation>) {
    const station = await MonitoringStation.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { stationId: id }] },
      data,
      { new: true, runValidators: true }
    );
    if (!station) throw new ApiError(404, 'Monitoring station not found');
    await RedisService.del('dashboard:overview');
    return station;
  }

  static async deleteStation(id: string) {
    const station = await MonitoringStation.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { stationId: id }] },
    );
    if (!station) throw new ApiError(404, 'Monitoring station not found');
    await RedisService.del('dashboard:overview');
    return station;
  }
}
