'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '@/hooks/useMap';
import { calculateElevationStats } from '@/lib/elevation';
import type { Route } from '@/types/route';

interface ElevationProfileProps {
  route: Route;
  height?: number;
  onClose?: () => void;
}

export default function ElevationProfile({ route, height = 180, onClose }: ElevationProfileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const map = useMap();
  const [hoverInfo, setHoverInfo] = useState<{
    km: number;
    elev: number;
    x: number;
  } | null>(null);

  const coords = route.coords;
  const stats = calculateElevationStats(coords);

  // Calculate cumulative distances
  const distances = useRef<number[]>([]);
  useEffect(() => {
    const d = [0];
    for (let i = 1; i < coords.length; i++) {
      const [lon1, lat1] = coords[i - 1];
      const [lon2, lat2] = coords[i];
      const dx = (lon2 - lon1) * 111.32 * Math.cos(((lat1 + lat2) / 2 * Math.PI) / 180);
      const dy = (lat2 - lat1) * 110.574;
      d.push(d[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    distances.current = d;
  }, [coords]);

  // Draw chart
  const draw = useCallback(
    (hoverX: number | null = null) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const padding = { top: 20, right: 16, bottom: 30, left: 45 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      const elevations = coords.map(([, , e]) => e);
      const maxElev = Math.max(...elevations) + 20;
      const minElev = Math.min(...elevations) - 10;
      const totalDist = distances.current[distances.current.length - 1] || parseFloat(route.km);

      const xScale = (km: number) => padding.left + (km / totalDist) * chartW;
      const yScale = (elev: number) => padding.top + chartH - ((elev - minElev) / (maxElev - minElev)) * chartH;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(201, 212, 196, 0.3)';
      ctx.lineWidth = 0.5;
      const elevStep = Math.ceil((maxElev - minElev) / 4 / 50) * 50;
      for (let e = Math.ceil(minElev / elevStep) * elevStep; e <= maxElev; e += elevStep) {
        const y = yScale(e);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = 'var(--text-muted, #8FA39C)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(e)}m`, padding.left - 6, y + 3);
      }

      // X axis labels
      const distStep = Math.ceil(totalDist / 5);
      for (let d = 0; d <= totalDist; d += distStep) {
        const x = xScale(d);
        ctx.fillStyle = 'var(--text-muted, #8FA39C)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.toFixed(0)} km`, x, h - 8);
      }

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, `${route.color.main}40`);
      gradient.addColorStop(1, `${route.color.main}05`);

      ctx.beginPath();
      ctx.moveTo(xScale(0), yScale(elevations[0]));
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(xScale(distances.current[i]), yScale(elevations[i]));
      }
      ctx.lineTo(xScale(totalDist), padding.top + chartH);
      ctx.lineTo(xScale(0), padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(xScale(0), yScale(elevations[0]));
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(xScale(distances.current[i]), yScale(elevations[i]));
      }
      ctx.strokeStyle = route.color.main;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Hover crosshair
      if (hoverX !== null && hoverX >= padding.left && hoverX <= w - padding.right) {
        const fraction = (hoverX - padding.left) / chartW;
        const km = fraction * totalDist;

        // Find closest point
        let closestIdx = 0;
        let minDiff = Infinity;
        for (let i = 0; i < distances.current.length; i++) {
          const diff = Math.abs(distances.current[i] - km);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        }

        const elev = elevations[closestIdx];
        const y = yScale(elev);

        // Vertical line
        ctx.strokeStyle = 'rgba(90, 158, 143, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(hoverX, padding.top);
        ctx.lineTo(hoverX, padding.top + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dot
        ctx.beginPath();
        ctx.arc(hoverX, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = route.color.main;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tooltip
        ctx.fillStyle = 'rgba(44, 62, 58, 0.9)';
        const tooltipW = 90;
        const tooltipH = 32;
        const tooltipX = Math.min(Math.max(hoverX - tooltipW / 2, 4), w - tooltipW - 4);
        const tooltipY = y - tooltipH - 12;
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, tooltipW, tooltipH, 8);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(elev)} m`, tooltipX + tooltipW / 2, tooltipY + 14);
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`km ${km.toFixed(1)}`, tooltipX + tooltipW / 2, tooltipY + 26);

        setHoverInfo({ km, elev, x: hoverX });

        // Move map marker
        if (map && coords[closestIdx]) {
          const [lon, lat] = coords[closestIdx];
          if (!markerRef.current) {
            const el = document.createElement('div');
            el.style.cssText = `
              width: 16px; height: 16px; border-radius: 50%;
              background: ${route.color.main}; border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              pointer-events: none;
            `;
            markerRef.current = new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map);
          } else {
            markerRef.current.setLngLat([lon, lat]);
          }
        }
      } else {
        setHoverInfo(null);
      }
    },
    [coords, height, route, map]
  );

  // Initial draw
  useEffect(() => {
    draw(null);
    const handleResize = () => draw(null);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draw(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    draw(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 lg:left-[380px]"
      style={{
        background: 'rgba(244, 243, 238, 0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(201, 212, 196, 0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: route.color.main }}
          />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Perfil de elevacion
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {route.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#059669' }}>+{stats.gain.toFixed(0)}m</strong> / <strong style={{ color: '#DC2626' }}>-{stats.loss.toFixed(0)}m</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Max {stats.max.toFixed(0)}m &middot; Min {stats.min.toFixed(0)}m
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="px-2 pb-2">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair rounded-xl"
          style={{ height }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden flex items-center justify-center gap-4 pb-2 text-[10px]">
        <span style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#059669' }}>+{stats.gain.toFixed(0)}m</strong> / <strong style={{ color: '#DC2626' }}>-{stats.loss.toFixed(0)}m</strong>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Max {stats.max.toFixed(0)}m &middot; Min {stats.min.toFixed(0)}m
        </span>
      </div>
    </div>
  );
}
