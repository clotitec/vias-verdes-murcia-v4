'use client';

import { useAppStore } from '@/store/app-store';

export default function LanguageSwitcher() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setLocale('es')}
        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
          locale === 'es' ? 'bg-white/80 shadow-sm' : 'hover:bg-white/40 opacity-60'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
          locale === 'en' ? 'bg-white/80 shadow-sm' : 'hover:bg-white/40 opacity-60'
        }`}
      >
        EN
      </button>
    </div>
  );
}
