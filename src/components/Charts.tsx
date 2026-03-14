import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
  ReferenceLine
} from 'recharts';
import type { ChartPoint } from '../types';

interface Props {
  history: ChartPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 };

export default function Charts({ history }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 4, height: 16, background: 'var(--blue)', borderRadius: 2 }} />
        Real-Time Telemetry
      </h2>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* Rainfall + Water Level */}
        <div className="card" style={{ flex: 2, minWidth: 280 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, letterSpacing: 0.5 }}>
            Precipitation & Water Levels
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainfallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={150} stroke="var(--yellow)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Warning', fill: 'var(--yellow)', fontSize: 10 }} />
              <Area type="monotone" dataKey="rainfall" name="Rainfall (mm/hr)" stroke="var(--blue)" fill="url(#rainfallGrad)" strokeWidth={3} dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="waterLevel" name="Water Level (cm)" stroke="var(--cyan)" fill="url(#waterGrad)" strokeWidth={3} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Drainage Utilization */}
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, letterSpacing: 0.5 }}>
            Drainage Load
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="drainageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--yellow)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--yellow)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis domain={[0, 100]} tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="drainage" name="Drainage %" stroke="var(--yellow)" fill="url(#drainageGrad)" strokeWidth={3} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Flood Probability */}
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, letterSpacing: 0.5 }}>
            Predictive Risk Vector
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="probGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--green)" />
                  <stop offset="50%" stopColor="var(--yellow)" />
                  <stop offset="100%" stopColor="var(--red)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis domain={[0, 100]} tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="var(--red)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'High Risk', fill: 'var(--red)', fontSize: 10 }} />
              <Line type="monotone" dataKey="probability" name="Probability %" stroke="url(#probGrad)" strokeWidth={3.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
