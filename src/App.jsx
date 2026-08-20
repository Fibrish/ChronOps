import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TrafficMap } from './components/TrafficMap';
import { RoutePanel } from './components/RoutePanel';
import { Legend } from './components/Legend';
import { SimulationHUD } from './components/SimulationHUD';
import { fetchRoads, fetchStats, calculateRoute } from './utils/api';
import { PRESET_ROUTES } from './utils/constants';

export function App() {
  const [roadsData, setRoadsData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [activePresetId, setActivePresetId] = useState('100ft-bypass');

  const [showRoads, setShowRoads] = useState(true);
  const [showStandardRoute, setShowStandardRoute] = useState(true);
  const [showAiRoute, setShowAiRoute] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const [isCalculating, setIsCalculating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  const simAnimFrameRef = useRef(null);
  const simStartTimeRef = useRef(null);

  // Initial Load: Fetch Road network, stats, and load default demo preset
  useEffect(() => {
    let isMounted = true;

    async function initializeData() {
      // 1. Fetch Roads
      const roadsRes = await fetchRoads();
      if (isMounted) {
        setRoadsData(roadsRes.data);
        setIsLiveBackend(roadsRes.isLive);
      }

      // 2. Fetch Stats
      const statsRes = await fetchStats();
      if (isMounted) {
        setStats(statsRes.data);
      }

      // 3. Load default preset for instant visual engagement
      const defaultPreset = PRESET_ROUTES[0];
      setStartPoint(defaultPreset.start);
      setEndPoint(defaultPreset.end);

      const routeRes = await calculateRoute(defaultPreset.start, defaultPreset.end, defaultPreset.id);
      if (isMounted) {
        setRoutes(routeRes.data);
      }
    }

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Recalculate route when start or end point changes
  const handleCalculateRoutes = useCallback(async (start, end, presetId = null) => {
    if (!start || !end) return;

    setIsCalculating(true);
    try {
      const res = await calculateRoute(start, end, presetId);
      setRoutes(res.data);
      setIsPanelOpen(true);
    } catch (err) {
      console.error('Failed to calculate routes:', err);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Trigger calculation when both points are set manually
  useEffect(() => {
    if (startPoint && endPoint && !activePresetId) {
      handleCalculateRoutes(startPoint, endPoint);
    }
  }, [startPoint, endPoint, activePresetId, handleCalculateRoutes]);

  // Handle Preset Route Selection
  const handleSelectPreset = (presetId) => {
    const preset = PRESET_ROUTES.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setStartPoint(preset.start);
    setEndPoint(preset.end);
    setIsSimulating(false);
    setSimProgress(0);
    handleCalculateRoutes(preset.start, preset.end, presetId);
  };

  // Handle Map Pin Changes manually
  const handleSetStartPoint = (point) => {
    setActivePresetId(null);
    setStartPoint(point);
    if (!point) {
      setRoutes(null);
    }
  };

  const handleSetEndPoint = (point) => {
    setActivePresetId(null);
    setEndPoint(point);
    if (!point) {
      setRoutes(null);
    }
  };

  // Reset Everything
  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoutes(null);
    setActivePresetId(null);
    setIsSimulating(false);
    setSimProgress(0);
  };

  // Drive Simulation Loop
  const handleStartSimulation = () => {
    if (!routes) return;
    setIsSimulating(true);
    setSimProgress(0);
    simStartTimeRef.current = null;

    const DURATION = 9000; // 9 seconds total race

    const animateSim = (timestamp) => {
      if (!simStartTimeRef.current) simStartTimeRef.current = timestamp;
      const elapsed = timestamp - simStartTimeRef.current;
      const progress = Math.min(1, elapsed / DURATION);

      setSimProgress(progress);

      if (progress < 1) {
        simAnimFrameRef.current = requestAnimationFrame(animateSim);
      } else {
        // Complete after slight delay
        setTimeout(() => {
          setIsSimulating(false);
        }, 1500);
      }
    };

    simAnimFrameRef.current = requestAnimationFrame(animateSim);
  };

  const handleStopSimulation = () => {
    if (simAnimFrameRef.current) {
      cancelAnimationFrame(simAnimFrameRef.current);
    }
    setIsSimulating(false);
    setSimProgress(0);
  };

  return (
    <div className="app-container">
      {/* Top Telemetry & Command Bar */}
      <Header
        stats={stats}
        isLiveBackend={isLiveBackend}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        hasActiveRoute={!!routes}
      />

      {/* Main Map View & HUD Controls */}
      <div className="main-content">
        <TrafficMap
          roadsData={roadsData}
          showRoads={showRoads}
          startPoint={startPoint}
          setStartPoint={handleSetStartPoint}
          endPoint={endPoint}
          setEndPoint={handleSetEndPoint}
          routes={routes}
          showStandardRoute={showStandardRoute}
          showAiRoute={showAiRoute}
          isCalculating={isCalculating}
          isSimulating={isSimulating}
          simProgress={simProgress}
        />

        {/* Floating Legend HUD */}
        <Legend
          showRoads={showRoads}
          setShowRoads={setShowRoads}
          showStandardRoute={showStandardRoute}
          setShowStandardRoute={setShowStandardRoute}
          showAiRoute={showAiRoute}
          setShowAiRoute={setShowAiRoute}
          hasActiveRoute={!!routes}
        />

        {/* Live Vehicle Simulation Racing HUD */}
        <SimulationHUD
          isSimulating={isSimulating}
          simProgress={simProgress}
          onStopSimulation={handleStopSimulation}
        />

        {/* Sliding Dual Route Comparison Panel */}
        {isPanelOpen && routes && (
          <RoutePanel
            routes={routes}
            onClose={() => setIsPanelOpen(false)}
            onStartSimulation={handleStartSimulation}
            isSimulating={isSimulating}
          />
        )}
      </div>
    </div>
  );
}

export default App;
