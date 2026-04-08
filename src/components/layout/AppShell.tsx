'use client';

import { useCallback, type ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomSheet from './MobileBottomSheet';
import RouteFilters from '@/components/routes/RouteFilters';
import RouteList from '@/components/routes/RouteList';
import { useMap } from '@/hooks/useMap';
import type { Route } from '@/types/route';

interface AppShellProps {
  routes: Route[];
  children: ReactNode;
  onRouteClick?: (routeId: string) => void;
}

export default function AppShell({ routes, children, onRouteClick }: AppShellProps) {
  const map = useMap();

  const handleZoom = useCallback(
    (routeId: string) => {
      if (!map) return;

      if (routeId === 'reset') {
        map.flyTo({ center: [-1.35, 37.85], zoom: 8 });
        return;
      }

      if (routeId.startsWith('locate:')) {
        const [lon, lat] = routeId.replace('locate:', '').split(',').map(Number);
        map.flyTo({ center: [lon, lat], zoom: 14 });
        return;
      }

      const route = routes.find((r) => r.id === routeId);
      if (!route || route.coords.length === 0) return;

      const bounds = route.coords.reduce(
        (b, [lon, lat]) => {
          b[0][0] = Math.min(b[0][0], lon);
          b[0][1] = Math.min(b[0][1], lat);
          b[1][0] = Math.max(b[1][0], lon);
          b[1][1] = Math.max(b[1][1], lat);
          return b;
        },
        [
          [Infinity, Infinity],
          [-Infinity, -Infinity],
        ] as [[number, number], [number, number]]
      );

      map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    },
    [map, routes]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <DesktopSidebar
        routes={routes}
        onRouteClick={onRouteClick}
        onRouteZoom={handleZoom}
      />

      <main className="flex-1 relative">
        {children}
      </main>

      <MobileBottomSheet>
        <RouteFilters />
        <RouteList
          routes={routes}
          onRouteClick={onRouteClick}
          onRouteZoom={handleZoom}
        />
      </MobileBottomSheet>
    </div>
  );
}
