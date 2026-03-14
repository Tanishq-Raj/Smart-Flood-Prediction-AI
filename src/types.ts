export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SensorData {
  rainfall: number;       // mm/hr
  waterLevel: number;     // cm
  drainageCapacity: number; // % used
  soilMoisture: number;   // %
  temperature: number;    // Celsius
  humidity: number;       // %
  windSpeed: number;      // km/h
}

export interface RegionData {
  id: string;
  name: string;
  risk: RiskLevel;
  sensors: SensorData;
  probability: number;    // 0-100
  etaMinutes: number | null; // null if LOW
  confidence: number;     // 0-100
  x: number;             // SVG map position %
  y: number;
}

export interface ChartPoint {
  time: string;
  rainfall: number;
  waterLevel: number;
  drainage: number;
  probability: number;
}
