'use client';

import { useWeather } from '@/hooks/useWeather';
import { getWeatherIcon } from '@/lib/weather';

interface WeatherBadgeProps {
  lat: number;
  lon: number;
}

export default function WeatherBadge({ lat, lon }: WeatherBadgeProps) {
  const { data, loading } = useWeather(lat, lon);

  if (loading || !data) return null;

  const icon = getWeatherIcon(data.current.weather_code, !!data.current.is_day);
  const temp = Math.round(data.current.temperature_2m);

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(90,158,143,0.1)' }}
    >
      <span>{icon}</span>
      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{temp}C</span>
    </span>
  );
}
