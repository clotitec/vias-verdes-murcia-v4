'use client';

import { useState, useEffect } from 'react';
import { viasVerdes } from '@/data/routes';
import { ROUTE_START_COORDS, fetchWeather, getWeatherIcon, getWeatherDesc, getWeatherRecommendation } from '@/lib/weather';
import type { WeatherData } from '@/types/weather';

export default function WeatherOverview() {
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const results: Record<string, WeatherData | null> = {};
      for (const route of viasVerdes) {
        const coords = ROUTE_START_COORDS[route.id];
        if (coords) {
          results[route.id] = await fetchWeather(coords[0], coords[1]);
        }
      }
      setWeatherMap(results);
      setLoading(false);
    }
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="liquid-glass p-5 rounded-2xl">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Clima en las rutas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {viasVerdes.map((r) => (
            <div key={r.id} className="glass-stat p-3 rounded-xl animate-shimmer" style={{ height: 80 }} />
          ))}
        </div>
      </div>
    );
  }

  const SCORE_COLORS = {
    bueno: { bg: 'rgba(5,150,105,0.1)', border: '#059669', text: '#059669' },
    precaucion: { bg: 'rgba(217,119,6,0.1)', border: '#D97706', text: '#D97706' },
    no_recomendado: { bg: 'rgba(220,38,38,0.1)', border: '#DC2626', text: '#DC2626' },
  };

  return (
    <div className="liquid-glass p-5 rounded-2xl">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Clima en las rutas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {viasVerdes.map((route) => {
          const data = weatherMap[route.id];
          if (!data) {
            return (
              <div key={route.id} className="glass-stat p-3 rounded-xl text-center">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin datos</span>
              </div>
            );
          }

          const icon = getWeatherIcon(data.current.weather_code, !!data.current.is_day);
          const temp = Math.round(data.current.temperature_2m);
          const desc = getWeatherDesc(data.current.weather_code);
          const rec = getWeatherRecommendation(data);
          const colors = SCORE_COLORS[rec.score];

          return (
            <div
              key={route.id}
              className="glass-stat p-3 rounded-xl"
              style={{ borderLeft: `3px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                  style={{ background: route.color.main }}
                >
                  {route.num}
                </div>
                <span className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {route.name.replace('Via Verde ', '').replace('del ', '').replace('de la ', '').replace('de ', '')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{temp}°C</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
              <div
                className="mt-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full inline-block"
                style={{ background: colors.bg, color: colors.text }}
              >
                {rec.score === 'bueno' ? 'Ideal' : rec.score === 'precaucion' ? 'Precaucion' : 'No recomendado'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
