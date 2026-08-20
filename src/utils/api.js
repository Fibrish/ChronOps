/**
 * AI Traffic Command Center - API Client
 * Provides seamless connection to FastAPI backend with graceful fallback to high-fidelity mock simulation.
 */

import { API_BASE_URL } from './constants';
import { mockRoadNetwork, mockStats, getPresetRouteData, generateDynamicRoutes } from './mockIndiranagarData';

// Fetch Road Network GeoJSON
export const fetchRoads = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/api/roads`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (err) {
    console.info('FastAPI backend not detected at http://localhost:8000/api/roads. Using Indiranagar simulation dataset.', err.message);
    return { data: mockRoadNetwork, isLive: false };
  }
};

// Fetch Aggregate Congestion Stats
export const fetchStats = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/api/stats`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (err) {
    console.info('FastAPI backend stats offline. Using Indiranagar simulation stats.');
    return { data: mockStats, isLive: false };
  }
};

// Calculate Dual Routes (Standard Dijkstra vs AI Congestion-Aware Dijkstra)
export const calculateRoute = async (start, end, presetId = null) => {
  // If a preset route is requested and no live backend, use pre-calculated high-precision route
  if (presetId) {
    try {
      const url = `${API_BASE_URL}/api/calculate-route?start_lat=${start.lat}&start_lng=${start.lng}&end_lat=${end.lat}&end_lng=${end.lng}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return { data, isLive: true };
      }
    } catch (e) {
      // fallback to preset
    }
    return { data: getPresetRouteData(presetId), isLive: false };
  }

  // Dynamic coordinates
  try {
    const url = `${API_BASE_URL}/api/calculate-route?start_lat=${start.lat}&start_lng=${start.lng}&end_lat=${end.lat}&end_lng=${end.lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Backend route error: ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (err) {
    console.info('Using dynamic route simulation for coordinates:', start, end);
    return { data: generateDynamicRoutes(start, end), isLive: false };
  }
};
