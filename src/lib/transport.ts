import type { TransportStop, TransportType } from '@/types/transport';
import { haversineDistance } from '@/lib/geo';

const TRANSPORT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const MAIN_STATIONS: TransportStop[] = [
  { id: 'renfe_murcia', lat: 37.9838, lon: -1.1305, name: 'Murcia del Carmen', type: 'train', operator: 'Renfe', lines: ['C-1', 'C-2'] },
  { id: 'renfe_cartagena', lat: 37.6050, lon: -0.9863, name: 'Cartagena', type: 'train', operator: 'Renfe', lines: ['C-1'] },
  { id: 'renfe_aguilas', lat: 37.4075, lon: -1.5794, name: 'Aguilas', type: 'train', operator: 'Renfe', lines: ['C-2'] },
  { id: 'renfe_totana', lat: 37.7685, lon: -1.5055, name: 'Totana', type: 'train', operator: 'Renfe', lines: ['C-2'] },
  { id: 'renfe_cieza', lat: 38.2400, lon: -1.4178, name: 'Cieza', type: 'train', operator: 'Renfe', lines: ['MD'] },
  { id: 'renfe_molina', lat: 38.0525, lon: -1.2147, name: 'Molina de Segura', type: 'train', operator: 'Renfe', lines: [] },
];

export function categorizeStop(tags: Record<string, string>): { type: TransportType; name: string } {
  if (tags.railway === 'station' || tags.railway === 'halt') {
    return { type: tags.railway === 'station' ? 'train' : 'halt', name: tags.name || 'Estacion' };
  }
  if (tags.amenity === 'bus_station') {
    return { type: 'bus_station', name: tags.name || 'Estacion de autobuses' };
  }
  if (tags.highway === 'bus_stop' || tags.public_transport === 'platform') {
    return { type: 'bus', name: tags.name || 'Parada de autobus' };
  }
  if (tags.railway === 'tram_stop') {
    return { type: 'tram', name: tags.name || 'Parada de tranvia' };
  }
  if (tags.amenity === 'taxi') {
    return { type: 'taxi', name: tags.name || 'Parada de taxi' };
  }
  return { type: 'bus', name: tags.name || 'Parada' };
}

export function getDistanceColor(distanceKm: number): string {
  if (distanceKm < 1) return '#059669';  // green
  if (distanceKm < 3) return '#D97706';  // yellow/amber
  if (distanceKm < 5) return '#EA580C';  // orange
  return '#DC2626';                       // red
}

export async function fetchTransportNear(
  lat: number,
  lon: number,
  radiusKm: number = 5
): Promise<TransportStop[]> {
  const cacheKey = `transport_${lat.toFixed(2)}_${lon.toFixed(2)}_${radiusKm}`;

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.fetchedAt < TRANSPORT_CACHE_TTL) return data.stops;
      }
    } catch { /* ignore */ }
  }

  const radiusM = radiusKm * 1000;
  const query = `
    [out:json][timeout:15];
    (
      node["railway"="station"](around:${radiusM},${lat},${lon});
      node["railway"="halt"](around:${radiusM},${lat},${lon});
      node["amenity"="bus_station"](around:${radiusM},${lat},${lon});
      node["highway"="bus_stop"](around:${radiusM},${lat},${lon});
      node["railway"="tram_stop"](around:${radiusM},${lat},${lon});
    );
    out body;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!res.ok) return mergeWithStatic([], lat, lon, radiusKm);
    const json = await res.json();

    const stops: TransportStop[] = (json.elements || []).map((el: { id: number; lat: number; lon: number; tags: Record<string, string> }) => {
      const { type, name } = categorizeStop(el.tags || {});
      const distance = haversineDistance(lat, lon, el.lat, el.lon);
      return {
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name,
        type,
        operator: el.tags?.operator || '',
        lines: el.tags?.line ? el.tags.line.split(';') : [],
        distance,
      };
    });

    const merged = mergeWithStatic(stops, lat, lon, radiusKm);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ stops: merged, fetchedAt: Date.now() }));
      } catch { /* ignore */ }
    }

    return merged;
  } catch {
    return mergeWithStatic([], lat, lon, radiusKm);
  }
}

function mergeWithStatic(
  overpassStops: TransportStop[],
  lat: number,
  lon: number,
  radiusKm: number
): TransportStop[] {
  const result = [...overpassStops];

  for (const station of MAIN_STATIONS) {
    const dist = haversineDistance(lat, lon, station.lat, station.lon);
    if (dist > radiusKm) continue;

    const isDuplicate = result.some(
      (s) => haversineDistance(s.lat, s.lon, station.lat, station.lon) < 0.3
    );
    if (!isDuplicate) {
      result.push({ ...station, distance: dist });
    }
  }

  return result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
}
