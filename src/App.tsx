import { useState, useEffect, useCallback, useRef } from 'react';
import SensorPanel from './components/SensorPanel';
import FloodPrediction from './components/FloodPrediction';
import CityMap from './components/CityMap';
import Charts from './components/Charts';
import EmergencyReport from './components/EmergencyReport';
import AiInsights from './components/AiInsights';
import type { RegionData, SensorData, ChartPoint } from './types';
import { generateRegions, mutateSensors, computeRisk, generateHistoryPoint } from './simulation';
import { Activity, Wifi, Shield, Bell, BellOff, RefreshCw, Radio, Moon, Sun } from 'lucide-react';
import './index.css';

const ELEVATIONS: Record<string, number> = {
  'shivaji-nagar': 560,
  'baner': 580,
  'aundh': 555,
  'wakad': 590,
  'hinjewadi': 575,
};

function getTimeLabel() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function App() {
  const [regions, setRegions] = useState<RegionData[]>(generateRegions);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [alertMuted, setAlertMuted] = useState(false);
  const [tick, setTick] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const prevSensors = useRef<SensorData | null>(null);
  const [currentSensors, setCurrentSensors] = useState<SensorData | null>(null);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  // Init history
  useEffect(() => {
    const initial: ChartPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const t = new Date(Date.now() - i * 1000);
      initial.push({
        time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rainfall: 30 + Math.random() * 50,
        waterLevel: 50 + Math.random() * 80,
        drainage: 30 + Math.random() * 50,
        probability: 20 + Math.random() * 40,
      });
    }
    setHistory(initial);
  }, []);

  // Simulation tick every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setRegions(prev => {
        const next = prev.map(r => {
          const newSensors = mutateSensors(r.sensors);
          const pred = computeRisk(newSensors);
          return { ...r, sensors: newSensors, ...pred };
        });
        const agg: SensorData = {
          rainfall: next.reduce((s, r) => s + r.sensors.rainfall, 0) / next.length,
          waterLevel: next.reduce((s, r) => s + r.sensors.waterLevel, 0) / next.length,
          drainageCapacity: next.reduce((s, r) => s + r.sensors.drainageCapacity, 0) / next.length,
          soilMoisture: next.reduce((s, r) => s + r.sensors.soilMoisture, 0) / next.length,
          temperature: next.reduce((s, r) => s + r.sensors.temperature, 0) / next.length,
          humidity: next.reduce((s, r) => s + r.sensors.humidity, 0) / next.length,
          windSpeed: next.reduce((s, r) => s + r.sensors.windSpeed, 0) / next.length,
        };
        prevSensors.current = currentSensors;
        setCurrentSensors(agg);

        // Append history point
        setHistory(h => {
          const point = generateHistoryPoint(next, getTimeLabel());
          const updated = [...h, point];
          return updated.length > 60 ? updated.slice(-60) : updated;
        });

        return next;
      });
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [currentSensors]);

  const handleReset = useCallback(() => {
    setRegions(generateRegions());
    setSelectedRegionId(null);
  }, []);

  const highRiskRegions = regions.filter(r => r.risk === 'HIGH');
  const showAlert = highRiskRegions.length > 0 && !alertMuted;

  // Aggregate sensor data
  const aggSensors: SensorData = currentSensors || {
    rainfall: regions.reduce((s, r) => s + r.sensors.rainfall, 0) / regions.length,
    waterLevel: regions.reduce((s, r) => s + r.sensors.waterLevel, 0) / regions.length,
    drainageCapacity: regions.reduce((s, r) => s + r.sensors.drainageCapacity, 0) / regions.length,
    soilMoisture: regions.reduce((s, r) => s + r.sensors.soilMoisture, 0) / regions.length,
    temperature: regions.reduce((s, r) => s + r.sensors.temperature, 0) / regions.length,
    humidity: regions.reduce((s, r) => s + r.sensors.humidity, 0) / regions.length,
    windSpeed: regions.reduce((s, r) => s + r.sensors.windSpeed, 0) / regions.length,
  };

  const overallPrediction = computeRisk(aggSensors);
  const selectedRegion = regions.find(r => r.id === selectedRegionId);
  const predictionRegion = selectedRegion || { ...overallPrediction, sensors: aggSensors };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Glass Header */}
      <header style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-glass-hover)',
        padding: '0 32px',
        height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'var(--transition-smooth)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px var(--blue-glow)',
            fontSize: 22,
          }}>
            🌊
          </div>
          <div>
            <div className="heading-premium" style={{ fontWeight: 700, fontSize: 20 }}>
              Smart Flood Prediction AI
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>
              Pune Metropolitan Region
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Live Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span className="pulse-dot" style={{ background: 'var(--green)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', letterSpacing: 1 }}>LIVE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, background: 'var(--bg-card-glass)', padding: '6px 12px', borderRadius: 8 }}>
            <Wifi size={14} style={{ color: 'var(--cyan)' }} />
            <span>5 Nodes Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, background: 'var(--bg-card-glass)', padding: '6px 12px', borderRadius: 8 }}>
            <Radio size={14} style={{ color: 'var(--blue)' }} />
            <span>Tick #{tick}</span>
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border-glass-hover)', margin: '0 4px' }} />

          <button className="btn btn-outline" onClick={handleReset}>
            <RefreshCw size={16} /> Reset Simulation
          </button>

          <button
            className="btn btn-outline"
            style={{ 
              borderColor: alertMuted ? '' : 'var(--yellow-glow)',
              color: alertMuted ? '' : 'var(--yellow)',
              background: alertMuted ? '' : 'rgba(245, 158, 11, 0.1)'
            }}
            onClick={() => setAlertMuted(!alertMuted)}
          >
            {alertMuted ? <BellOff size={16} /> : <Bell size={16} />}
            {alertMuted ? 'Muted' : 'Alerts Active'}
          </button>

          <button
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>
      
      {/* ⚠️ High-Risk Alert Banner */}
      {showAlert && (
        <div style={{
          background: 'linear-gradient(90deg, var(--red-dark) 0%, rgba(61,0,16,0.8) 100%)',
          borderBottom: '2px solid var(--red)',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'blink 1.5s ease-in-out infinite',
        }}>
          <Shield size={18} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 14 }}>
            FLOOD ALERT — HIGH RISK DETECTED:
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {highRiskRegions.map(r => r.name).join(', ')} — Flooding may occur within {Math.min(...highRiskRegions.map(r => r.etaMinutes || 999))} minutes
          </span>
          <button
            onClick={() => setAlertMuted(true)}
            style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <main style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1800, margin: '0 auto', width: '100%', flex: 1 }}>
        {/* Sensor Panel Layer */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <SensorPanel sensors={aggSensors} prevSensors={prevSensors.current || undefined} />
        </div>

        {/* Core Layout: Prediction Sidebar + Map Main */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="animate-fade-up" style={{ width: 320, flexShrink: 0, animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ flex: '0 0 auto' }}>
              <FloodPrediction
                risk={predictionRegion.risk}
                probability={predictionRegion.probability}
                etaMinutes={predictionRegion.etaMinutes}
                confidence={predictionRegion.confidence}
                elevation={ELEVATIONS[selectedRegionId || 'shivaji-nagar']}
              />
            </div>
            <div style={{ flex: '1 1 auto' }}>
              <AiInsights regions={regions} aggSensors={aggSensors} />
            </div>
          </div>
          <div className="animate-fade-up" style={{ flex: 1, minWidth: 500, minHeight: 450, animationDelay: '0.3s' }}>
            <CityMap
              regions={regions}
              selectedId={selectedRegionId}
              onSelect={setSelectedRegionId}
              theme={theme}
            />
          </div>
        </div>

        {/* Analytics Layer */}
        <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <Charts history={history} />
        </div>

        {/* AI Action Layer */}
        <div className="animate-fade-up" style={{ animationDelay: '0.5s', marginBottom: 20 }}>
          <EmergencyReport regions={regions} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--footer-bg)',
        borderTop: '1px solid var(--border-glass-hover)',
        padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <span>Smart Flood Prediction AI — Pune Metropolitan Region</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={11} /> Data refreshes every 1 second
        </span>
        <span>Session started: {new Date().toLocaleDateString('en-IN')}</span>
      </footer>
    </div>
  );
}
