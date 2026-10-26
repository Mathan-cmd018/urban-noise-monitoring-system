import { Regulation, IRegulation } from '../models/regulation.model';
import { ApiError } from '../utils/apiError';
import { AreaType } from '../types';
import { RedisService } from './redis.service';

export class ComplianceService {
  /**
   * Retrieve all regulations (from Redis cache or DB)
   */
  static async getRegulations(): Promise<IRegulation[]> {
    const cached = await RedisService.get<IRegulation[]>('regulations:all');
    if (cached) return cached;

    const regulations = await Regulation.find().sort({ areaType: 1 });
    await RedisService.set('regulations:all', regulations, 300); // 5 minutes cache
    return regulations;
  }

  /**
   * Upsert or create regulation
   */
  static async upsertRegulation(data: {
    areaType: AreaType;
    dayLimit: number;
    nightLimit: number;
    updatedBy?: string;
  }) {
    const reg = await Regulation.findOneAndUpdate(
      { areaType: data.areaType },
      {
        ...data,
        effectiveFrom: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    await RedisService.del('regulations:all');
    await RedisService.del('dashboard:overview');
    return reg;
  }

  /**
   * Update regulation by ID
   */
  static async updateRegulation(id: string, data: Partial<IRegulation>) {
    const reg = await Regulation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!reg) throw new ApiError(404, 'Regulation threshold record not found');

    await RedisService.del('regulations:all');
    await RedisService.del('dashboard:overview');
    return reg;
  }

  /**
   * Check compliance status for a given decibel level and area type at a specific time
   */
  static async evaluateCompliance(
    noiseLevel: number,
    areaType: AreaType,
    timestamp: Date = new Date()
  ): Promise<{ status: 'Compliant' | 'Warning' | 'Non-Compliant'; limit: number; excess: number }> {
    const regulations = await this.getRegulations();
    const reg = regulations.find((r) => r.areaType === areaType);

    // Sensible defaults if not in DB
    const dayLimit = reg ? reg.dayLimit : 55;
    const nightLimit = reg ? reg.nightLimit : 45;

    const hour = timestamp.getHours();
    const isDay = hour >= 6 && hour < 22;
    const limit = isDay ? dayLimit : nightLimit;

    const excess = Math.max(0, Math.round((noiseLevel - limit) * 10) / 10);

    if (noiseLevel <= limit) {
      return { status: 'Compliant', limit, excess: 0 };
    }
    if (noiseLevel <= limit + 5) {
      return { status: 'Warning', limit, excess };
    }
    return { status: 'Non-Compliant', limit, excess };
  }
}
