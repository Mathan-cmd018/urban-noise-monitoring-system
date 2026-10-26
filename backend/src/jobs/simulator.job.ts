import { MonitoringStation } from '../models/station.model';
import { NoiseService } from '../services/noise.service';
import { config } from '../config/env';

let simulationTimer: NodeJS.Timeout | null = null;
let isSimulating = false;

// Typical baseline and variance according to area type
const AREA_PROFILE: Record<string, { base: number; variance: number; spikeChance: number; spike: number }> = {
  'Silent Zone': { base: 42, variance: 8, spikeChance: 0.1, spike: 16 },
  Residential: { base: 52, variance: 10, spikeChance: 0.15, spike: 18 },
  Commercial: { base: 66, variance: 10, spikeChance: 0.25, spike: 20 },
  Industrial: { base: 76, variance: 12, spikeChance: 0.35, spike: 22 },
  'Mixed Zone': { base: 60, variance: 12, spikeChance: 0.2, spike: 18 },
};

/**
 * Generate synthetic decibel level with diurnal curves and stochastic spikes
 */
const generateRealisticDb = (areaType: string): number => {
  const profile = AREA_PROFILE[areaType] || AREA_PROFILE['Residential'];
  const hour = new Date().getHours();
  // Diurnal effect: daytime (08:00 - 20:00) is noisier by 4-8 dB
  const isDay = hour >= 6 && hour < 22;
  const diurnalShift = isDay ? 4 : -5;

  let db = profile.base + diurnalShift + (Math.random() * profile.variance - profile.variance / 2);

  // Occasional random peak/spike (e.g. horn, siren, construction rev)
  if (Math.random() < profile.spikeChance) {
    db += Math.random() * profile.spike;
  }

  // Bound decibel levels within realistic municipal thresholds (30 dB to 125 dB)
  return Math.round(Math.max(30, Math.min(125, db)) * 10) / 10;
};

let isTicking = false;

export const startNoiseSimulation = () => {
  if (isSimulating || !config.simulationEnabled) return;

  // Clear any stray timer to guarantee single-instance execution
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }

  isSimulating = true;
  console.log(`[Sensor Simulator] Active - generating simulated telemetry every ${config.simulationIntervalMs}ms`);

  const runTick = async () => {
    // Prevent overlapping ticks if previous database write is still pending
    if (isTicking) return;
    isTicking = true;

    try {
      const activeStations = await MonitoringStation.find({ status: 'Active' });
      if (activeStations.length === 0) return;

      // Pick 2 to 4 stations per tick to simulate periodic telemetry packets
      const shuffled = activeStations.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.max(2, Math.floor(activeStations.length / 2)));

      for (const station of selected) {
        const simulatedDb = generateRealisticDb(station.areaType);
        await NoiseService.recordReading({
          stationId: station.stationId,
          noiseLevel: simulatedDb,
          areaType: station.areaType,
          timestamp: new Date(),
        });
      }
    } catch (err: any) {
      console.warn('[Sensor Simulator] Tick warning:', err.message);
    } finally {
      isTicking = false;
    }
  };

  simulationTimer = setInterval(runTick, config.simulationIntervalMs);
};

export const stopNoiseSimulation = () => {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
  isSimulating = false;
  isTicking = false;
  console.log('[Sensor Simulator] Simulation stopped');
};
