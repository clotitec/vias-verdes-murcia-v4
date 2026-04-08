'use client';

import { useEffect, useState } from 'react';
import { useMap } from '@/hooks/useMap';
import { useAppStore } from '@/store/app-store';

export default function BoundaryMask() {
  const map = useMap();
  const isSatellite = useAppStore((s) => s.isSatellite);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!map || loaded) return;

    async function loadBoundary() {
      try {
        const response = await fetch(
          'https://nominatim.openstreetmap.org/search?q=Región de Murcia,Spain&format=json&polygon_geojson=1&limit=1',
          { headers: { 'User-Agent': 'ViasVerdesMurcia/2.0' } }
        );
        const data = await response.json();
        if (!data?.[0]?.geojson) return;

        const geojson = data[0].geojson;
        const boundary: [number, number][] =
          geojson.type === 'Polygon'
            ? geojson.coordinates[0]
            : geojson.coordinates.reduce(
                (a: [number, number][], b: [number, number][][]) =>
                  b[0].length > a.length ? b[0] : a,
                []
              );

        const world: [number, number][] = [
          [-180, 90], [180, 90], [180, -90], [-180, -90], [-180, 90],
        ];

        if (!map!.getSource('mask')) {
          map!.addSource('mask', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Polygon', coordinates: [world, boundary] },
            },
          });
          map!.addLayer({
            id: 'mask-fill',
            type: 'fill',
            source: 'mask',
            paint: { 'fill-color': '#000', 'fill-opacity': 0.35 },
          });
        }

        if (!map!.getSource('boundary-line')) {
          map!.addSource('boundary-line', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [...boundary, boundary[0]],
              },
            },
          });
          map!.addLayer({
            id: 'boundary-stroke',
            type: 'line',
            source: 'boundary-line',
            paint: { 'line-color': '#FFFFFF', 'line-width': 2, 'line-opacity': 0.5 },
          });
        }

        setLoaded(true);
      } catch (e) {
        console.warn('Boundary load failed, using fallback:', e);
      }
    }

    loadBoundary();
  }, [map, loaded]);

  // Update mask opacity when satellite mode changes
  useEffect(() => {
    if (!map || !loaded) return;
    if (map.getLayer('mask-fill')) {
      map.setPaintProperty('mask-fill', 'fill-opacity', isSatellite ? 0.5 : 0.35);
    }
  }, [map, loaded, isSatellite]);

  return null;
}
