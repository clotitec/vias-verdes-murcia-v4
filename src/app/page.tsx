'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { viasVerdes } from '@/data/routes';

const MapView = dynamic(() => import('@/components/map/MapView'), {
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
  return <MapView />;
}
