'use client';

import { useState, useCallback } from 'react';
import { useMap } from '@/hooks/useMap';

interface OverlayLayer {
  id: string;
  name: string;
  icon: string;
  description: string;
  source: {
    type: 'raster' | 'raster-dem';
    tiles: string[];
    tileSize: number;
    attribution?: string;
    maxzoom?: number;
  };
  layerConfig?: Record<string, unknown>;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';

const OVERLAY_LAYERS: OverlayLayer[] = [
  {
    id: 'ign-topo',
    name: 'Topo IGN',
    icon: '🗺️',
    description: 'Mapa Topografico Nacional (IGN España)',
    source: {
      type: 'raster',
      tiles: [
        'https://www.ign.es/wmts/ign-base?service=WMTS&request=GetTile&version=1.0.0&layer=IGNBaseTodo&style=default&tilematrixset=GoogleMapsCompatible&tilematrix={z}&tilerow={y}&tilecol={x}&format=image/png',
      ],
      tileSize: 256,
      attribution: '&copy; IGN España',
      maxzoom: 18,
    },
  },
  {
    id: 'ign-pnoa',
    name: 'Ortofoto',
    icon: '📸',
    description: 'Ortofotografia aerea PNOA (IGN España)',
    source: {
      type: 'raster',
      tiles: [
        'https://www.ign.es/wmts/pnoa-ma?service=WMTS&request=GetTile&version=1.0.0&layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&tilematrix={z}&tilerow={y}&tilecol={x}&format=image/jpeg',
      ],
      tileSize: 256,
      attribution: '&copy; IGN PNOA',
      maxzoom: 19,
    },
  },
  {
    id: 'hillshade',
    name: 'Relieve',
    icon: '⛰️',
    description: 'Sombreado de relieve (hillshading)',
    source: {
      type: 'raster',
      tiles: MAPTILER_KEY
        ? [`https://api.maptiler.com/tiles/hillshade/{z}/{x}/{y}.webp?key=${MAPTILER_KEY}`]
        : ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'], // fallback
      tileSize: 256,
      maxzoom: 14,
    },
  },
];

export default function LayerControls() {
  const map = useMap();
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [terrainEnabled, setTerrainEnabled] = useState(false);

  const toggleLayer = useCallback(
    (layer: OverlayLayer) => {
      if (!map) return;

      const isActive = activeLayers.has(layer.id);

      if (isActive) {
        // Remove
        if (map.getLayer(`${layer.id}-layer`)) map.removeLayer(`${layer.id}-layer`);
        if (map.getSource(layer.id)) map.removeSource(layer.id);
        setActiveLayers((prev) => {
          const next = new Set(prev);
          next.delete(layer.id);
          return next;
        });
      } else {
        // Add
        if (!map.getSource(layer.id)) {
          map.addSource(layer.id, layer.source as maplibregl.SourceSpecification);
        }

        // Insert below route layers if possible
        const firstRouteLayer = map.getStyle().layers?.find((l) => l.id.startsWith('route-'));
        map.addLayer(
          {
            id: `${layer.id}-layer`,
            type: 'raster',
            source: layer.id,
            paint: {
              'raster-opacity': layer.id === 'hillshade' ? 0.4 : 0.85,
            },
          },
          firstRouteLayer?.id
        );

        setActiveLayers((prev) => new Set(prev).add(layer.id));
      }
    },
    [map, activeLayers]
  );

  const toggleTerrain3D = useCallback(() => {
    if (!map) return;

    if (terrainEnabled) {
      map.setTerrain(null);
      if (map.getSource('terrain-dem')) map.removeSource('terrain-dem');
      setTerrainEnabled(false);
    } else {
      // Add terrain DEM source
      if (!map.getSource('terrain-dem')) {
        const demUrl = MAPTILER_KEY
          ? `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${MAPTILER_KEY}`
          : 'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png';

        map.addSource('terrain-dem', {
          type: 'raster-dem',
          tiles: [demUrl],
          tileSize: 256,
          maxzoom: 14,
        });
      }

      map.setTerrain({ source: 'terrain-dem', exaggeration: 1.5 });
      // Tilt the camera for 3D effect
      map.easeTo({ pitch: 50, duration: 1000 });
      setTerrainEnabled(true);
    }
  }, [map, terrainEnabled]);

  return (
    <div className="absolute left-4 top-20 z-10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`map-control-glass ${open ? 'active' : ''}`}
        title="Capas"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* Layer panel */}
      {open && (
        <div
          className="mt-2 p-3 rounded-2xl w-56"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(201, 212, 196, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Capas
          </div>

          {/* Overlay layers */}
          {OVERLAY_LAYERS.map((layer) => {
            const isActive = activeLayers.has(layer.id);
            // Hide hillshade if no MapTiler key
            if (layer.id === 'hillshade' && !MAPTILER_KEY) return null;

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all mb-1 ${
                  isActive ? 'bg-white/80 shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <span className="text-base">{layer.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium"
                    style={{ color: isActive ? 'var(--murcia-primary)' : 'var(--text-primary)' }}
                  >
                    {layer.name}
                  </div>
                  <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {layer.description}
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isActive ? 'border-[var(--murcia-primary)] bg-[var(--murcia-primary)]' : 'border-gray-300'
                  }`}
                >
                  {isActive && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* 3D Terrain toggle */}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(201, 212, 196, 0.3)' }}>
            <button
              onClick={toggleTerrain3D}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                terrainEnabled ? 'bg-white/80 shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              <span className="text-base">🏔️</span>
              <div className="flex-1">
                <div
                  className="text-xs font-medium"
                  style={{ color: terrainEnabled ? 'var(--murcia-primary)' : 'var(--text-primary)' }}
                >
                  Terreno 3D
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {MAPTILER_KEY ? 'Relieve con exageracion x1.5' : 'Demo (limitado)'}
                </div>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  terrainEnabled ? 'bg-[var(--murcia-primary)]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    terrainEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
