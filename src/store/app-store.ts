import { create } from 'zustand';
import type { Difficulty } from '@/types/route';
import type { POIType } from '@/types/poi';
import type { Locale } from '@/types/i18n';

interface AppState {
  // Route selection & filtering
  selectedRouteId: string | null;
  activeFilter: Difficulty | 'all';
  searchTerm: string;
  visiblePOITypes: POIType[];

  // Map state
  isSatellite: boolean;
  transportMarkersVisible: boolean;
  transportRadius: number;

  // i18n
  locale: Locale;

  // Actions
  setSelectedRoute: (id: string | null) => void;
  setActiveFilter: (filter: Difficulty | 'all') => void;
  setSearchTerm: (term: string) => void;
  setVisiblePOITypes: (types: POIType[]) => void;
  togglePOIType: (type: POIType) => void;
  toggleSatellite: () => void;
  toggleTransportMarkers: () => void;
  setTransportRadius: (radius: number) => void;
  setLocale: (locale: Locale) => void;
  resetFilters: () => void;
}

const ALL_POI_TYPES: POIType[] = [
  'estacion', 'pueblo', 'mirador', 'puente', 'tunel',
  'area_descanso', 'patrimonio', 'panel_interpretativo',
  'punto_conflictivo', 'servicio', 'albergue',
];

export const useAppStore = create<AppState>((set) => ({
  selectedRouteId: null,
  activeFilter: 'all',
  searchTerm: '',
  visiblePOITypes: [...ALL_POI_TYPES],
  isSatellite: false,
  transportMarkersVisible: false,
  transportRadius: 5,
  locale: (typeof window !== 'undefined' && localStorage.getItem('vv-locale') as Locale) || 'es',

  setSelectedRoute: (id) => set({ selectedRouteId: id }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setVisiblePOITypes: (types) => set({ visiblePOITypes: types }),
  togglePOIType: (type) =>
    set((state) => ({
      visiblePOITypes: state.visiblePOITypes.includes(type)
        ? state.visiblePOITypes.filter((t) => t !== type)
        : [...state.visiblePOITypes, type],
    })),
  toggleSatellite: () => set((state) => ({ isSatellite: !state.isSatellite })),
  toggleTransportMarkers: () =>
    set((state) => ({ transportMarkersVisible: !state.transportMarkersVisible })),
  setTransportRadius: (radius) => set({ transportRadius: radius }),
  setLocale: (locale) => {
    if (typeof window !== 'undefined') localStorage.setItem('vv-locale', locale);
    set({ locale });
  },
  resetFilters: () =>
    set({
      activeFilter: 'all',
      searchTerm: '',
      visiblePOITypes: [...ALL_POI_TYPES],
    }),
}));
