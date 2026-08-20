import React from 'react';
import { Layers, Eye, EyeOff, Navigation, Sparkles } from 'lucide-react';
import { SEVERITY_COLORS, ROUTE_CONFIG } from '../utils/constants';

export const Legend = ({
  showRoads,
  setShowRoads,
  showStandardRoute,
  setShowStandardRoute,
  showAiRoute,
  setShowAiRoute,
  hasActiveRoute
}) => {
  return (
    <div className="legend-hud-container">
      <div className="legend-title">
        <span>Map Legend & Layers</span>
        <button
          onClick={() => setShowRoads(!showRoads)}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
          title={showRoads ? 'Hide road congestion layer' : 'Show road congestion layer'}
        >
          {showRoads ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {/* Congestion Levels */}
      <div className="legend-items-list">
        <div className="legend-item">
          <div className="legend-item-left">
            <div className="legend-color-swatch free" />
            <span>Free Flow (&gt;75% speed)</span>
          </div>
        </div>

        <div className="legend-item">
          <div className="legend-item-left">
            <div className="legend-color-swatch moderate" />
            <span>Moderate (45% - 75%)</span>
          </div>
        </div>

        <div className="legend-item">
          <div className="legend-item-left">
            <div className="legend-color-swatch severe" />
            <span>Severe Bottleneck (&lt;45%)</span>
          </div>
        </div>
      </div>

      {/* Routes Legend if active */}
      {hasActiveRoute && (
        <>
          <div className="legend-divider" />
          <div className="legend-title" style={{ fontSize: '0.7rem' }}>
            <span>Dual Routing Comparison</span>
          </div>

          <div className="legend-items-list">
            <div
              className="legend-item"
              style={{ cursor: 'pointer', opacity: showAiRoute ? 1 : 0.4 }}
              onClick={() => setShowAiRoute(!showAiRoute)}
              title="Click to toggle AI Route on map"
            >
              <div className="legend-item-left">
                <div className="legend-color-swatch ai-route" />
                <span style={{ fontWeight: 600, color: '#e9d5ff' }}>AI Proactive (STGCN)</span>
              </div>
              <Sparkles size={12} color="#c084fc" />
            </div>

            <div
              className="legend-item"
              style={{ cursor: 'pointer', opacity: showStandardRoute ? 1 : 0.4 }}
              onClick={() => setShowStandardRoute(!showStandardRoute)}
              title="Click to toggle Standard Route on map"
            >
              <div className="legend-item-left">
                <div className="legend-color-swatch std-route" />
                <span style={{ color: '#93c5fd' }}>Standard Route (Shortest)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
