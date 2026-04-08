/**
 * Haversine distance between two points in km
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Interpolate coordinates along a route at a given km distance.
 * Returns [lon, lat]
 */
export function interpolateCoord(
  coords: [number, number, number][],
  totalKm: number,
  km: number,
  reversed = false
): [number, number] {
  if (!coords || coords.length < 2) return [0, 0];

  let fraction = Math.min(Math.max(km / totalKm, 0), 1);
  if (reversed) fraction = 1 - fraction;

  const targetIdx = fraction * (coords.length - 1);
  const idx = Math.floor(targetIdx);
  const t = targetIdx - idx;

  if (idx >= coords.length - 1) {
    return [coords[coords.length - 1][0], coords[coords.length - 1][1]];
  }

  const c1 = coords[idx];
  const c2 = coords[idx + 1];
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
  ];
}
