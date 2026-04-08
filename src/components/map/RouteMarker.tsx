'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '@/hooks/useMap';
import type { Route } from '@/types/route';

interface RouteMarkerProps {
  route: Route;
  onClick?: (routeId: string) => void;
}

export default function RouteMarker({ route, onClick }: RouteMarkerProps) {
  const map = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map || route.coords.length === 0) return;

    // Place marker at route midpoint
    const midIdx = Math.floor(route.coords.length / 2);
    const [lon, lat] = route.coords[midIdx];

    const el = document.createElement('div');
    el.className = 'route-number-marker';
    el.style.cssText = `
      width: 28px; height: 28px; border-radius: 50%;
      background: ${route.color.main}; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; font-family: Inter, sans-serif;
      border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer; transition: transform 0.2s;
    `;
    el.textContent = String(route.num);
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    el.addEventListener('click', () => onClick?.(route.id));

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lon, lat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, route.id]);

  return null;
}
