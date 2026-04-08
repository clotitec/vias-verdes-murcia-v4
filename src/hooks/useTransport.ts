'use client';

import { useState, useEffect } from 'react';
import { fetchTransportNear } from '@/lib/transport';
import type { TransportStop } from '@/types/transport';

export function useTransport(lat: number, lon: number, radiusKm: number = 5) {
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTransportNear(lat, lon, radiusKm)
      .then((result) => {
        if (!cancelled) {
          setStops(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error fetching transport');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [lat, lon, radiusKm]);

  return { stops, loading, error };
}
