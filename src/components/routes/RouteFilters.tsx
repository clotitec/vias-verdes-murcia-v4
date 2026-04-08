'use client';

import { useAppStore } from '@/store/app-store';
import type { Difficulty } from '@/types/route';

const FILTERS: { id: Difficulty | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'easy', label: 'Facil' },
  { id: 'medium', label: 'Media' },
  { id: 'moderate', label: 'Moderada' },
];

export default function RouteFilters() {
  const active = useAppStore((s) => s.activeFilter);
  const setFilter = useAppStore((s) => s.setActiveFilter);

  return (
    <div className="flex gap-1.5 px-3">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setFilter(id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === id
              ? 'bg-white/80 shadow-sm'
              : 'hover:bg-white/40'
          }`}
          style={{
            color: active === id ? 'var(--murcia-primary, #5A9E8F)' : 'var(--text-secondary)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
