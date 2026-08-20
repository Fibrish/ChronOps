/**
 * Realistic Indiranagar Road Network & Dual-Route Simulation Data
 * Provides zero-downtime mock data for seamless demo and offline testing.
 */

// Generate realistic road network segments for Indiranagar, Bangalore
const createRoadFeatures = () => {
  const roads = [
    // 100 Feet Road (North to South Arterial - High Congestion Corridor)
    {
      name: '100 Feet Road (North Segment)',
      coords: [[77.6385, 12.9815], [77.6392, 12.9770]],
      severity: 'severe',
      congestion_factor: 0.32,
      free_flow_speed: 50.0,
      predicted_speed: 16.0,
      highway_type: 'primary',
      baseline_cost: 38.0,
      proactive_cost: 118.0
    },
    {
      name: '100 Feet Road (Mid-North Segment)',
      coords: [[77.6392, 12.9770], [77.6402, 12.9725]],
      severity: 'severe',
      congestion_factor: 0.28,
      free_flow_speed: 50.0,
      predicted_speed: 14.0,
      highway_type: 'primary',
      baseline_cost: 42.0,
      proactive_cost: 150.0
    },
    {
      name: '100 Feet Road (Mid-South Segment)',
      coords: [[77.6402, 12.9725], [77.6415, 12.9680]],
      severity: 'moderate',
      congestion_factor: 0.52,
      free_flow_speed: 50.0,
      predicted_speed: 26.0,
      highway_type: 'primary',
      baseline_cost: 36.0,
      proactive_cost: 69.2
    },
    {
      name: '100 Feet Road (South Segment)',
      coords: [[77.6415, 12.9680], [77.6432, 12.9642]],
      severity: 'moderate',
      congestion_factor: 0.60,
      free_flow_speed: 50.0,
      predicted_speed: 30.0,
      highway_type: 'primary',
      baseline_cost: 32.0,
      proactive_cost: 53.3
    },

    // CMH Road (East-West Arterial)
    {
      name: 'CMH Road (West Segment - Metro Line)',
      coords: [[77.6320, 12.9785], [77.6385, 12.9782]],
      severity: 'moderate',
      congestion_factor: 0.58,
      free_flow_speed: 45.0,
      predicted_speed: 26.1,
      highway_type: 'secondary',
      baseline_cost: 45.0,
      proactive_cost: 77.5
    },
    {
      name: 'CMH Road (Central Junction)',
      coords: [[77.6385, 12.9782], [77.6440, 12.9780]],
      severity: 'severe',
      congestion_factor: 0.35,
      free_flow_speed: 45.0,
      predicted_speed: 15.7,
      highway_type: 'secondary',
      baseline_cost: 39.0,
      proactive_cost: 111.4
    },
    {
      name: 'CMH Road (East Segment)',
      coords: [[77.6440, 12.9780], [77.6520, 12.9778]],
      severity: 'free',
      congestion_factor: 0.85,
      free_flow_speed: 50.0,
      predicted_speed: 42.5,
      highway_type: 'secondary',
      baseline_cost: 52.0,
      proactive_cost: 61.1
    },

    // 12th Main Road (Free Flowing Parallel Collector Corridor)
    {
      name: '12th Main Road (North)',
      coords: [[77.6465, 12.9810], [77.6472, 12.9765]],
      severity: 'free',
      congestion_factor: 0.88,
      free_flow_speed: 40.0,
      predicted_speed: 35.2,
      highway_type: 'tertiary',
      baseline_cost: 40.0,
      proactive_cost: 45.4
    },
    {
      name: '12th Main Road (Central)',
      coords: [[77.6472, 12.9765], [77.6480, 12.9715]],
      severity: 'free',
      congestion_factor: 0.82,
      free_flow_speed: 40.0,
      predicted_speed: 32.8,
      highway_type: 'tertiary',
      baseline_cost: 44.0,
      proactive_cost: 53.6
    },
    {
      name: '12th Main Road (South)',
      coords: [[77.6480, 12.9715], [77.6488, 12.9660]],
      severity: 'free',
      congestion_factor: 0.90,
      free_flow_speed: 40.0,
      predicted_speed: 36.0,
      highway_type: 'tertiary',
      baseline_cost: 46.0,
      proactive_cost: 51.1
    },

    // 80 Feet Road (HAL 2nd Stage)
    {
      name: '80 Feet Road (HAL 2nd Stage North)',
      coords: [[77.6530, 12.9790], [77.6535, 12.9735]],
      severity: 'free',
      congestion_factor: 0.84,
      free_flow_speed: 50.0,
      predicted_speed: 42.0,
      highway_type: 'secondary',
      baseline_cost: 38.0,
      proactive_cost: 45.2
    },
    {
      name: '80 Feet Road (HAL 2nd Stage South)',
      coords: [[77.6535, 12.9735], [77.6540, 12.9675]],
      severity: 'free',
      congestion_factor: 0.79,
      free_flow_speed: 50.0,
      predicted_speed: 39.5,
      highway_type: 'secondary',
      baseline_cost: 42.0,
      proactive_cost: 53.1
    },

    // Old Airport Road (South Boundary)
    {
      name: 'Old Airport Road (Domlur to 100ft)',
      coords: [[77.6360, 12.9620], [77.6432, 12.9642]],
      severity: 'severe',
      congestion_factor: 0.38,
      free_flow_speed: 60.0,
      predicted_speed: 22.8,
      highway_type: 'trunk',
      baseline_cost: 48.0,
      proactive_cost: 126.3
    },
    {
      name: 'Old Airport Road (100ft to HAL)',
      coords: [[77.6432, 12.9642], [77.6550, 12.9655]],
      severity: 'moderate',
      congestion_factor: 0.65,
      free_flow_speed: 60.0,
      predicted_speed: 39.0,
      highway_type: 'trunk',
      baseline_cost: 65.0,
      proactive_cost: 100.0
    },

    // Double Road & Indiranagar Club Road
    {
      name: 'Indiranagar Double Road',
      coords: [[77.6365, 12.9720], [77.6402, 12.9725]],
      severity: 'moderate',
      congestion_factor: 0.62,
      free_flow_speed: 40.0,
      predicted_speed: 24.8,
      highway_type: 'tertiary',
      baseline_cost: 32.0,
      proactive_cost: 51.6
    },
    {
      name: 'Club Road (6th Main)',
      coords: [[77.6402, 12.9725], [77.6480, 12.9715]],
      severity: 'free',
      congestion_factor: 0.86,
      free_flow_speed: 35.0,
      predicted_speed: 30.1,
      highway_type: 'residential',
      baseline_cost: 55.0,
      proactive_cost: 63.9
    },

    // Defence Colony & 6th Main
    {
      name: 'Defence Colony Main Ave',
      coords: [[77.6440, 12.9780], [77.6472, 12.9765]],
      severity: 'free',
      congestion_factor: 0.92,
      free_flow_speed: 35.0,
      predicted_speed: 32.2,
      highway_type: 'residential',
      baseline_cost: 35.0,
      proactive_cost: 38.0
    },
    {
      name: 'Defence Colony South Link',
      coords: [[77.6472, 12.9765], [77.6535, 12.9735]],
      severity: 'free',
      congestion_factor: 0.89,
      free_flow_speed: 35.0,
      predicted_speed: 31.1,
      highway_type: 'residential',
      baseline_cost: 48.0,
      proactive_cost: 53.9
    },

    // Swami Vivekananda Road (North Corridor)
    {
      name: 'Swami Vivekananda Road (SV Road)',
      coords: [[77.6320, 12.9840], [77.6385, 12.9815]],
      severity: 'moderate',
      congestion_factor: 0.66,
      free_flow_speed: 55.0,
      predicted_speed: 36.3,
      highway_type: 'primary',
      baseline_cost: 44.0,
      proactive_cost: 66.6
    },
    {
      name: 'SV Road East Segment',
      coords: [[77.6385, 12.9815], [77.6465, 12.9810]],
      severity: 'free',
      congestion_factor: 0.82,
      free_flow_speed: 55.0,
      predicted_speed: 45.1,
      highway_type: 'primary',
      baseline_cost: 48.0,
      proactive_cost: 58.5
    },

    // Connecting Cross Streets (9th Main, 5th Cross, 13th Cross)
    {
      name: '9th Cross Road',
      coords: [[77.6392, 12.9770], [77.6472, 12.9765]],
      severity: 'free',
      congestion_factor: 0.91,
      free_flow_speed: 30.0,
      predicted_speed: 27.3,
      highway_type: 'residential',
      baseline_cost: 65.0,
      proactive_cost: 71.4
    },
    {
      name: '13th Cross Road',
      coords: [[77.6415, 12.9680], [77.6488, 12.9660]],
      severity: 'free',
      congestion_factor: 0.87,
      free_flow_speed: 30.0,
      predicted_speed: 26.1,
      highway_type: 'residential',
      baseline_cost: 58.0,
      proactive_cost: 66.6
    },
    {
      name: 'Indiranagar 1st Stage Inner Connector',
      coords: [[77.6360, 12.9760], [77.6392, 12.9770]],
      severity: 'free',
      congestion_factor: 0.85,
      free_flow_speed: 30.0,
      predicted_speed: 25.5,
      highway_type: 'residential',
      baseline_cost: 32.0,
      proactive_cost: 37.6
    },
    {
      name: 'Suranjandas Road Link',
      coords: [[77.6535, 12.9735], [77.6580, 12.9740]],
      severity: 'moderate',
      congestion_factor: 0.70,
      free_flow_speed: 50.0,
      predicted_speed: 35.0,
      highway_type: 'secondary',
      baseline_cost: 36.0,
      proactive_cost: 51.4
    },
    {
      name: 'Doopanahalli Link Road',
      coords: [[77.6365, 12.9720], [77.6360, 12.9620]],
      severity: 'free',
      congestion_factor: 0.81,
      free_flow_speed: 35.0,
      predicted_speed: 28.3,
      highway_type: 'tertiary',
      baseline_cost: 75.0,
      proactive_cost: 92.5
    },
    {
      name: 'Binnamangala Cross Road',
      coords: [[77.6385, 12.9815], [77.6410, 12.9845]],
      severity: 'free',
      congestion_factor: 0.94,
      free_flow_speed: 30.0,
      predicted_speed: 28.2,
      highway_type: 'residential',
      baseline_cost: 30.0,
      proactive_cost: 31.9
    }
  ];

  return {
    type: 'FeatureCollection',
    features: roads.map((road) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: road.coords, // [ [lng, lat], ... ] GeoJSON standard
      },
      properties: {
        road_name: road.name,
        severity: road.severity,
        congestion_factor: road.congestion_factor,
        free_flow_speed: road.free_flow_speed,
        predicted_speed: road.predicted_speed,
        highway_type: road.highway_type,
        baseline_cost: road.baseline_cost,
        proactive_cost: road.proactive_cost,
      },
    })),
  };
};

export const mockRoadNetwork = createRoadFeatures();

export const mockStats = {
  total_roads: 1250,
  free_count: 795,
  moderate_count: 310,
  severe_count: 145,
  avg_congestion_factor: 0.69,
  area: 'Indiranagar, Bangalore',
  model_name: 'STGCN (Spatial-Temporal Graph ConvNet)',
  prediction_horizon: '15-30 mins ahead',
};

// Preset detailed routes for instant high-impact demos
export const getPresetRouteData = (presetId) => {
  if (presetId === 'defence-colony') {
    return {
      standard_route: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [77.6387, 12.9784],
                [77.6385, 12.9782],
                [77.6440, 12.9780],
                [77.6520, 12.9778],
                [77.6525, 12.9720]
              ]
            },
            properties: {
              label: 'Standard Route (Shortest Path)',
              total_time_sec: 415.0,
              total_distance_m: 2350.0,
              avg_speed_kmh: 20.4,
              congestion_exposure: 'High (Encountered CMH Road Junction Bottleneck)',
              congested_segments: 2,
            }
          }
        ]
      },
      ai_route: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [77.6387, 12.9784],
                [77.6385, 12.9815],
                [77.6465, 12.9810],
                [77.6472, 12.9765],
                [77.6535, 12.9735],
                [77.6525, 12.9720]
              ]
            },
            properties: {
              label: 'AI Proactive Route (STGCN)',
              total_time_sec: 270.0,
              total_distance_m: 2780.0,
              avg_speed_kmh: 37.1,
              congestion_exposure: 'Zero (Flowing via SV Road & Defence Collector)',
              congested_segments: 0,
            }
          }
        ]
      }
    };
  }

  if (presetId === 'domlur-hal') {
    return {
      standard_route: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [77.6380, 12.9610],
                [77.6432, 12.9642],
                [77.6415, 12.9680],
                [77.6402, 12.9725],
                [77.6480, 12.9715],
                [77.6495, 12.9765]
              ]
            },
            properties: {
              label: 'Standard Route (Shortest Path)',
              total_time_sec: 530.0,
              total_distance_m: 3100.0,
              avg_speed_kmh: 21.0,
              congestion_exposure: 'Severe (Stuck at Old Airport Rd & 100ft Junction)',
              congested_segments: 3,
            }
          }
        ]
      },
      ai_route: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [77.6380, 12.9610],
                [77.6360, 12.9620],
                [77.6365, 12.9720],
                [77.6402, 12.9725],
                [77.6480, 12.9715],
                [77.6495, 12.9765]
              ]
            },
            properties: {
              label: 'AI Proactive Route (STGCN)',
              total_time_sec: 345.0,
              total_distance_m: 3450.0,
              avg_speed_kmh: 36.0,
              congestion_exposure: 'Smooth (Bypassed 100ft via Double Rd corridor)',
              congested_segments: 0,
            }
          }
        ]
      }
    };
  }

  // Default: '100ft-bypass'
  return {
    standard_route: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [77.6385, 12.9815],
              [77.6392, 12.9770],
              [77.6402, 12.9725],
              [77.6415, 12.9680],
              [77.6432, 12.9642]
            ]
          },
          properties: {
            label: 'Standard Route (Shortest Path)',
            total_time_sec: 482.5,
            total_distance_m: 3200.0,
            avg_speed_kmh: 23.8,
            congestion_exposure: 'Severe (Directly traverses 100 Feet Road Bottlenecks)',
            congested_segments: 3,
          }
        }
      ]
    },
    ai_route: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [77.6385, 12.9815],
              [77.6465, 12.9810],
              [77.6472, 12.9765],
              [77.6480, 12.9715],
              [77.6488, 12.9660],
              [77.6432, 12.9642]
            ]
          },
          properties: {
            label: 'AI Proactive Route (STGCN)',
            total_time_sec: 310.2,
            total_distance_m: 3850.0,
            avg_speed_kmh: 44.7,
            congestion_exposure: 'Smooth (Bypasses 100ft gridlock via 12th Main Arterial)',
            congested_segments: 0,
          }
        }
      ]
    }
  };
};

// Generate realistic dynamic routes between any two clicked coordinates
export const generateDynamicRoutes = (start, end) => {
  const sLat = Number(start.lat);
  const sLng = Number(start.lng);
  const eLat = Number(end.lat);
  const eLng = Number(end.lng);

  // Standard route: direct path
  const standardCoords = [
    [sLng, sLat],
    [sLng + (eLng - sLng) * 0.35, sLat + (eLat - sLat) * 0.3],
    [sLng + (eLng - sLng) * 0.7, sLat + (eLat - sLat) * 0.65],
    [eLng, eLat]
  ];

  // AI Proactive route: smart detour through free-flowing network
  const offsetLng = (sLng + eLng) / 2 + 0.007; // lateral detour towards free flow 12th Main / 80ft
  const offsetLat = (sLat + eLat) / 2;

  const aiCoords = [
    [sLng, sLat],
    [sLng + 0.003, sLat + (eLat - sLat) * 0.25],
    [offsetLng, offsetLat],
    [eLng + 0.002, eLat - (eLat - sLat) * 0.25],
    [eLng, eLat]
  ];

  // Approximate distance in meters
  const directDistance = Math.hypot((eLat - sLat) * 111000, (eLng - sLng) * 111000 * Math.cos(sLat * Math.PI / 180));
  const stdDist = Math.max(800, Math.round(directDistance * 1.15));
  const aiDist = Math.max(950, Math.round(directDistance * 1.35));

  // AI route is ~30-40% faster despite being slightly longer
  const stdSpeed = 18.5; // km/h (heavy congestion)
  const aiSpeed = 38.0;  // km/h (free flow bypass)

  const stdTime = Math.round((stdDist / 1000) / stdSpeed * 3600);
  const aiTime = Math.round((aiDist / 1000) / aiSpeed * 3600);

  return {
    standard_route: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: standardCoords
          },
          properties: {
            label: 'Standard Route (Shortest Path)',
            total_time_sec: stdTime,
            total_distance_m: stdDist,
            avg_speed_kmh: stdSpeed,
            congested_segments: 3,
            congestion_exposure: 'High Congestion Probability'
          }
        }
      ]
    },
    ai_route: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: aiCoords
          },
          properties: {
            label: 'AI Proactive Route (STGCN)',
            total_time_sec: aiTime,
            total_distance_m: aiDist,
            avg_speed_kmh: aiSpeed,
            congested_segments: 0,
            congestion_exposure: 'AI Proactive Detour via Free-Flowing Collectors'
          }
        }
      ]
    }
  };
};
