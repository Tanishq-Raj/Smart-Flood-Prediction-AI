import { Activity, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import type { RegionData, SensorData } from '../types';

interface Props {
  regions: RegionData[];
  aggSensors: SensorData;
}

export default function AiInsights({ regions, aggSensors }: Props) {
  const highRiskRegions = regions.filter(r => r.risk === 'HIGH');
  const mediumRiskRegions = regions.filter(r => r.risk === 'MEDIUM');

  const getInsights = () => {
    const insights = [];
    
    // Logic for AI Insights based on data
    if (highRiskRegions.length > 0) {
      insights.push({
        type: 'critical',
        icon: <AlertTriangle size={18} className="text-red-500" style={{ color: 'var(--red)' }} />,
        text: `Critical situation in ${highRiskRegions.map(r => r.name).join(', ')}. Evacuation protocols should be on standby. Emergency drainage pumps must be deployed instantly.`,
        glow: 'var(--red-glow)'
      });
    } else if (mediumRiskRegions.length > 0) {
      insights.push({
        type: 'warning',
        icon: <TrendingUp size={18} style={{ color: 'var(--yellow)' }} />,
        text: `Elevated risk detected in ${mediumRiskRegions.length} region(s). Consider pre-positioning water pumps and clearing drainage bottlenecks.`,
        glow: 'var(--yellow-glow)'
      });
    }

    if (aggSensors.rainfall > 70) {
      insights.push({
        type: 'info',
        icon: <Activity size={18} style={{ color: 'var(--blue)' }} />,
        text: `City-wide precipitation is incredibly high (${aggSensors.rainfall.toFixed(0)} mm/hr avg). Surface runoff will overwhelm primary storm drains shortly.`,
        glow: 'var(--blue-glow)'
      });
    } else if (aggSensors.soilMoisture > 85) {
      insights.push({
        type: 'info',
        icon: <Activity size={18} style={{ color: 'var(--green)' }} />,
        text: `Soil saturation is near capacity (${aggSensors.soilMoisture.toFixed(0)}%). Any further rain will entirely result in surface flooding.`,
        glow: 'var(--green-glow)'
      });
    } else if (insights.length === 0) {
      insights.push({
        type: 'success',
        icon: <Sparkles size={18} style={{ color: 'var(--green)' }} />,
        text: `All metrics are within nominal limits. Continuous monitoring active. Drainage networks are functioning optimally.`,
        glow: 'var(--green-glow)'
      });
    }

    // Always append a generic operational insight
    insights.push({
      type: 'operational',
      icon: <Sparkles size={18} style={{ color: 'var(--cyan)' }} />,
      text: `Predictive model confidence is stable at ~80-95%. Next deep-learning recalibration in 2 hours.`,
      glow: 'var(--cyan-glow)'
    });

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 4, height: 16, background: 'var(--blue)', borderRadius: 2 }} />
        AI Predictive Insights
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {insights.map((insight, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: 14,
            padding: '16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${insight.icon.props.style.color}`,
            borderRadius: 8,
            boxShadow: `0 4px 12px ${insight.glow}`,
          }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>{insight.icon}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              {insight.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
