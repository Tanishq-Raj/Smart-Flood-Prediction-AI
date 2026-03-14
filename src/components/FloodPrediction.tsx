import { type ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Clock, Target, Activity } from 'lucide-react';
import type { RiskLevel } from '../types';

interface Props {
  risk: RiskLevel;
  probability: number;
  etaMinutes: number | null;
  confidence: number;
  elevation: number;
}

const CONFIG = {
  LOW:    { label: 'LOW RISK',    color: 'var(--green)', glow: 'var(--green-glow)',   bg: 'var(--green-dark)',   Icon: CheckCircle },
  MEDIUM: { label: 'MEDIUM RISK', color: 'var(--yellow)', glow: 'var(--yellow-glow)', bg: 'var(--yellow-dark)',  Icon: AlertTriangle },
  HIGH:   { label: 'HIGH RISK',   color: 'var(--red)',    glow: 'var(--red-glow)',     bg: 'var(--red-dark)',     Icon: AlertTriangle },
};

export default function FloodPrediction({ risk, probability, etaMinutes, confidence, elevation }: Props) {
  const cfg = CONFIG[risk];
  const { Icon } = cfg;

  return (
    <div className="card" style={{ height: '100%' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 4, height: 16, background: 'var(--blue)', borderRadius: 2 }} />
        Risk Analysis
      </h2>

      {/* Risk Indicator */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px', marginBottom: 20,
        background: `${cfg.bg}`,
        border: `2px solid ${cfg.color}44`,
        borderRadius: 12,
        boxShadow: `0 0 32px ${cfg.glow}`,
      }}>
        <Icon size={48} style={{ color: cfg.color, marginBottom: 10 }} />
        <span style={{
          fontSize: 28, fontWeight: 800, color: cfg.color,
          fontFamily: 'Outfit, sans-serif', letterSpacing: 1,
        }}>
          {cfg.label}
        </span>
        {risk === 'HIGH' && (
          <span style={{ fontSize: 13, color: cfg.color, marginTop: 6, opacity: 0.8 }}>
            ⚠️ Immediate action required
          </span>
        )}
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MetricRow icon={<Activity size={16} />} label="Flood Probability">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'var(--border)' }}>
              <div style={{
                height: '100%', borderRadius: 6,
                width: `${probability}%`,
                background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                boxShadow: `0 0 10px ${cfg.glow}`,
                transition: 'width 0.2s ease',
              }} />
            </div>
            <span className="value-premium" style={{ fontSize: 22, fontWeight: 800, color: cfg.color, minWidth: 48 }}>{probability}%</span>
          </div>
        </MetricRow>

        <MetricRow icon={<Clock size={16} />} label="Est. Time to Flooding">
          <span className="value-premium" style={{ fontSize: 20, color: cfg.color }}>
            {etaMinutes !== null ? `~${etaMinutes} min` : '—'}
          </span>
        </MetricRow>

        <MetricRow icon={<Target size={16} />} label="Model Confidence">
          <span className="value-premium" style={{ fontSize: 20, color: 'var(--blue)' }}>{confidence}%</span>
        </MetricRow>

        <MetricRow icon={<span style={{ fontSize: 14 }}>⛰️</span>} label="Area Elevation">
          <span className="value-premium" style={{ fontSize: 20, color: 'var(--text-primary)' }}>{elevation}m</span>
        </MetricRow>
      </div>
    </div>
  );
}

function MetricRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: 'var(--bg-secondary)', borderRadius: 8,
      border: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 140 }}>{label}</span>
      {children}
    </div>
  );
}
