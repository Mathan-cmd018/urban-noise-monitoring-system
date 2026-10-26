import { MonitoringStation } from '../models/station.model';
import { NoiseReading } from '../models/noiseReading.model';
import { Complaint } from '../models/complaint.model';
import { ComplianceService } from './compliance.service';
import { HotspotService } from './hotspot.service';
import { RedisService } from './redis.service';

export class AnalyticsService {
  /**
   * Fast summary dashboard overview metrics (cached in Redis)
   */
  static async getOverview() {
    const cached = await RedisService.get('dashboard:overview');
    if (cached) return cached;

    const [stations, complaints, hotspots] = await Promise.all([
      MonitoringStation.find(),
      Complaint.find(),
      HotspotService.calculateHotspots(),
    ]);

    const totalStations = stations.length;
    const activeComplaints = complaints.filter(
      (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
    ).length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;

    const totalNoise = stations.reduce((acc, s) => acc + s.currentNoiseLevel, 0);
    const avgCurrentNoise =
      totalStations > 0 ? Math.round((totalNoise / totalStations) * 10) / 10 : 0;

    const highRiskHotspots = hotspots.filter(
      (h: any) => h.riskLevel === 'High' || h.riskLevel === 'Severe'
    ).length;

    // Evaluate compliance percentage across active stations
    let compliantCount = 0;
    for (const st of stations) {
      const evaluation = await ComplianceService.evaluateCompliance(
        st.currentNoiseLevel,
        st.areaType
      );
      if (evaluation.status === 'Compliant') compliantCount++;
    }
    const compliancePercentage =
      totalStations > 0 ? Math.round((compliantCount / totalStations) * 1000) / 10 : 100;

    const overview = {
      totalStations,
      currentAverageNoise: avgCurrentNoise,
      activeComplaints,
      resolvedComplaints,
      noiseHotspots: highRiskHotspots,
      compliancePercentage,
      lastCalculated: new Date(),
    };

    // Cache in Redis for 30s
    await RedisService.set('dashboard:overview', overview, 30);
    return overview;
  }

  /**
   * Noise Analytics with time-series trends and distributions
   */
  static async getNoiseAnalytics() {
    const readings = await NoiseReading.find().sort({ timestamp: -1 }).limit(300);
    const stations = await MonitoringStation.find();

    const levels = readings.map((r) => r.noiseLevel);
    const avgNoise =
      levels.length > 0
        ? Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10
        : 58;
    const maxNoise = levels.length > 0 ? Math.max(...levels) : 75;
    const minNoise = levels.length > 0 ? Math.min(...levels) : 38;

    // Group readings by area type
    const areaStats: Record<string, { total: number; count: number; max: number }> = {};
    for (const r of readings) {
      if (!areaStats[r.areaType]) {
        areaStats[r.areaType] = { total: 0, count: 0, max: 0 };
      }
      areaStats[r.areaType].total += r.noiseLevel;
      areaStats[r.areaType].count += 1;
      areaStats[r.areaType].max = Math.max(areaStats[r.areaType].max, r.noiseLevel);
    }

    const areaAverages = Object.entries(areaStats).map(([area, data]) => ({
      area,
      avgDb: Math.round((data.total / data.count) * 10) / 10,
      maxDb: data.max,
      readingsCount: data.count,
    }));

    // Time trend (chronological)
    const timeTrend = readings
      .slice(0, 30)
      .reverse()
      .map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stationId: r.stationId,
        noiseLevel: r.noiseLevel,
        areaType: r.areaType,
      }));

    return {
      summary: {
        averageNoise: avgNoise,
        maximumNoise: maxNoise,
        minimumNoise: minNoise,
        totalReadingsRecorded: readings.length,
      },
      areaAverages,
      timeTrend,
    };
  }

  /**
   * Complaint Analytics: Category breakdowns, statuses, and resolution velocities
   */
  static async getComplaintAnalytics() {
    const complaints = await Complaint.find();

    const total = complaints.length;
    const pending = complaints.filter(
      (c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Assigned' || c.status === 'In Progress'
    ).length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const rejected = complaints.filter((c) => c.status === 'Rejected').length;

    // Group by category
    const categoryCounts: Record<string, number> = {};
    for (const c of complaints) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
    const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // Group by status
    const statusCounts: Record<string, number> = {};
    for (const c of complaints) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    }
    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      total,
      pending,
      resolved,
      rejected,
      byCategory,
      byStatus,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }

  /**
   * Compliance Analytics: Area-wise violation rates and time compliance
   */
  static async getComplianceAnalytics() {
    const stations = await MonitoringStation.find();
    const regulations = await ComplianceService.getRegulations();

    const areaCompliance = await Promise.all(
      stations.map(async (st) => {
        const evaluation = await ComplianceService.evaluateCompliance(
          st.currentNoiseLevel,
          st.areaType
        );
        return {
          stationId: st.stationId,
          name: st.name,
          areaType: st.areaType,
          currentNoiseLevel: st.currentNoiseLevel,
          permissibleLimit: evaluation.limit,
          excess: evaluation.excess,
          status: evaluation.status,
        };
      })
    );

    const compliant = areaCompliance.filter((a) => a.status === 'Compliant').length;
    const warning = areaCompliance.filter((a) => a.status === 'Warning').length;
    const nonCompliant = areaCompliance.filter((a) => a.status === 'Non-Compliant').length;

    return {
      overallCompliancePercentage:
        stations.length > 0 ? Math.round((compliant / stations.length) * 1000) / 10 : 100,
      breakdown: {
        compliant,
        warning,
        nonCompliant,
        total: stations.length,
      },
      regulations,
      stationComplianceList: areaCompliance,
    };
  }
}
