'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import BoundaryMask from '@/components/map/BoundaryMask';
import RouteLayer from '@/components/map/RouteLayer';
import RouteMarker from '@/components/map/RouteMarker';
import MapControls from '@/components/map/MapControls';
import LayerControls from '@/components/map/LayerControls';
import ElevationProfile from '@/components/elevation/ElevationProfile';
import { viasVerdes } from '@/data/routes';

const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full" style={{ background: 'var(--bg-primary, #F4F3EE)' }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(90,158,143,0.1)' }}>
          <img src="/images/logo-vv-murcia.webp" alt="" className="w-full h-full object-contain" />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Cargando mapa...
        </p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const handleRouteClick = useCallback((routeId: string) => {
    setSelectedRoute((prev) => (prev === routeId ? null : routeId));
  }, []);

  const selectedRouteData = selectedRoute
    ? viasVerdes.find((r) => r.id === selectedRoute)
    : null;

  return (
    <MapContainer>
      <AppShell routes={viasVerdes} onRouteClick={handleRouteClick}>
        {/* Map layers */}
        <BoundaryMask />
        {viasVerdes.map((route) => (
          <RouteLayer
            key={route.id}
            route={route}
            onClick={handleRouteClick}
          />
        ))}
        {viasVerdes.map((route) => (
          <RouteMarker
            key={`marker-${route.id}`}
            route={route}
            onClick={handleRouteClick}
          />
        ))}
        <MapControls />
        <LayerControls />

        {/* Elevation Profile - shown when a route is selected */}
        {selectedRouteData && (
          <ElevationProfile
            route={selectedRouteData}
            onClose={() => setSelectedRoute(null)}
          />
        )}
      </AppShell>
    </MapContainer>
  );
}
