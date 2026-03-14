import type { RegionData, SensorData, RiskLevel, ChartPoint } from './types';

export function computeRisk(s: SensorData): { risk: RiskLevel; probability: number; etaMinutes: number | null; confidence: number } {
  // Weighted scoring
  const score =
    (s.rainfall / 100) * 35 +
    (s.waterLevel / 200) * 30 +
    (s.drainageCapacity / 100) * 25 +
    (s.soilMoisture / 100) * 10;

  const probability = Math.min(100, Math.round(score));
  const confidence = Math.min(100, Math.round(75 + Math.random() * 20));

  let risk: RiskLevel;
  let etaMinutes: number | null;

  if (probability >= 70) {
    risk = 'HIGH';
    etaMinutes = Math.round(15 + (100 - probability) * 1.2);
  } else if (probability >= 40) {
    risk = 'MEDIUM';
    etaMinutes = Math.round(60 + (70 - probability) * 3);
  } else {
    risk = 'LOW';
    etaMinutes = null;
  }

  return { risk, probability, etaMinutes, confidence };
}

const BASE_SENSORS: Record<string, SensorData> = {
  'shivaji-nagar': { rainfall: 15, waterLevel: 25, drainageCapacity: 30, soilMoisture: 40, temperature: 26, humidity: 60, windSpeed: 14 },
  'baner':         { rainfall: 5,  waterLevel: 10,  drainageCapacity: 15, soilMoisture: 20, temperature: 27, humidity: 55, windSpeed: 18 },
  'aundh':         { rainfall: 45, waterLevel: 65, drainageCapacity: 50, soilMoisture: 70, temperature: 26, humidity: 75, windSpeed: 12 },
  'wakad':         { rainfall: 2,  waterLevel: 5,  drainageCapacity: 10, soilMoisture: 15, temperature: 28, humidity: 50, windSpeed: 20 },
  'hinjewadi':     { rainfall: 10, waterLevel: 20, drainageCapacity: 25, soilMoisture: 35, temperature: 27, humidity: 65, windSpeed: 22 },
};

export function generateRegions(): RegionData[] {
  return [
    { id: 'shivaji-nagar', name: 'Shivaji Nagar', x: 50, y: 45 },
    { id: 'baner',         name: 'Baner',         x: 35, y: 32 },
    { id: 'aundh',         name: 'Aundh',         x: 25, y: 55 },
    { id: 'wakad',         name: 'Wakad',         x: 18, y: 38 },
    { id: 'hinjewadi',    name: 'Hinjewadi',     x: 10, y: 50 },
  ].map(r => {
    const base = BASE_SENSORS[r.id];
    const sensors: SensorData = {
      rainfall:         Math.max(0, base.rainfall + (Math.random() - 0.5) * 10),
      waterLevel:       Math.max(0, base.waterLevel + (Math.random() - 0.5) * 10),
      drainageCapacity: Math.min(100, Math.max(0, base.drainageCapacity + (Math.random() - 0.5) * 5)),
      soilMoisture:     Math.min(100, Math.max(0, base.soilMoisture + (Math.random() - 0.5) * 5)),
      temperature:      base.temperature + (Math.random() - 0.5) * 2,
      humidity:         Math.min(100, Math.max(0, base.humidity + (Math.random() - 0.5) * 5)),
      windSpeed:        Math.max(0, base.windSpeed + (Math.random() - 0.5) * 4),
    };
    const prediction = computeRisk(sensors);
    return { ...r, sensors, ...prediction };
  });
}

export function mutateSensors(current: SensorData): SensorData {
  return {
    rainfall:         Math.max(0, Math.min(120, current.rainfall + (Math.random() - 0.48) * 8)),
    waterLevel:       Math.max(0, Math.min(200, current.waterLevel + (Math.random() - 0.47) * 12)),
    drainageCapacity: Math.max(0, Math.min(100, current.drainageCapacity + (Math.random() - 0.47) * 6)),
    soilMoisture:     Math.max(0, Math.min(100, current.soilMoisture + (Math.random() - 0.5) * 4)),
    temperature:      Math.max(15, Math.min(45, current.temperature + (Math.random() - 0.5) * 0.5)),
    humidity:         Math.max(0, Math.min(100, current.humidity + (Math.random() - 0.5) * 2)),
    windSpeed:        Math.max(0, Math.min(100, current.windSpeed + (Math.random() - 0.5) * 3)),
  };
}

export function generateHistoryPoint(regions: RegionData[], time: string): ChartPoint {
  const avg = (key: keyof SensorData) =>
    regions.reduce((s, r) => s + r.sensors[key], 0) / regions.length;

  return {
    time,
    rainfall: Math.round(avg('rainfall') * 10) / 10,
    waterLevel: Math.round(avg('waterLevel') * 10) / 10,
    drainage: Math.round(avg('drainageCapacity') * 10) / 10,
    probability: Math.round(regions.reduce((s,r) => s + r.probability, 0) / regions.length),
  };
}
