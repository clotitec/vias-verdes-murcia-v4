'use client';

import { useMap } from '@/hooks/useMap';
import { useAppStore } from '@/store/app-store';

export default function MapControls() {
  const map = useMap();
  const transportVisible = useAppStore((s) => s.transportMarkersVisible);
  const toggleTransport = useAppStore((s) => s.toggleTransportMarkers);

  const handleLocate = () => {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
        });
      },
      () => alert('No se pudo obtener la ubicacion')
    );
  };

  const handleResetView = () => {
    map?.flyTo({ center: [-1.35, 37.85], zoom: 8 });
  };

  return (
    <div className="absolute right-4 top-20 flex flex-col gap-2 z-10">
      <button onClick={handleLocate} className="map-control-glass" title="Mi ubicacion">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4m0 12v4m-10-10h4m12 0h4" />
        </svg>
      </button>

      <button onClick={handleResetView} className="map-control-glass" title="Vista general">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
      </button>

      <button
        onClick={toggleTransport}
        className={`map-control-glass ${transportVisible ? 'active' : ''}`}
        title="Transporte publico"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 6v6m8-6v6M4 18h16M6 6h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" />
          <circle cx="7.5" cy="16.5" r="1.5" />
          <circle cx="16.5" cy="16.5" r="1.5" />
        </svg>
      </button>
    </div>
  );
}
