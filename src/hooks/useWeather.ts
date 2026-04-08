'use client';

import { useState, useEffect } from 'react';
import { fetchWeather } from '@/lib/weather';
import type { WeatherData } from '@/types/weather';

export function useWeather(lat: number, lon: number) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWeather(lat, lon)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error fetching weather');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return { data, loading, error };
}
