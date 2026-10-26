import { NoiseReading } from '../models/noiseReading.model';
import { MonitoringStation } from '../models/station.model';
import { RedisService } from './redis.service';
import { ApiError } from '../utils/apiError';
import { AreaType } from '../types';

export class NoiseService {
  /**
   * Record a new noise reading, update station level, and cache in Redis
   */
  static async recordReading(data: {
    stationId: string;
    noiseLevel: number;
    timestamp?: Date;
    areaType?: AreaType;
  }) {
    const station = await MonitoringStation.findOne({ stationId: data.stationId });
    if (!station) {
      throw new ApiError(404, `Station with ID '${data.stationId}' not found`);
    }

    const areaType = data.areaType || station.areaType;
    const timestamp = data.timestamp || new Date();

    const reading = await NoiseReading.create({
      stationId: data.stationId,
      noiseLevel: data.noiseLevel,
      timestamp,
      areaType,
    });

    // Update station current level
    station.currentNoiseLevel = data.noiseLevel;
    station.lastUpdated = timestamp;
    await station.save();

    // Cache latest reading in Redis
    const cacheKey = `noise:latest:${data.stationId}`;
    await RedisService.set(
      cacheKey,
      {
        stationId: data.stationId,
        stationName: station.name,
        noiseLevel: data.noiseLevel,
        areaType,
        timestamp,
      },
      120 // 2 minutes TTL
    );

    // Invalidate dashboard and hotspot cache
    await RedisService.del('dashboard:overview');
    await RedisService.del('hotspots:current');

    return reading;
  }

  /**
   * Get all latest readings for all stations (served from Redis or DB)
   */
  static async getLatestReadings() {
    const stations = await MonitoringStation.find().sort({ stationId: 1 });
    const results = await Promise.all(
      stations.map(async (st) => {
        const cached = await RedisService.get(`noise:latest:${st.stationId}`);
        if (cached) return cached;

        return {
          stationId: st.stationId,
          stationName: st.name,
          noiseLevel: st.currentNoiseLevel,
          areaType: st.areaType,
          timestamp: st.lastUpdated,
          latitude: st.latitude,
          longitude: st.longitude,
          status: st.status,
        };
      })
    );
    return results;
  }

  /**
   * Get time-series readings for a specific station
   */
  static async getReadingsByStation(stationId: string, limit = 50) {
    return NoiseReading.find({ stationId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  /**
   * Query readings with filtering
   */
  static async queryReadings(filter: {
    stationId?: string;
    areaType?: string;
    from?: string;
    to?: string;
    limit?: number;
  }) {
    const query: any = {};
    if (filter.stationId) query.stationId = filter.stationId;
    if (filter.areaType) query.areaType = filter.areaType;
    if (filter.from || filter.to) {
      query.timestamp = {};
      if (filter.from) query.timestamp.$gte = new Date(filter.from);
      if (filter.to) query.timestamp.$lte = new Date(filter.to);
    }

    const limit = filter.limit ? Math.min(filter.limit, 200) : 50;
    return NoiseReading.find(query).sort({ timestamp: -1 }).limit(limit);
  }
}
