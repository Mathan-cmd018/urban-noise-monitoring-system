import { MonitoringStation } from '../models/station.model';
import { NoiseReading } from '../models/noiseReading.model';
import { Complaint } from '../models/complaint.model';
import { ComplianceService } from './compliance.service';
import { RedisService } from './redis.service';

export class HotspotService {
  /**
   * Aggregate station telemetry, breach frequency, and complaint density to detect hotspots
   */
  static async calculateHotspots() {
    const cached = await RedisService.get('hotspots:current');
    if (cached) return cached;

    const stations = await MonitoringStation.find();
    const regulations = await ComplianceService.getRegulations();

    // Look at last 24 hours of data
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const hotspots = await Promise.all(
      stations.map(async (st) => {
        // Find readings in past 24h
        const readings = await NoiseReading.find({
          stationId: st.stationId,
          timestamp: { $gte: past24h },
        });

        // Find complaints near station location or referencing area
        const complaintCount = await Complaint.countDocuments({
          $or: [
            { location: { $regex: st.location.split(',')[0], $options: 'i' } },
            { description: { $regex: st.name, $options: 'i' } },
          ],
        });

        const reg = regulations.find((r) => r.areaType === st.areaType);
        const dayLimit = reg ? reg.dayLimit : 55;

        let avgDb = st.currentNoiseLevel;
        let maxDb = st.currentNoiseLevel;
        let violations = 0;

        if (readings.length > 0) {
          const sum = readings.reduce((acc, r) => acc + r.noiseLevel, 0);
          avgDb = Math.round((sum / readings.length) * 10) / 10;
          maxDb = Math.max(...readings.map((r) => r.noiseLevel));
          violations = readings.filter((r) => r.noiseLevel > dayLimit).length;
        } else {
          if (st.currentNoiseLevel > dayLimit) violations = 1;
        }

        // Determine Risk Score & Severity
        // Score based on average dB, violations count, and complaints count
        let riskScore = 0;
        if (avgDb > 75) riskScore += 3;
        else if (avgDb > 65) riskScore += 2;
        else if (avgDb > 55) riskScore += 1;

        if (violations > 10) riskScore += 3;
        else if (violations > 3) riskScore += 2;
        else if (violations > 0) riskScore += 1;

        if (complaintCount > 5) riskScore += 3;
        else if (complaintCount > 1) riskScore += 2;
        else if (complaintCount > 0) riskScore += 1;

        let riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
        if (riskScore >= 7) riskLevel = 'Severe';
        else if (riskScore >= 5) riskLevel = 'High';
        else if (riskScore >= 3) riskLevel = 'Moderate';

        return {
          stationId: st.stationId,
          area: st.name,
          location: st.location,
          areaType: st.areaType,
          latitude: st.latitude,
          longitude: st.longitude,
          currentDb: st.currentNoiseLevel,
          averageDb: avgDb,
          maxDb: maxDb,
          violationCount: violations,
          complaintCount,
          riskLevel,
          riskScore,
        };
      })
    );

    // Sort by risk descending
    const sorted = hotspots.sort((a, b) => b.riskScore - a.riskScore);

    // Cache calculation in Redis for 60 seconds
    await RedisService.set('hotspots:current', sorted, 60);

    return sorted;
  }
}
