'use client';

import { useEffect } from 'react';
import { useMap } from '@/hooks/useMap';
import type { Route } from '@/types/route';

interface RouteLayerProps {
  route: Route;
  visible?: boolean;
  onClick?: (routeId: string) => void;
}

export default function RouteLayer({ route, visible = true, onClick }: RouteLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const sourceId = `route-${route.id}`;
    const glowId = `${sourceId}-glow`;
    const casingId = `${sourceId}-casing`;
    const lineId = `${sourceId}-line`;

    // Add source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { id: route.id, name: route.name },
          geometry: {
            type: 'LineString',
            coordinates: route.coords.map(([lon, lat]) => [lon, lat]),
          },
        },
      });
    }

    // Glow layer
    if (!map.getLayer(glowId)) {
      map.addLayer({
        id: glowId,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': route.color.glow,
          'line-width': 12,
          'line-opacity': 0.25,
          'line-blur': 8,
        },
      });
    }

    // Casing layer (outline)
    if (!map.getLayer(casingId)) {
      map.addLayer({
        id: casingId,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 5,
          'line-opacity': 0.7,
        },
      });
    }

    // Main line
    if (!map.getLayer(lineId)) {
      map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': route.color.main,
          'line-width': 3.5,
          'line-opacity': 1,
        },
      });
    }

    // Click handler
    const handleClick = () => onClick?.(route.id);
    map.on('click', lineId, handleClick);

    // Hover cursor
    const handleEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
      map.setPaintProperty(lineId, 'line-width', 5);
    };
    const handleLeave = () => {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty(lineId, 'line-width', 3.5);
    };
    map.on('mouseenter', lineId, handleEnter);
    map.on('mouseleave', lineId, handleLeave);

    return () => {
      map.off('click', lineId, handleClick);
      map.off('mouseenter', lineId, handleEnter);
      map.off('mouseleave', lineId, handleLeave);

      [lineId, casingId, glowId].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, route.id, visible]);

  // Toggle visibility
  useEffect(() => {
    if (!map) return;
    const visibility = visible ? 'visible' : 'none';
    [`route-${route.id}-glow`, `route-${route.id}-casing`, `route-${route.id}-line`].forEach(
      (id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
      }
    );
  }, [map, route.id, visible]);

  return null;
}
