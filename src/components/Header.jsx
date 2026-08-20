import React from 'react';
import { Activity, Radio, Sparkles, Navigation, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PRESET_ROUTES } from '../utils/constants';

export const Header = ({
  stats,
  isLiveBackend,
  activePresetId,
  onSelectPreset,
  onReset,
  hasActiveRoute,
}) => {
  const freeCount = stats?.free_count || 0;
  const moderateCount = stats?.moderate_count || 0;
  const severeCount = stats?.severe_count || 0;
  const totalRoads = stats?.total_roads || (freeCount + moderateCount + severeCount) || 1250;

  const freePercent = Math.round((freeCount / totalRoads) * 100) || 64;
  const severePercent = Math.round((severeCount / totalRoads) * 100) || 12;

  return (
    <header className="header-wrapper">
      {/* Brand & AI Engine Title */}
      <div className="header-brand">
        <div className="brand-icon-box">
          <Activity size={22} className="animate-pulse" />
        </div>
        <div className="brand-titles">
          <div className="brand-title-row">
            <h1 className="brand-title">AI Traffic Command Center</h1>
            <span className="brand-pill">STGCN V2.4</span>
          </div>
          <div className="brand-subtitle">
            <span className="brand-location">Indiranagar, Bangalore</span>
            <span>•</span>
            <span>Real-Time Predictive Congestion Avoidance</span>
          </div>
        </div>
      </div>

      {/* Live Telemetry Stats Bar */}
      <div className="header-stats-bar">
        {/* Free Flow Pill */}
        <div className="stat-pill" title={`${freeCount} road segments free flowing`}>
          <div className="stat-indicator free" />
          <span className="stat-label">Free Flow</span>
          <span className="stat-val">{freePercent}%</span>
        </div>

        {/* Moderate Pill */}
        <div className="stat-pill" title={`${moderateCount} road segments experiencing moderate traffic`}>
          <div className="stat-indicator moderate" />
          <span className="stat-label">Moderate</span>
          <span className="stat-val">{moderateCount}</span>
        </div>

        {/* Severe Pill */}
        <div className="stat-pill" title={`${severeCount} road segments at severe bottleneck`}>
          <div className="stat-indicator severe" />
          <span className="stat-label">Severe</span>
          <span className="stat-val" style={{ color: '#f87171' }}>{severeCount}</span>
        </div>

        {/* Congestion Index */}
        <div className="stat-pill" title="Network-wide average congestion factor">
          <Sparkles size={14} color="#c084fc" />
          <span className="stat-label">AI Index</span>
          <span className="stat-val">{stats?.avg_congestion_factor || 0.68}</span>
        </div>
      </div>

      {/* Connection Status & Actions */}
      <div className="header-actions">
        {/* Preset Selector Dropdown / Pills */}
        <select
          aria-label="Select Demo Route Preset"
          className="header-btn preset-btn"
          value={activePresetId || ''}
          onChange={(e) => onSelectPreset(e.target.value)}
        >
          <option value="" disabled>⚡ Select Demo Scenario</option>
          {PRESET_ROUTES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        {/* Connection Mode Badge */}
        <div
          className={`connection-badge ${isLiveBackend ? 'live' : 'demo'}`}
          title={isLiveBackend ? 'Streaming real-time inference from FastAPI backend' : 'Running high-fidelity Indiranagar simulation dataset'}
        >
          <span className="status-dot" />
          <span>{isLiveBackend ? 'FastAPI Online' : 'Simulation Mode'}</span>
        </div>

        {/* Reset Button */}
        {hasActiveRoute && (
          <button
            className="header-btn"
            onClick={onReset}
            title="Clear active route and reset map pins"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </header>
  );
};
