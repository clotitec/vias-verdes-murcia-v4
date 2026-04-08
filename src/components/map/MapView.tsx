'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { viasVerdes } from '@/data/routes';
import type { Route } from '@/types/route';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';

const STYLES = {
  positron: {
    name: 'Claro', icon: '☀️',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  voyager: {
    name: 'Color', icon: '🗺️',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  },
  dark: {
    name: 'Oscuro', icon: '🌙',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  satellite: {
    name: 'Satelite', icon: '🛰️',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  ...(MAPTILER_KEY ? {
    outdoor: {
      name: 'Outdoor', icon: '🥾',
      url: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
    },
  } : {}),
};

type StyleId = keyof typeof STYLES;

const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: 'Facil', color: '#059669' },
  medium: { label: 'Media', color: '#D97706' },
  moderate: { label: 'Moderada', color: '#EA580C' },
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeStyle, setActiveStyle] = useState<StyleId>(MAPTILER_KEY ? 'outdoor' as StyleId : 'positron');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const defaultUrl = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: defaultUrl,
      center: [-1.35, 37.85],
      zoom: 8,
      attributionControl: false,
      maxPitch: 60,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      mapRef.current = map;
      addRoutes(map);
      loadBoundary(map);
      setMapLoaded(true);
    });

    return () => { map.remove(); };
  }, []);

  // Add route layers
  function addRoutes(map: maplibregl.Map) {
    viasVerdes.forEach((route) => {
      const sourceId = `route-${route.id}`;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { id: route.id },
          geometry: {
            type: 'LineString',
            coordinates: route.coords.map(([lon, lat]) => [lon, lat]),
          },
        },
      });

      // Glow
      map.addLayer({
        id: `${sourceId}-glow`,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': route.color.glow, 'line-width': 12, 'line-opacity': 0.25, 'line-blur': 8 },
      });

      // Casing
      map.addLayer({
        id: `${sourceId}-casing`,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 5, 'line-opacity': 0.7 },
      });

      // Line
      map.addLayer({
        id: `${sourceId}-line`,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': route.color.main, 'line-width': 3.5 },
      });

      // Click
      map.on('click', `${sourceId}-line`, () => {
        setSelectedRoute((prev) => prev === route.id ? null : route.id);
        zoomToRoute(map, route);
      });

      map.on('mouseenter', `${sourceId}-line`, () => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty(`${sourceId}-line`, 'line-width', 5);
      });
      map.on('mouseleave', `${sourceId}-line`, () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty(`${sourceId}-line`, 'line-width', 3.5);
      });

      // Route number marker
      const midIdx = Math.floor(route.coords.length / 2);
      const [lon, lat] = route.coords[midIdx];
      const el = document.createElement('div');
      el.style.cssText = `width:28px;height:28px;border-radius:50%;background:${route.color.main};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;`;
      el.textContent = String(route.num);
      el.addEventListener('click', () => {
        setSelectedRoute((prev) => prev === route.id ? null : route.id);
        zoomToRoute(map, route);
      });
      new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map);
    });
  }

  function zoomToRoute(map: maplibregl.Map, route: Route) {
    const bounds = route.coords.reduce(
      (b, [lon, lat]) => {
        b[0][0] = Math.min(b[0][0], lon);
        b[0][1] = Math.min(b[0][1], lat);
        b[1][0] = Math.max(b[1][0], lon);
        b[1][1] = Math.max(b[1][1], lat);
        return b;
      },
      [[Infinity, Infinity], [-Infinity, -Infinity]] as [[number, number], [number, number]]
    );
    map.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 400, right: 80 }, maxZoom: 14 });
  }

  async function loadBoundary(map: maplibregl.Map) {
    try {
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?q=Región de Murcia,Spain&format=json&polygon_geojson=1&limit=1',
        { headers: { 'User-Agent': 'ViasVerdesMurcia/2.0' } }
      );
      const data = await res.json();
      if (!data?.[0]?.geojson) return;
      const geojson = data[0].geojson;
      const boundary = geojson.type === 'Polygon'
        ? geojson.coordinates[0]
        : geojson.coordinates.reduce((a: number[][], b: number[][][]) => b[0].length > a.length ? b[0] : a, []);

      const world = [[-180, 90], [180, 90], [180, -90], [-180, -90], [-180, 90]];
      map.addSource('mask', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [world, boundary] } },
      });
      map.addLayer({ id: 'mask-fill', type: 'fill', source: 'mask', paint: { 'fill-color': '#000', 'fill-opacity': 0.35 } });
      map.addSource('boundary-line', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [...boundary, boundary[0]] } },
      });
      map.addLayer({ id: 'boundary-stroke', type: 'line', source: 'boundary-line', paint: { 'line-color': '#FFF', 'line-width': 2, 'line-opacity': 0.5 } });

      // Move mask below routes
      viasVerdes.forEach((r) => {
        const glowId = `route-${r.id}-glow`;
        if (map.getLayer(glowId)) map.moveLayer('mask-fill', glowId);
      });
    } catch { /* fallback - no boundary */ }
  }

  // Change map style
  const changeStyle = useCallback((styleId: StyleId) => {
    const map = mapRef.current;
    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();

    setActiveStyle(styleId);
    setMapLoaded(false);

    const url = STYLES[styleId]?.url || STYLES.positron.url;
    map.setStyle(url);

    map.once('style.load', () => {
      map.setCenter(center);
      map.setZoom(zoom);
      map.setBearing(bearing);
      map.setPitch(pitch);

      if (styleId === 'satellite') {
        map.addSource('satellite-tiles', {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
        });
        map.addLayer({ id: 'satellite-layer', type: 'raster', source: 'satellite-tiles' });
      }

      addRoutes(map);
      loadBoundary(map);
      setMapLoaded(true);
    });
  }, []);

  // Filter routes for sidebar
  const filteredRoutes = viasVerdes.filter((r) => {
    if (filter !== 'all' && r.diff !== filter) return false;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      return r.name.toLowerCase().includes(t) || r.location.toLowerCase().includes(t) || r.municipality.toLowerCase().includes(t);
    }
    return true;
  });

  const selectedRouteData = selectedRoute ? viasVerdes.find((r) => r.id === selectedRoute) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar - desktop */}
      <aside
        className="hidden lg:flex flex-col h-full overflow-hidden flex-shrink-0"
        style={{
          width: 380,
          background: 'rgba(244, 243, 238, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderRight: '1px solid rgba(201, 212, 196, 0.3)',
        }}
      >
        {/* Header */}
        <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(201, 212, 196, 0.3)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(201,212,196,0.5)' }}>
              <img src="/images/logo-vv-murcia.webp" className="w-full h-full object-contain" alt="VV" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Vias Verdes</h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Region de Murcia</p>
            </div>
            <a href="/dashboard" className="text-[10px] font-medium px-2 py-1 rounded-lg hover:bg-white/50 transition-colors"
              style={{ color: 'var(--murcia-primary, #5A9E8F)' }}>
              Dashboard
            </a>
          </div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar via verde..."
              className="search-glass w-full pl-10 pr-4 py-2.5 text-sm" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(201,212,196,0.3)', background: 'rgba(90,158,143,0.04)' }}>
          {[{ id: 'all', label: 'Todas' }, { id: 'easy', label: 'Facil' }, { id: 'medium', label: 'Media' }, { id: 'moderate', label: 'Moderada' }].map(({ id, label }) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === id ? 'bg-white/80 shadow-sm' : 'hover:bg-white/40'}`}
              style={{ color: filter === id ? '#5A9E8F' : 'var(--text-secondary)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Route list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {filteredRoutes.map((route) => {
            const diff = DIFF_LABELS[route.diff] || DIFF_LABELS.easy;
            const isSelected = selectedRoute === route.id;
            return (
              <div key={route.id}
                className={`card-item group cursor-pointer ${isSelected ? 'ring-2' : ''}`}
                style={isSelected ? { borderColor: route.color.main, boxShadow: `0 0 0 2px ${route.color.main}` } : {}}
                onClick={() => {
                  setSelectedRoute((prev) => prev === route.id ? null : route.id);
                  if (mapRef.current) zoomToRoute(mapRef.current, route);
                }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: route.color.main }}>{route.num}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{route.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{route.km} km</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{route.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${diff.color}15`, color: diff.color }}>{diff.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(90,158,143,0.1)', color: '#5A9E8F' }}>{route.type === 'lineal' ? 'Lineal' : 'Circular'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(201,212,196,0.3)' }}>
          <button onClick={() => mapRef.current?.flyTo({ center: [-1.35, 37.85], zoom: 8 })}
            className="btn-glass-secondary flex-1 text-xs py-2 rounded-xl">Vista general</button>
          <button onClick={() => {
            navigator.geolocation?.getCurrentPosition((p) => {
              mapRef.current?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 14 });
            });
          }} className="btn-glass-secondary flex-1 text-xs py-2 rounded-xl">Mi ubicacion</button>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative h-full">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Style selector */}
        {mapLoaded && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 lg:left-auto lg:right-4 lg:translate-x-0">
            <div className="flex gap-0.5 p-1 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(201,212,196,0.4)', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
              {Object.entries(STYLES).map(([id, style]) => (
                <button key={id} onClick={() => changeStyle(id as StyleId)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${activeStyle === id ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                  style={{ color: activeStyle === id ? '#5A9E8F' : '#5A7A72' }}>
                  <span className="text-sm">{style.icon}</span>
                  <span className="hidden sm:inline">{style.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map controls */}
        {mapLoaded && (
          <div className="absolute right-4 top-20 flex flex-col gap-2 z-10">
            <button onClick={() => {
              navigator.geolocation?.getCurrentPosition((p) => {
                mapRef.current?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 14 });
              });
            }} className="map-control-glass" title="Mi ubicacion">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4m-10-10h4m12 0h4" />
              </svg>
            </button>
            <button onClick={() => mapRef.current?.flyTo({ center: [-1.35, 37.85], zoom: 8 })}
              className="map-control-glass" title="Vista general">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
              </svg>
            </button>
          </div>
        )}

        {/* Selected route info bar */}
        {selectedRouteData && (
          <div className="absolute bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-auto lg:left-[396px] lg:max-w-xl z-10 p-4 rounded-2xl"
            style={{ background: 'rgba(244,243,238,0.92)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(201,212,196,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ background: selectedRouteData.color.main }}>{selectedRouteData.num}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{selectedRouteData.name}</h3>
                <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>{selectedRouteData.km} km</span>
                  <span>{selectedRouteData.time}</span>
                  <span>{selectedRouteData.location}</span>
                </div>
              </div>
              <a href={`/route/${selectedRouteData.id}`}
                className="btn-glass-primary text-xs px-3 py-1.5 rounded-lg">Ver detalle</a>
              <button onClick={() => setSelectedRoute(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
