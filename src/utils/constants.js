/**
 * AI Traffic Command Center - Application Constants
 */

export const API_BASE_URL = 'http://localhost:8000';

export const MAP_CONFIG = {
  CENTER: [12.9716, 77.6408], // Indiranagar, Bangalore (100 Feet Rd / CMH Rd intersection)
  DEFAULT_ZOOM: 14.5,
  MIN_ZOOM: 13,
  MAX_ZOOM: 18,
  BOUNDS: [
    [12.950, 77.615],
    [12.995, 77.665],
  ],
  TILE_LAYER: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

export const SEVERITY_COLORS = {
  free: '#22c55e',      // Free Flow - Green (> 75% speed)
  moderate: '#f59e0b',  // Moderate - Amber/Orange (45% - 75% speed)
  severe: '#ef4444',    // Severe Congestion - Red (< 45% speed)
};

export const SEVERITY_LABELS = {
  free: 'Free Flow (>75% speed)',
  moderate: 'Moderate Congestion (45-75%)',
  severe: 'Severe Bottleneck (<45%)',
};

export const ROUTE_CONFIG = {
  standard: {
    name: 'Standard Route (Shortest Path)',
    subtitle: 'Blind Dijkstra (ignores future congestion)',
    color: '#3b82f6',
    dashArray: '8, 8',
    weight: 5,
    opacity: 0.85,
  },
  ai: {
    name: 'AI Proactive Route (STGCN)',
    subtitle: 'Congestion-Aware Dijkstra (avoids predicted jams)',
    color: '#a855f7',
    dashArray: null,
    weight: 6,
    opacity: 1.0,
  },
};

export const PRESET_ROUTES = [
  {
    id: '100ft-bypass',
    title: '100 Feet Road Corridor Bypass',
    description: 'Bypasses severe congestion on 100 Feet Rd via 12th Main collector network',
    start: { lat: 12.9815, lng: 77.6385, name: 'CMH Metro Station / 100 Ft Rd' },
    end: { lat: 12.9642, lng: 77.6432, name: 'Old Airport Road Junction' },
  },
  {
    id: 'defence-colony',
    title: 'Indiranagar Metro to Defence Colony',
    description: 'Avoids choke points near CMH Road market corridor',
    start: { lat: 12.9784, lng: 77.6387, name: 'Indiranagar Metro Station' },
    end: { lat: 12.9720, lng: 77.6525, name: 'Defence Colony Park' },
  },
  {
    id: 'domlur-hal',
    title: 'Domlur Flyover to HAL 2nd Stage',
    description: 'Proactively routes around Double Road & 100 Feet Rd gridlock',
    start: { lat: 12.9610, lng: 77.6380, name: 'Domlur Flyover Entry' },
    end: { lat: 12.9765, lng: 77.6495, name: 'HAL 2nd Stage / 12th Main' },
  },
];
