import { type ReactNode } from 'react';
import { Cloud, Droplets, Gauge, Leaf, TrendingUp, TrendingDown, Minus, Thermometer, Wind, Droplet } from 'lucide-react';
import type { SensorData } from '../types';

interface Props {
  sensors: SensorData;
  prevSensors?: SensorData;
}

function Trend({ current, prev }: { current: number; prev?: number }) {
  if (!prev) return <Minus size={14} className="text-muted" />;
  const diff = current - prev;
  if (diff > 0.5) return <TrendingUp size={14} style={{ color: 'var(--red)' }} />;
  if (diff < -0.5) return <TrendingDown size={14} style={{ color: 'var(--green)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-muted)' }} />;
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  percent: number;
  color: string;
  glow: string;
  current: number;
  prev?: number;
  low: string;
  high: string;
}

function MetricCard({ icon, label, value, unit, percent, color, glow, current, prev, low, high }: MetricCardProps) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            border: `1.5px solid ${color}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
            boxShadow: `0 0 16px ${color}33`,
          }}>
            {icon}
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
        </div>
        <Trend current={current} prev={prev} />
      </div>
      <div className="value-premium" style={{ fontSize: 42, marginTop: 8, color: 'var(--text-primary)' }}>
        {value}
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 6 }}>{unit}</span>
      </div>
      <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: 'var(--border)' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${Math.min(100, percent)}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 12px ${glow}`,
          transition: 'width 0.2s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Low: <span style={{ color: 'var(--text-secondary)' }}>{low}</span></span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>High: <span style={{ color: 'var(--text-secondary)' }}>{high}</span></span>
      </div>
    </div>
  );
}

export default function SensorPanel({ sensors, prevSensors }: Props) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 4, height: 16, background: 'var(--blue)', borderRadius: 2 }} />
        Live Sensor Intelligence
      </h2>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <MetricCard
          icon={<Cloud size={18} />}
          label="Rainfall Intensity"
          value={sensors.rainfall.toFixed(1)}
          unit="mm/hr"
          percent={(sensors.rainfall / 120) * 100}
          color="var(--blue)"
          glow="var(--blue-glow)"
          current={sensors.rainfall}
          prev={prevSensors?.rainfall}
          low={(sensors.rainfall * 0.82).toFixed(1)}
          high={(sensors.rainfall * 1.35).toFixed(1)}
        />
        <MetricCard
          icon={<Droplets size={18} />}
          label="Water Level"
          value={sensors.waterLevel.toFixed(1)}
          unit="cm"
          percent={(sensors.waterLevel / 200) * 100}
          color="var(--cyan)"
          glow="rgba(0,212,255,0.3)"
          current={sensors.waterLevel}
          prev={prevSensors?.waterLevel}
          low={(sensors.waterLevel * 0.95).toFixed(1)}
          high={(sensors.waterLevel * 1.15).toFixed(1)}
        />
        <MetricCard
          icon={<Gauge size={18} />}
          label="Drainage Capacity"
          value={sensors.drainageCapacity.toFixed(0)}
          unit="% used"
          percent={sensors.drainageCapacity}
          color="var(--yellow)"
          glow="var(--yellow-glow)"
          current={sensors.drainageCapacity}
          prev={prevSensors?.drainageCapacity}
          low={(sensors.drainageCapacity * 0.9).toFixed(0)}
          high={(sensors.drainageCapacity * 1.05).toFixed(0)}
        />
        <MetricCard
          icon={<Leaf size={18} />}
          label="Soil Moisture"
          value={sensors.soilMoisture.toFixed(0)}
          unit="%"
          percent={sensors.soilMoisture}
          color="var(--green)"
          glow="var(--green-glow)"
          current={sensors.soilMoisture}
          prev={prevSensors?.soilMoisture}
          low={(sensors.soilMoisture * 0.88).toFixed(0)}
          high={(sensors.soilMoisture * 1.08).toFixed(0)}
        />
        <MetricCard
          icon={<Thermometer size={18} />}
          label="Temperature"
          value={sensors.temperature.toFixed(1)}
          unit="°C"
          percent={(sensors.temperature / 50) * 100}
          color="var(--orange, #f97316)"
          glow="rgba(249, 115, 22, 0.3)"
          current={sensors.temperature}
          prev={prevSensors?.temperature}
          low={(sensors.temperature - 4).toFixed(1)}
          high={(sensors.temperature + 5).toFixed(1)}
        />
        <MetricCard
          icon={<Droplet size={18} />}
          label="Humidity"
          value={sensors.humidity.toFixed(0)}
          unit="%"
          percent={sensors.humidity}
          color="var(--purple, #a855f7)"
          glow="rgba(168, 85, 247, 0.3)"
          current={sensors.humidity}
          prev={prevSensors?.humidity}
          low={(sensors.humidity * 0.85).toFixed(0)}
          high={(sensors.humidity * 1.1).toFixed(0)}
        />
        <MetricCard
          icon={<Wind size={18} />}
          label="Wind Speed"
          value={sensors.windSpeed.toFixed(1)}
          unit="km/h"
          percent={(sensors.windSpeed / 100) * 100}
          color="var(--teal, #14b8a6)"
          glow="rgba(20, 184, 166, 0.3)"
          current={sensors.windSpeed}
          prev={prevSensors?.windSpeed}
          low={(Math.max(0, sensors.windSpeed - 12)).toFixed(1)}
          high={(sensors.windSpeed + 18).toFixed(1)}
        />
      </div>
    </div>
  );
}
