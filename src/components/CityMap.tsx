import { useState, type ReactNode } from 'react';
import { X, Droplets, Gauge, Cloud, Leaf, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { RegionData } from '../types';

interface Props {
  regions: RegionData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  theme: 'light' | 'dark';
}

const RISK_COLOR = { LOW: 'var(--green)', MEDIUM: 'var(--yellow)', HIGH: 'var(--red)' };

// Pune district rough GPS polygon data for neighborhoods
const CITY_PATHS: Record<string, [number, number][]> = {
  'shivaji-nagar': [[18.535, 73.835], [18.540, 73.850], [18.525, 73.860], [18.515, 73.845]],
  'baner':         [[18.560, 73.780], [18.570, 73.795], [18.555, 73.805], [18.545, 73.790]],
  'aundh':         [[18.550, 73.800], [18.565, 73.815], [18.545, 73.830], [18.535, 73.810]],
  'wakad':         [[18.590, 73.760], [18.605, 73.775], [18.585, 73.790], [18.575, 73.770]],
  'hinjewadi':     [[18.580, 73.720], [18.595, 73.740], [18.575, 73.755], [18.565, 73.730]],
};

// Auto-fit bounds component
function MapBounds() {
  const map = useMap();
  map.fitBounds([
    [18.515, 73.720], // SW roughly
    [18.605, 73.860]  // NE roughly
  ], { padding: [20, 20] });
  return null;
}

const ACTIONS: Record<string, string[]> = {
  LOW: ['Continue standard monitoring', 'Inspect drainage outlets weekly', 'Maintain sensor calibration'],
  MEDIUM: ['Clear drainage blockages immediately', 'Alert field operations team', 'Deploy early warning SMS to residents', 'Pre-position water pumps'],
  HIGH: ['ACTIVATE EMERGENCY PROTOCOL', 'Deploy water pumps NOW', 'Evacuate low-lying zones', 'Issue public flood alert', 'Mobilize disaster response teams', 'Open emergency shelters'],
};

export default function CityMap({ regions, selectedId, onSelect, theme }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const selected = regions.find(r => r.id === selectedId);
  const active = selectedId || hoveredId;

  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 4, height: 16, background: 'var(--blue)', borderRadius: 2 }} />
          Pune Metro Live Topology
        </h2>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          {(['LOW', 'MEDIUM', 'HIGH'] as const).map(r => (
            <span key={r} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: RISK_COLOR[r], display: 'inline-block' }} />
              {r}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 48px)' }}>
        {/* SVG Map */}
        <div style={{
          flex: 1,
          borderRadius: 10,
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 280,
          zIndex: 1,
        }}>
          <MapContainer 
            center={[18.55, 73.8]} 
            zoom={12} 
            style={{ height: '100%', width: '100%', background: 'var(--map-gradient)' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              key="satellite"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              opacity={theme === 'dark' ? 0.9 : 1}
            />
            <MapBounds />

            {regions.map(region => {
              const positions = CITY_PATHS[region.id];
              const isActive = active === region.id;
              
              // CSS custom properites don't reliably work in SVG path fill depending on setup, 
              // resolving to hex or passing direct vars works in Leaflet
              const strokeColor = region.risk === 'HIGH' ? '#ef4444' : region.risk === 'MEDIUM' ? '#f59e0b' : '#10b981';
              const fillColor = region.risk === 'HIGH' ? 'rgba(239, 68, 68, 0.4)' : region.risk === 'MEDIUM' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)';

              return (
                <Polygon
                  key={region.id}
                  positions={positions}
                  pathOptions={{
                    color: strokeColor,
                    fillColor: isActive ? fillColor.replace('0.4', '0.7') : fillColor,
                    fillOpacity: 1,
                    weight: isActive ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => onSelect(selectedId === region.id ? null : region.id),
                    mouseover: () => setHoveredId(region.id),
                    mouseout: () => setHoveredId(null),
                  }}
                >
                  <LeafletTooltip direction="center" permanent className="map-tooltip" opacity={0.9}>
                    {region.name}
                  </LeafletTooltip>
                </Polygon>
              );
            })}
          </MapContainer>

          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--map-overlay)', padding: '4px 8px', borderRadius: 6,
            zIndex: 1000,
          }}>
            <Navigation size={10} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            Click region to inspect
          </div>
        </div>

        {/* Region Detail Glass Panel */}
        {selected && (
          <div className="animate-slide-in" style={{
            width: 280, flexShrink: 0,
            background: 'var(--bg-card-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${RISK_COLOR[selected.risk]}44`,
            borderRadius: 16,
            padding: 24,
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: `0 8px 32px ${RISK_COLOR[selected.risk]}22`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="heading-premium" style={{ fontWeight: 700, fontSize: 18 }}>{selected.name}</div>
                <div className={`badge badge-${selected.risk.toLowerCase()}`} style={{ marginTop: 8 }}>
                  {selected.risk} RISK
                </div>
              </div>
              <button onClick={() => onSelect(null)} style={{
                background: 'var(--border-glass-hover)', border: '1px solid var(--border-glass-hover)', color: 'var(--text-secondary)', borderRadius: '50%', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: 32, height: 32
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ReadingRow icon={<Cloud size={13} />} label="Rainfall" value={`${selected.sensors.rainfall.toFixed(1)} mm/hr`} color="var(--blue)" />
              <ReadingRow icon={<Droplets size={13} />} label="Water Level" value={`${selected.sensors.waterLevel.toFixed(1)} cm`} color="var(--cyan)" />
              <ReadingRow icon={<Gauge size={13} />} label="Drainage" value={`${selected.sensors.drainageCapacity.toFixed(0)}% used`} color="var(--yellow)" />
              <ReadingRow icon={<Leaf size={13} />} label="Soil Moisture" value={`${selected.sensors.soilMoisture.toFixed(0)}%`} color="var(--green)" />
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Recommended Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ACTIONS[selected.risk].slice(0, 4).map((a, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: 'var(--text-secondary)', padding: '5px 8px',
                    background: 'var(--bg-card)', borderRadius: 6,
                    borderLeft: `3px solid ${RISK_COLOR[selected.risk]}`,
                  }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingRow({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--reading-bg)', borderRadius: 8, border: '1px solid var(--border-glass-hover)' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
      <span className="value-premium" style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
