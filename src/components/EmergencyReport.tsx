import { useState } from 'react';
import { Download, Share2, AlertTriangle, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import type { RegionData, RiskLevel } from '../types';

interface Props {
  regions: RegionData[];
}

function formatTime() {
  return new Date().toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function getReportFor(region: RegionData) {
  const actions: Record<RiskLevel, string[]> = {
    LOW: [
      'Continue routine monitoring of all sensors',
      'Inspect and clear drainage outlets within 48 hours',
      'Distribute flood preparedness advisories to residents',
      'Maintain emergency equipment in ready state',
    ],
    MEDIUM: [
      'Deploy field inspection teams to affected zones immediately',
      'Clear all drainage blockages within 2 hours',
      'Pre-position water pumps at strategic locations',
      'Issue Level-1 public flood advisory via SMS & sirens',
      'Alert District Collector and NDRF coordination cell',
      'Suspend traffic in identified low-lying areas',
    ],
    HIGH: [
      '🚨 ACTIVATE FULL EMERGENCY RESPONSE PROTOCOL',
      'Evacuate all residents from flood-prone zones immediately',
      'Deploy maximum pump capacity — prioritize underpasses',
      'Dispatch NDRF teams and rescue boats to site',
      'Issue Level-3 Emergency Alert — all media channels',
      'Open designated emergency shelters & relief camps',
      'Coordinate with state disaster management authority',
      'Establish command post at Municipal Corporation HQ',
    ],
  };

  return {
    id: `SFPAI-${Date.now().toString(36).toUpperCase()}`,
    timestamp: formatTime(),
    region: region.name,
    risk: region.risk,
    probability: region.probability,
    etaMinutes: region.etaMinutes,
    confidence: region.confidence,
    sensors: region.sensors,
    actions: actions[region.risk],
    contributors: [
      `Rainfall: ${region.sensors.rainfall.toFixed(1)} mm/hr (${region.sensors.rainfall > 60 ? 'Critical' : region.sensors.rainfall > 30 ? 'Elevated' : 'Normal'})`,
      `Water Level: ${region.sensors.waterLevel.toFixed(1)} cm (${region.sensors.waterLevel > 130 ? 'Danger zone' : region.sensors.waterLevel > 80 ? 'High' : 'Normal'})`,
      `Drainage: ${region.sensors.drainageCapacity.toFixed(0)}% utilised (${region.sensors.drainageCapacity > 80 ? 'Near capacity' : region.sensors.drainageCapacity > 50 ? 'Moderate load' : 'Adequate'})`,
      `Soil Saturation: ${region.sensors.soilMoisture.toFixed(0)}% (${region.sensors.soilMoisture > 80 ? 'Saturated' : region.sensors.soilMoisture > 60 ? 'Moist' : 'Normal'})`,
    ],
  };
}

const RISK_COLOR: Record<RiskLevel, string> = { LOW: 'var(--green)', MEDIUM: 'var(--yellow)', HIGH: 'var(--red)' };

export default function EmergencyReport({ regions }: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('shivaji-nagar');
  const [expanded, setExpanded] = useState(true);

  const activeRegions = regions.filter(r => r.risk !== 'LOW');
  const displayRegions = activeRegions.length > 0 ? activeRegions : regions;
  const selected = displayRegions.find(r => r.id === selectedRegionId) || displayRegions[0];
  if (!selected) return null;

  const report = getReportFor(selected);
  const RiskIcon = selected.risk === 'LOW' ? CheckCircle : AlertTriangle;

  const handleDownload = () => {
    const content = `
SMART FLOOD PREDICTION AI — EMERGENCY REPORT
============================================
Report ID: ${report.id}
Generated: ${report.timestamp}

LOCATION: ${report.region}
RISK LEVEL: ${report.risk}
FLOOD PROBABILITY: ${report.probability}%
${report.etaMinutes ? `EST. TIME TO FLOODING: ~${report.etaMinutes} minutes` : ''}
MODEL CONFIDENCE: ${report.confidence}%

ENVIRONMENTAL FACTORS:
${report.contributors.map(c => `• ${c}`).join('\n')}

RECOMMENDED ACTIONS:
${report.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

--- OFFICIAL USE ONLY | Smart Urban Flood Prediction AI ---
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SFPAI_Report_${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card" style={{
      border: selected.risk !== 'LOW' ? `1px solid ${RISK_COLOR[selected.risk]}44` : undefined,
      boxShadow: selected.risk === 'HIGH' ? '0 0 30px var(--red-glow)' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 4, height: 16, background: 'var(--blue)', borderRadius: 2 }} />
          AI Emergency Protocol Response
        </h2>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Region selector */}
          <select
            value={selectedRegionId}
            onChange={e => setSelectedRegionId(e.target.value)}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', borderRadius: 6, padding: '6px 10px',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            {displayRegions.map(r => (
              <option key={r.id} value={r.id}>{r.name} — {r.risk}</option>
            ))}
          </select>

          <button className="btn btn-outline" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button className="btn btn-outline" onClick={handleDownload}>
            <Download size={14} /> Download
          </button>
          <button className="btn btn-outline" onClick={() => alert('Report shared via NDMA emergency channel!')}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-slide-in" style={{
          background: 'var(--bg-secondary)', borderRadius: 10,
          border: '1px solid var(--border)', padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {/* Report Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                SMART FLOOD PREDICTION AI — OFFICIAL REPORT
              </div>
              <div className="heading-premium" style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                Emergency Assessment — {report.region}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16, fontFamily: 'monospace' }}>
                <span><Clock size={12} style={{ marginRight: 4, verticalAlign: '-1px', display: 'inline' }} />{report.timestamp}</span>
                <span>ID: {report.id}</span>
              </div>
            </div>

            <div style={{
              padding: '12px 24px',
              border: `2px solid ${RISK_COLOR[selected.risk]}`,
              borderRadius: 12,
              textAlign: 'center',
              background: `rgba(var(--${selected.risk.toLowerCase()}-rgb), 0.1)`,
              boxShadow: `0 0 20px ${RISK_COLOR[selected.risk]}44`,
            }}>
              <RiskIcon size={24} style={{ color: RISK_COLOR[selected.risk], margin: '0 auto 6px' }} />
              <div className="value-premium" style={{ fontSize: 18, fontWeight: 800, color: RISK_COLOR[selected.risk] }}>
                {report.risk}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>RISK LEVEL</div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 8 }}>
            {[
              { label: 'Flood Probability', value: `${report.probability}%`, color: RISK_COLOR[selected.risk] },
              { label: 'Model Confidence', value: `${report.confidence}%`, color: 'var(--blue)' },
              { label: 'Est. Flooding Time', value: report.etaMinutes ? `~${report.etaMinutes} min` : 'Not imminent', color: report.etaMinutes ? 'var(--yellow)' : 'var(--text-muted)' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '20px',
                background: 'var(--reading-bg)', borderRadius: 12,
                border: '1px solid var(--border-glass-hover)', textAlign: 'center',
              }}>
                <div className="value-premium" style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Contributing factors */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
              <MapPin size={16} /> Key Environmental Factors
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.contributors.map((c, i) => {
                const isCritical = c.includes('Critical') || c.includes('Danger');
                return (
                  <div key={i} style={{
                    fontSize: 14, color: isCritical ? 'var(--red)' : 'var(--text-secondary)', padding: '12px 16px',
                    background: 'var(--reading-bg)', borderRadius: 8,
                    borderLeft: `3px solid ${isCritical ? 'var(--red)' : 'var(--blue)'}`,
                    border: '1px solid var(--border-glass-hover)',
                    display: 'flex', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: isCritical ? 600 : 400 }}>{c.split('(')[0]}</span>
                    <span style={{ fontWeight: isCritical ? 700 : 500 }}>{c.includes('(') ? `(${c.split('(')[1]}` : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Actions */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Recommended Actions for Authorities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.actions.map((action, i) => {
                const isUrgent = action.startsWith('🚨');
                return (
                  <div key={i} className={isUrgent ? "animate-pulse" : ""} style={{
                    fontSize: 14, color: isUrgent ? 'var(--red)' : 'var(--text-secondary)',
                    padding: '12px 16px', display: 'flex', gap: 12,
                    background: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'var(--reading-bg)',
                    borderRadius: 8,
                    border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-glass-hover)'}`,
                    fontWeight: isUrgent ? 700 : 400,
                  }}>
                    <span style={{ color: isUrgent ? 'var(--red)' : 'var(--blue)', fontWeight: 600 }}>{isUrgent ? <AlertTriangle size={18} /> : `${i + 1}.`}</span>
                    <span>{isUrgent ? action.replace('🚨 ', '') : action}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            OFFICIAL USE ONLY | Smart Urban Flood Prediction AI | Pune Municipal Corporation
          </div>
        </div>
      )}
    </div>
  );
}
