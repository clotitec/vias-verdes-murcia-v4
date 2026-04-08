'use client';

import { useAppStore } from '@/store/app-store';
import es from '@/data/i18n/es';
import en from '@/data/i18n/en';

const translations: Record<string, Record<string, string>> = { es, en };

export function useI18n() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);

  const t = (key: string): string => {
    return translations[locale]?.[key] ?? translations.es[key] ?? key;
  };

  return { t, locale, setLocale };
}
