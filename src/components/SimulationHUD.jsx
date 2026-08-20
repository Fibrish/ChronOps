import React from 'react';
import { Play, Pause, Square, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SimulationHUD = ({
  isSimulating,
  simProgress,
  onStopSimulation,
}) => {
  if (!isSimulating) return null;

  const aiPercent = Math.min(100, Math.round(simProgress * 155));
  const stdPercent = Math.min(68, Math.round(simProgress * 72));

  return (
    <div className="simulation-hud">
      {/* Live AI Vehicle Telemetry */}
      <div className="sim-hud-progress">
        <div className="sim-hud-label-row">
          <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> AI Route (44 km/h)
          </span>
          <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            {aiPercent === 100 ? 'ARRIVED 🏁' : `${aiPercent}%`}
          </span>
        </div>
        <div className="sim-bar-bg">
          <div className="sim-bar-fill" style={{ width: `${aiPercent}%` }} />
        </div>
      </div>

      {/* Live Standard Vehicle Telemetry */}
      <div className="sim-hud-progress">
        <div className="sim-hud-label-row">
          <span style={{ color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} color="#f87171" /> Standard Route (18 km/h)
          </span>
          <span style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>
            {stdPercent >= 68 && aiPercent === 100 ? 'CONGESTION DELAY ⚠️' : `${stdPercent}%`}
          </span>
        </div>
        <div className="sim-bar-bg">
          <div className="sim-bar-fill" style={{ width: `${stdPercent}%`, background: '#3b82f6' }} />
        </div>
      </div>

      {/* Stop Button */}
      <button
        onClick={onStopSimulation}
        style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        <Square size={12} />
        <span>End</span>
      </button>
    </div>
  );
};
