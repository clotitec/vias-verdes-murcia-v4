'use client';

import { use } from 'react';
import Link from 'next/link';
import { viasVerdes } from '@/data/routes';
import NavBar from '@/components/layout/NavBar';

interface RoutePageProps {
  params: Promise<{ id: string }>;
}

const DIFF_LABELS: Record<string, string> = {
  easy: 'Facil',
  medium: 'Media',
  moderate: 'Moderada',
};

export default function RoutePage({ params }: RoutePageProps) {
  const { id } = use(params);
  const route = viasVerdes.find((r) => r.id === id);

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Ruta no encontrada</h1>
          <Link href="/" className="text-sm underline" style={{ color: 'var(--murcia-primary)' }}>
            Volver al mapa
          </Link>
        </div>
      </div>
    );
  }

  // Calculate basic elevation stats
  const elevations = route.coords.map(([, , elev]) => elev);
  const maxElev = Math.max(...elevations);
  const minElev = Math.min(...elevations);
  let gain = 0;
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) gain += diff;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary, #F4F3EE)' }}>
      <NavBar />

      <div className="pt-14">
        {/* Hero */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={`/${route.image}`}
            alt={route.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }} />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge-${route.diff} text-xs px-2.5 py-1 rounded-full font-medium`}>
                {DIFF_LABELS[route.diff]}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white">
                {route.type === 'lineal' ? 'Lineal' : 'Circular'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{route.name}</h1>
            <p className="text-sm text-white/80 mt-1">{route.location}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="glass-stat p-4 rounded-xl text-center">
              <div className="text-lg font-bold" style={{ color: route.color.main }}>{route.km} km</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Distancia</div>
            </div>
            <div className="glass-stat p-4 rounded-xl text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{route.time}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Tiempo estimado</div>
            </div>
            <div className="glass-stat p-4 rounded-xl text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{gain.toFixed(0)} m</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Desnivel +</div>
            </div>
            <div className="glass-stat p-4 rounded-xl text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {maxElev.toFixed(0)} / {minElev.toFixed(0)} m
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Max / Min altitud</div>
            </div>
          </div>

          {/* Description */}
          <div className="liquid-glass p-5 rounded-2xl mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Descripcion</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{route.desc}</p>
          </div>

          {/* Municipalities */}
          <div className="liquid-glass p-5 rounded-2xl mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Municipios</h2>
            <div className="flex flex-wrap gap-2">
              {route.municipality.split(',').map((m) => (
                <span
                  key={m.trim()}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: `${route.color.main}15`, color: route.color.main, border: `1px solid ${route.color.main}30` }}
                >
                  {m.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="liquid-glass p-5 rounded-2xl mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Etiquetas</h2>
            <div className="flex flex-wrap gap-2">
              {route.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(90,158,143,0.1)', color: 'var(--murcia-primary, #5A9E8F)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Link href="/" className="btn-glass-primary px-5 py-2.5 rounded-xl text-sm font-medium">
              Ver en mapa
            </Link>
            {route.gpxFile && (
              <a
                href={`/gpx/${route.gpxFile}`}
                download
                className="btn-glass-secondary px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                Descargar GPX
              </a>
            )}
            {route.url360 && (
              <a
                href={route.url360}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass-secondary px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                Tour 360
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
