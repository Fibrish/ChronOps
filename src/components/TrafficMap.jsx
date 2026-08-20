import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MAP_CONFIG, SEVERITY_COLORS, ROUTE_CONFIG } from '../utils/constants';
import { MapPin, Navigation, Compass, Sparkles } from 'lucide-react';

export const TrafficMap = ({
  roadsData,
  showRoads,
  startPoint,
  setStartPoint,
  endPoint,
  setEndPoint,
  routes,
  showStandardRoute,
  showAiRoute,
  isCalculating,
  isSimulating,
  simProgress,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const roadsLayerRef = useRef(null);
  const standardRouteLayerRef = useRef(null);
  const aiRouteLayerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const simStdMarkerRef = useRef(null);
  const simAiMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MAP_CONFIG.CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      minZoom: MAP_CONFIG.MIN_ZOOM,
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      zoomControl: false,
    });

    // Position Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB Dark Matter Tile Layer
    L.tileLayer(MAP_CONFIG.TILE_LAYER, {
      attribution: MAP_CONFIG.ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Click handler for placing Origin & Destination pins
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      // Access latest values via state or closure
      setStartPoint((prevStart) => {
        if (!prevStart) {
          return { lat, lng, name: 'Selected Origin' };
        }
        return prevStart;
      });

      setEndPoint((prevEnd) => {
        // If start point already exists and end point is empty, place end point
        return (prevStartVal) => {
          if (prevStartVal && !prevEnd) {
            return { lat, lng, name: 'Selected Destination' };
          }
          return prevEnd;
        };
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Map Click Dispatcher
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      if (!startPoint) {
        setStartPoint({ lat, lng, name: `Origin (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
      } else if (!endPoint) {
        setEndPoint({ lat, lng, name: `Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
      } else {
        // If both already placed, restart with new start point
        setStartPoint({ lat, lng, name: `Origin (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
        setEndPoint(null);
      }
    };

    map.off('click');
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [startPoint, endPoint, setStartPoint, setEndPoint]);

  // Update Road Network GeoJSON Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (roadsLayerRef.current) {
      map.removeLayer(roadsLayerRef.current);
      roadsLayerRef.current = null;
    }

    if (!roadsData || !showRoads) return;

    const layer = L.geoJSON(roadsData, {
      style: (feature) => {
        const severity = feature?.properties?.severity || 'free';
        const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.free;
        return {
          color: color,
          weight: severity === 'severe' ? 4 : 3,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        };
      },
      onEachFeature: (feature, layerItem) => {
        const p = feature.properties || {};
        const severityLabel = p.severity === 'severe' ? 'Severe Congestion' : p.severity === 'moderate' ? 'Moderate Traffic' : 'Free Flow';
        const badgeClass = p.severity || 'free';

        const popupContent = `
          <div class="road-popup">
            <div class="road-popup-header">${p.road_name || 'Road Segment'}</div>
            <div class="road-popup-grid">
              <span class="popup-item-label">Free Flow Speed:</span>
              <span class="popup-item-value">${p.free_flow_speed || 50} km/h</span>
              <span class="popup-item-label">AI Predicted:</span>
              <span class="popup-item-value" style="color: ${SEVERITY_COLORS[p.severity] || '#fff'}">${p.predicted_speed ? p.predicted_speed.toFixed(1) : 40} km/h</span>
              <span class="popup-item-label">Congestion Factor:</span>
              <span class="popup-item-value">${p.congestion_factor ? p.congestion_factor.toFixed(2) : '0.85'}</span>
              <span class="popup-item-label">Road Type:</span>
              <span class="popup-item-value">${p.highway_type || 'urban'}</span>
            </div>
            <div class="popup-badge ${badgeClass}">${severityLabel}</div>
          </div>
        `;

        layerItem.bindPopup(popupContent);

        // Hover highlighting
        layerItem.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 6, opacity: 1 });
            l.bringToFront();
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
          },
        });
      },
    });

    layer.addTo(map);
    roadsLayerRef.current = layer;
  }, [roadsData, showRoads]);

  // Update Start Pin Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }

    if (!startPoint) return;

    const startIcon = L.divIcon({
      className: 'custom-pin-wrapper',
      html: `
        <div class="custom-pin-container">
          <div class="pin-pulse start-pin"></div>
          <div class="pin-center start-pin">A</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([startPoint.lat, startPoint.lng], {
      icon: startIcon,
      draggable: true,
    }).addTo(map);

    marker.bindTooltip(`<strong>Origin:</strong> ${startPoint.name || 'Start Point'}`, {
      direction: 'top',
      offset: [0, -10],
      className: 'dark-tooltip',
    });

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      setStartPoint({ lat, lng, name: `Origin (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
    });

    startMarkerRef.current = marker;
  }, [startPoint, setStartPoint]);

  // Update End Pin Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }

    if (!endPoint) return;

    const endIcon = L.divIcon({
      className: 'custom-pin-wrapper',
      html: `
        <div class="custom-pin-container">
          <div class="pin-pulse end-pin"></div>
          <div class="pin-center end-pin">B</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([endPoint.lat, endPoint.lng], {
      icon: endIcon,
      draggable: true,
    }).addTo(map);

    marker.bindTooltip(`<strong>Destination:</strong> ${endPoint.name || 'End Point'}`, {
      direction: 'top',
      offset: [0, -10],
      className: 'dark-tooltip',
    });

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      setEndPoint({ lat, lng, name: `Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
    });

    endMarkerRef.current = marker;
  }, [endPoint, setEndPoint]);

  // Update Route Polylines (Standard & AI Proactive)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing route layers
    if (standardRouteLayerRef.current) {
      map.removeLayer(standardRouteLayerRef.current);
      standardRouteLayerRef.current = null;
    }
    if (aiRouteLayerRef.current) {
      map.removeLayer(aiRouteLayerRef.current);
      aiRouteLayerRef.current = null;
    }

    if (!routes) return;

    const bounds = L.latLngBounds();

    // 1. Standard Route Layer (Blue dashed)
    if (routes.standard_route && showStandardRoute) {
      const stdLayer = L.geoJSON(routes.standard_route, {
        style: {
          color: ROUTE_CONFIG.standard.color,
          weight: ROUTE_CONFIG.standard.weight,
          opacity: ROUTE_CONFIG.standard.opacity,
          dashArray: ROUTE_CONFIG.standard.dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        },
      }).addTo(map);

      stdLayer.eachLayer((l) => {
        if (l.getBounds) bounds.extend(l.getBounds());
      });
      standardRouteLayerRef.current = stdLayer;
    }

    // 2. AI Proactive Route Layer (Purple solid with glow halo)
    if (routes.ai_route && showAiRoute) {
      // Outer glow layer
      const haloLayer = L.geoJSON(routes.ai_route, {
        style: {
          color: '#d946ef',
          weight: 11,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        },
      }).addTo(map);

      // Core radiant line
      const coreLayer = L.geoJSON(routes.ai_route, {
        style: {
          color: ROUTE_CONFIG.ai.color,
          weight: ROUTE_CONFIG.ai.weight,
          opacity: ROUTE_CONFIG.ai.opacity,
          lineCap: 'round',
          lineJoin: 'round',
        },
      }).addTo(map);

      const aiGroup = L.layerGroup([haloLayer, coreLayer]).addTo(map);

      coreLayer.eachLayer((l) => {
        if (l.getBounds) bounds.extend(l.getBounds());
      });
      aiRouteLayerRef.current = aiGroup;
    }

    // Auto-fit bounds smoothly
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
    }
  }, [routes, showStandardRoute, showAiRoute]);

  // Simulation Vehicle Markers Animation
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!isSimulating || !routes) {
      if (simStdMarkerRef.current) {
        map.removeLayer(simStdMarkerRef.current);
        simStdMarkerRef.current = null;
      }
      if (simAiMarkerRef.current) {
        map.removeLayer(simAiMarkerRef.current);
        simAiMarkerRef.current = null;
      }
      return;
    }

    const stdCoords = routes.standard_route?.features?.[0]?.geometry?.coordinates || [];
    const aiCoords = routes.ai_route?.features?.[0]?.geometry?.coordinates || [];

    if (stdCoords.length === 0 || aiCoords.length === 0) return;

    // Calculate interpolated position along coordinates
    const getPointAtPercent = (coords, pct) => {
      if (pct <= 0) return [coords[0][1], coords[0][0]];
      if (pct >= 1) return [coords[coords.length - 1][1], coords[coords.length - 1][0]];

      const totalSegments = coords.length - 1;
      const exactIndex = pct * totalSegments;
      const segIndex = Math.min(Math.floor(exactIndex), totalSegments - 1);
      const segPct = exactIndex - segIndex;

      const p1 = coords[segIndex];
      const p2 = coords[segIndex + 1];

      const lng = p1[0] + (p2[0] - p1[0]) * segPct;
      const lat = p1[1] + (p2[1] - p1[1]) * segPct;
      return [lat, lng];
    };

    // AI vehicle arrives faster (100% progress when simProgress is ~0.65)
    const aiPct = Math.min(1.0, simProgress * 1.55);
    // Standard vehicle lags behind due to simulated congestion
    const stdPct = Math.min(0.68, simProgress * 0.72);

    const aiPos = getPointAtPercent(aiCoords, aiPct);
    const stdPos = getPointAtPercent(stdCoords, stdPct);

    // AI Vehicle Marker
    if (!simAiMarkerRef.current) {
      const aiIcon = L.divIcon({
        className: 'sim-vehicle-ai',
        html: `
          <div style="width: 28px; height: 28px; background: #a855f7; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #a855f7; color: white; font-size: 11px; font-weight: 800;">
            AI
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      simAiMarkerRef.current = L.marker(aiPos, { icon: aiIcon }).addTo(map);
    } else {
      simAiMarkerRef.current.setLatLng(aiPos);
    }

    // Standard Vehicle Marker
    if (!simStdMarkerRef.current) {
      const stdIcon = L.divIcon({
        className: 'sim-vehicle-std',
        html: `
          <div style="width: 28px; height: 28px; background: #3b82f6; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #3b82f6; color: white; font-size: 11px; font-weight: 800;">
            STD
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      simStdMarkerRef.current = L.marker(stdPos, { icon: stdIcon }).addTo(map);
    } else {
      simStdMarkerRef.current.setLatLng(stdPos);
    }
  }, [isSimulating, simProgress, routes]);

  return (
    <div className="map-view-container">
      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="leaflet-map-canvas" />

      {/* Floating Instructions HUD when picking points */}
      <div className="map-instructions-hud">
        {!startPoint && (
          <>
            <div className="hud-step-icon start">1</div>
            <div className="hud-text">
              Click anywhere on the map to set <strong>Origin (Point A)</strong>
            </div>
          </>
        )}
        {startPoint && !endPoint && (
          <>
            <div className="hud-step-icon end">2</div>
            <div className="hud-text">
              Click on the map to set <strong>Destination (Point B)</strong>
            </div>
          </>
        )}
        {startPoint && endPoint && (
          <>
            <div className="hud-step-icon calc">
              <Sparkles size={13} />
            </div>
            <div className="hud-text">
              {isCalculating ? (
                <span>Calculating Dual Dijkstra Paths...</span>
              ) : (
                <span>Dual Routes Active • Drag pins to explore dynamic rerouting</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
