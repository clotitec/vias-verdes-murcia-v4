'use client';

import type { Route } from '@/types/route';

interface RouteCardProps {
  route: Route;
  onClick?: (routeId: string) => void;
  onZoom?: (routeId: string) => void;
  compact?: boolean;
}

const DIFF_LABELS: Record<string, { label: string; class: string }> = {
  easy: { label: 'Facil', class: 'badge-easy' },
  medium: { label: 'Media', class: 'badge-medium' },
  moderate: { label: 'Moderada', class: 'badge-moderate' },
};

export default function RouteCard({ route, onClick, onZoom, compact = false }: RouteCardProps) {
  const diff = DIFF_LABELS[route.diff] || DIFF_LABELS.easy;

  return (
    <div
      className="card-item group cursor-pointer"
      onClick={() => onClick?.(route.id)}
    >
      <div className="flex items-start gap-3">
        {/* Route number badge */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: route.color.main }}
        >
          {route.num}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm leading-tight truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {route.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {route.km} km
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {route.time}
            </span>
          </div>

          {!compact && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`${diff.class} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
                {diff.label}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(90, 158, 143, 0.1)',
                  color: 'var(--murcia-primary, #5A9E8F)',
                }}>
                {route.type === 'lineal' ? 'Lineal' : 'Circular'}
              </span>
              {route.status === 'coming_soon' && (
                <span className="badge-coming-soon text-[10px] px-2 py-0.5 rounded-full font-medium">
                  Proximamente
                </span>
              )}
            </div>
          )}
        </div>

        {/* Zoom button */}
        {onZoom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoom(route.id);
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(90, 158, 143, 0.1)' }}
            title="Ver en mapa"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6m-3-3h6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
