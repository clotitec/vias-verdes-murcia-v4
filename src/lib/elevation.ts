export interface ElevationStats {
  gain: number;
  loss: number;
  max: number;
  min: number;
}

/**
 * Calculate elevation statistics from coordinate array.
 * Each coord is [lon, lat, elevation]
 */
export function calculateElevationStats(
  coords: [number, number, number][]
): ElevationStats {
  if (coords.length === 0) {
    return { gain: 0, loss: 0, max: 0, min: 0 };
  }

  let gain = 0;
  let loss = 0;
  let max = coords[0][2];
  let min = coords[0][2];

  for (let i = 1; i < coords.length; i++) {
    const elev = coords[i][2];
    const diff = elev - coords[i - 1][2];

    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);

    if (elev > max) max = elev;
    if (elev < min) min = elev;
  }

  return { gain, loss, max, min };
}
