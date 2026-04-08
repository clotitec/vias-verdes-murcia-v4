'use client';

import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapContext } from '@/hooks/useMap';

export type MapStyleId = 'outdoor' | 'positron' | 'dark' | 'satellite';

// MapTiler Outdoor requires a free API key from https://cloud.maptiler.com/
// Set NEXT_PUBLIC_MAPTILER_KEY in .env.local
const MAPTILER_KEY = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_MAPTILER_KEY || '')
  : (process.env.NEXT_PUBLIC_MAPTILER_KEY || '');

function getStyles(key: string) {
  return {
    outdoor: {
      name: 'Outdoor',
      url: key
        ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${key}`
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      icon: '🥾',
      description: 'Hillshading, curvas de nivel, senderos',
    },
    positron: {
      name: 'Claro',
      url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      icon: '☀️',
      description: 'Minimalista, rutas destacan',
    },
    dark: {
      name: 'Oscuro',
      url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      icon: '🌙',
      description: 'Modo noche',
    },
    satellite: {
      name: 'Satelite',
      url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      icon: '🛰️',
      description: 'Imagen aerea Esri',
    },
  } as const;
}

const SATELLITE_SOURCE = {
  type: 'raster' as const,
  tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
  tileSize: 256,
  attribution: 'Tiles &copy; Esri',
};

interface MapContainerProps {
  children?: ReactNode;
  initialCenter?: [number, number];
  initialZoom?: number;
  className?: string;
}

export default function MapContainer({
  children,
  initialCenter = [-1.35, 37.85],
  initialZoom = 8,
  className = '',
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const hasKey = !!MAPTILER_KEY;
  const styles = getStyles(MAPTILER_KEY);
  const [activeStyle, setActiveStyle] = useState<MapStyleId>(hasKey ? 'outdoor' : 'positron');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const defaultStyle = hasKey ? styles.outdoor.url : styles.positron.url;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: defaultStyle,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      maxPitch: 60,
    });

    instance.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    instance.on('load', () => {
      setMap(instance);
      setReady(true);
    });

    return () => { instance.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStyle = useCallback(
    (styleId: MapStyleId) => {
      if (!map) return;

      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();

      setReady(false);
      setActiveStyle(styleId);

      const baseUrl = styleId === 'satellite' ? styles.positron.url : styles[styleId].url;
      map.setStyle(baseUrl);

      map.once('style.load', () => {
        map.setCenter(center);
        map.setZoom(zoom);
        map.setBearing(bearing);
        map.setPitch(pitch);

        if (styleId === 'satellite') {
          if (!map.getSource('satellite')) {
            map.addSource('satellite', SATELLITE_SOURCE);
          }
          map.addLayer({ id: 'satellite-layer', type: 'raster', source: 'satellite' });
        }

        setReady(true);
      });
    },
    [map, styles]
  );

  return (
    <MapContext.Provider value={map}>
      <div className="relative w-full h-full">
        <div ref={containerRef} className={`w-full h-full ${className}`} />

        {/* Style Selector */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 lg:bottom-6 lg:left-auto lg:right-4 lg:translate-x-0">
          <div
            className="flex gap-0.5 p-1 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(201, 212, 196, 0.4)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
            }}
          >
            {(Object.entries(styles) as [MapStyleId, typeof styles[MapStyleId]][]).map(([id, style]) => {
              const isActive = activeStyle === id;
              if (id === 'outdoor' && !hasKey) return null;

              return (
                <button
                  key={id}
                  onClick={() => changeStyle(id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
                    isActive ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  }`}
                  style={{
                    color: isActive ? 'var(--murcia-primary, #5A9E8F)' : 'var(--text-secondary, #5A7A72)',
                  }}
                  title={style.description}
                >
                  <span className="text-sm">{style.icon}</span>
                  <span className="hidden sm:inline">{style.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {map && ready && children}
      </div>
    </MapContext.Provider>
  );
}
