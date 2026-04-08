'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { viasVerdes } from '@/data/routes';
import { generateAllPois } from '@/data/pois';
import NavBar from '@/components/layout/NavBar';
import WeatherOverview from '@/components/weather/WeatherOverview';

// Dashboard widget components - will be expanded in Phase 8
function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="glass-stat p-5 rounded-2xl">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function RouteComparisonTable() {
  return (
    <div className="liquid-glass p-5 rounded-2xl overflow-x-auto">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Comparativa de Rutas
      </h3>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ color: 'var(--text-secondary)' }}>
            <th className="text-left py-2 font-medium">#</th>
            <th className="text-left py-2 font-medium">Nombre</th>
            <th className="text-right py-2 font-medium">Km</th>
            <th className="text-right py-2 font-medium">Tiempo</th>
            <th className="text-center py-2 font-medium">Dificultad</th>
            <th className="text-center py-2 font-medium">Tipo</th>
            <th className="text-center py-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {viasVerdes.map((r) => (
            <tr key={r.id} className="border-t border-gray-100/50 hover:bg-white/30 transition-colors">
              <td className="py-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: r.color.main }}
                >
                  {r.num}
                </div>
              </td>
              <td className="py-2.5">
                <Link href={`/route/${r.id}`} className="hover:underline font-medium" style={{ color: 'var(--text-primary)' }}>
                  {r.name}
                </Link>
              </td>
              <td className="py-2.5 text-right font-medium" style={{ color: 'var(--text-primary)' }}>{r.km}</td>
              <td className="py-2.5 text-right" style={{ color: 'var(--text-secondary)' }}>{r.time}</td>
              <td className="py-2.5 text-center">
                <span className={`badge-${r.diff} text-[10px] px-2 py-0.5 rounded-full`}>
                  {r.diff === 'easy' ? 'Facil' : r.diff === 'medium' ? 'Media' : 'Moderada'}
                </span>
              </td>
              <td className="py-2.5 text-center capitalize" style={{ color: 'var(--text-secondary)' }}>
                {r.type}
              </td>
              <td className="py-2.5 text-center">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    r.status === 'operational' ? 'badge-operational' : 'badge-coming-soon'
                  }`}
                >
                  {r.status === 'operational' ? 'Activa' : 'Prox.'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DifficultyDistribution() {
  const counts = useMemo(() => {
    const c = { easy: 0, medium: 0, moderate: 0 };
    viasVerdes.forEach((r) => {
      if (r.diff in c) c[r.diff as keyof typeof c]++;
    });
    return c;
  }, []);

  const total = viasVerdes.length;
  const items = [
    { label: 'Facil', count: counts.easy, color: '#059669' },
    { label: 'Media', count: counts.medium, color: '#D97706' },
    { label: 'Moderada', count: counts.moderate, color: '#EA580C' },
  ];

  return (
    <div className="liquid-glass p-5 rounded-2xl">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Distribucion por Dificultad
      </h3>
      <div className="flex gap-4 items-end h-32">
        {items.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-lg font-bold" style={{ color: item.color }}>{item.count}</span>
            <div
              className="w-full rounded-lg transition-all"
              style={{
                height: `${Math.max(20, (item.count / total) * 100)}%`,
                background: `${item.color}20`,
                border: `2px solid ${item.color}`,
              }}
            />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopRoutes() {
  const sorted = useMemo(
    () => [...viasVerdes].sort((a, b) => parseFloat(b.km) - parseFloat(a.km)),
    []
  );

  return (
    <div className="liquid-glass p-5 rounded-2xl">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Ranking por Distancia
      </h3>
      <div className="flex flex-col gap-2">
        {sorted.map((r, i) => {
          const maxKm = parseFloat(sorted[0].km);
          const pct = (parseFloat(r.km) / maxKm) * 100;
          return (
            <div key={r.id} className="flex items-center gap-2">
              <span className="text-xs font-bold w-4 text-right" style={{ color: 'var(--text-muted)' }}>
                {i + 1}
              </span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                style={{ background: r.color.main }}
              >
                {r.num}
              </div>
              <div className="flex-1">
                <div
                  className="h-5 rounded-md flex items-center px-2"
                  style={{
                    width: `${Math.max(20, pct)}%`,
                    background: `${r.color.main}20`,
                    border: `1px solid ${r.color.main}40`,
                  }}
                >
                  <span className="text-[10px] font-semibold truncate" style={{ color: r.color.main }}>
                    {r.km} km
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useMemo(() => {
    const totalKm = viasVerdes.reduce((sum, r) => sum + parseFloat(r.km), 0);
    const municipalities = new Set(
      viasVerdes.flatMap((r) => r.municipality.split(',').map((m) => m.trim()))
    );
    let totalPOIs = 0;
    try {
      totalPOIs = generateAllPois().length;
    } catch {
      totalPOIs = 80;
    }
    const operational = viasVerdes.filter((r) => r.status === 'operational').length;
    return { totalKm: totalKm.toFixed(1), municipalities: municipalities.size, totalPOIs, operational };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary, #F4F3EE)' }}>
      <NavBar />

      <div className="pt-16 pb-8 px-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Vision general de la red de Vias Verdes de Murcia
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon="🚲" label="Rutas activas" value={`${stats.operational}/${viasVerdes.length}`} />
          <StatCard icon="📏" label="Km totales" value={stats.totalKm} />
          <StatCard icon="📍" label="Puntos de interes" value={stats.totalPOIs} />
          <StatCard icon="🏘️" label="Municipios" value={stats.municipalities} />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <DifficultyDistribution />
          <TopRoutes />
        </div>

        {/* Weather Overview */}
        <div className="mb-6">
          <WeatherOverview />
        </div>

        {/* Comparison Table */}
        <RouteComparisonTable />
      </div>
    </div>
  );
}
