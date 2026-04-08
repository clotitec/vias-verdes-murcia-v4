'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import RouteList from '@/components/routes/RouteList';
import RouteFilters from '@/components/routes/RouteFilters';
import LanguageSwitcher from './LanguageSwitcher';
import type { Route } from '@/types/route';

interface DesktopSidebarProps {
  routes: Route[];
  onRouteClick?: (routeId: string) => void;
  onRouteZoom?: (routeId: string) => void;
}

type Tab = 'routes' | 'pois' | 'filters';

export default function DesktopSidebar({ routes, onRouteClick, onRouteZoom }: DesktopSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('routes');
  const searchTerm = useAppStore((s) => s.searchTerm);
  const setSearchTerm = useAppStore((s) => s.setSearchTerm);

  return (
    <aside
      className="hidden lg:flex flex-col h-full overflow-hidden"
      style={{
        width: 380,
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRight: '1px solid rgba(201, 212, 196, 0.3)',
      }}
    >
      {/* Header */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(201, 212, 196, 0.3)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(201, 212, 196, 0.5)',
            }}
          >
            <img
              src="/images/logo-vv-murcia.webp"
              className="w-full h-full object-contain"
              alt="Vias Verdes"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Vias Verdes
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Region de Murcia
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar via verde..."
            className="search-glass w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="px-4 py-2.5 flex gap-1"
        style={{
          background: 'rgba(90, 158, 143, 0.04)',
          borderBottom: '1px solid rgba(201, 212, 196, 0.3)',
        }}
      >
        {(['routes', 'pois', 'filters'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-item-glass flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === tab ? 'bg-white/80 shadow-sm' : ''
            }`}
            style={{
              color: activeTab === tab ? 'var(--murcia-primary, #5A9E8F)' : 'var(--text-secondary)',
            }}
          >
            {tab === 'routes' ? 'Rutas' : tab === 'pois' ? 'POIs' : 'Filtros'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'routes' && (
          <>
            <RouteFilters />
            <RouteList routes={routes} onRouteClick={onRouteClick} onRouteZoom={onRouteZoom} />
          </>
        )}
        {activeTab === 'pois' && (
          <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            POIs - Proximamente
          </div>
        )}
        {activeTab === 'filters' && (
          <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Filtros avanzados - Proximamente
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(201, 212, 196, 0.3)' }}>
        <button
          onClick={() => onRouteZoom?.('reset')}
          className="btn-glass-secondary flex-1 text-xs py-2 rounded-xl"
        >
          Vista general
        </button>
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                // Emitted via onRouteZoom with special id
                onRouteZoom?.(`locate:${pos.coords.longitude},${pos.coords.latitude}`);
              });
            }
          }}
          className="btn-glass-secondary flex-1 text-xs py-2 rounded-xl"
        >
          Mi ubicacion
        </button>
      </div>
    </aside>
  );
}
