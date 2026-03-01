// Bus Routing with OSRM Public API
// No npm packages needed - just fetch!

interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][]; // [lng, lat]
  };
}

interface ETAResult {
  minutes: number;
  minETA: number; // lower bound
  maxETA: number; // upper bound
  confidence: number; // 0-1
}

/**
 * Get route from OSRM public API
 * NOTE: Coordinates are [lng, lat] for OSRM, not [lat, lng]!
 */
export async function getRouteFromOSRM(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<OSRMRoute | null> {
  try {
    // IMPORTANT: OSRM uses lng,lat order!
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('No route found');
      return null;
    }
    
    return data.routes[0];
  } catch (error) {
    console.error('OSRM fetch error:', error);
    return null;
  }
}

/**
 * Calculate ETA with realistic time window
 * Accounts for traffic uncertainty
 */
export async function calculateETA(
  busLat: number,
  busLng: number,
  stopLat: number,
  stopLng: number
): Promise<ETAResult | null> {
  const route = await getRouteFromOSRM(busLat, busLng, stopLat, stopLng);
  
  if (!route) return null;
  
  const baseMinutes = Math.ceil(route.duration / 60);
  
  // Add traffic uncertainty (±20% for Manila traffic)
  const trafficFactor = 0.2;
  const minETA = Math.max(1, Math.floor(baseMinutes * (1 - trafficFactor)));
  const maxETA = Math.ceil(baseMinutes * (1 + trafficFactor));
  
  return {
    minutes: baseMinutes,
    minETA,
    maxETA,
    confidence: 0.75 // 75% confidence in this estimate
  };
}

/**
 * Smooth GPS noise using simple moving average
 * Use this before sending to OSRM for better results
 */
export function smoothGPSPoints(
  points: { lat: number; lng: number }[],
  windowSize: number = 3
): { lat: number; lng: number }[] {
  if (points.length < windowSize) return points;
  
  const smoothed: { lat: number; lng: number }[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(points.length, i + Math.ceil(windowSize / 2));
    const window = points.slice(start, end);
    
    const avgLat = window.reduce((sum, p) => sum + p.lat, 0) / window.length;
    const avgLng = window.reduce((sum, p) => sum + p.lng, 0) / window.length;
    
    smoothed.push({ lat: avgLat, lng: avgLng });
  }
  
  return smoothed;
}

/**
 * Get route polyline for display on map
 * Returns coordinates in [lat, lng] order for Leaflet
 */
export async function getRoutePolyline(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<[number, number][] | null> {
  const route = await getRouteFromOSRM(startLat, startLng, endLat, endLng);
  
  if (!route) return null;
  
  // Convert OSRM [lng, lat] to Leaflet [lat, lng]
  return route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}