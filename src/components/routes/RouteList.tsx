'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import RouteCard from './RouteCard';
import type { Route } from '@/types/route';

interface RouteListProps {
  routes: Route[];
  onRouteClick?: (routeId: string) => void;
  onRouteZoom?: (routeId: string) => void;
}

export default function RouteList({ routes, onRouteClick, onRouteZoom }: RouteListProps) {
  const activeFilter = useAppStore((s) => s.activeFilter);
  const searchTerm = useAppStore((s) => s.searchTerm);

  const filteredRoutes = useMemo(() => {
    let result = routes;

    if (activeFilter !== 'all') {
      result = result.filter((r) => r.diff === activeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.location.toLowerCase().includes(term) ||
          r.municipality.toLowerCase().includes(term) ||
          r.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    return result;
  }, [routes, activeFilter, searchTerm]);

  if (filteredRoutes.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No se encontraron rutas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {filteredRoutes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          onClick={onRouteClick}
          onZoom={onRouteZoom}
        />
      ))}
    </div>
  );
}
