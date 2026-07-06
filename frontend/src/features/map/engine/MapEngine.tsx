import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { MapProviderId } from '@shared/types';
import type { MapCountry } from '@shared/types';
import type { BusinessRouteDef, MapCityRecord, MapLayerState } from '../types/mapTypes';
import { getMapAdapter } from '../adapters';
import { createInitialMapEngineState, mapEngineReducer } from './MapState';
import type { BusinessFilterState, MapSearchTarget } from './types';
import { flyToCity, flyToCountry, flyToEurope, type FlyableMap } from './ViewportManager';
import { futureMapAPI } from './FutureAPIAdapter';

interface MapEngineContextValue {
  state: ReturnType<typeof createInitialMapEngineState> extends infer S ? S : never;
  setProvider: (id: MapProviderId) => void;
  setLayers: (layers: MapLayerState) => void;
  setBusinessFilters: (filters: Partial<BusinessFilterState>) => void;
  selectCountry: (country: MapCountry | null, map?: FlyableMap | null) => void;
  selectCity: (city: MapCityRecord | null, options?: { fly?: boolean; openWorkspace?: boolean }) => void;
  selectRoute: (route: BusinessRouteDef | null) => void;
  resetToEurope: (map?: FlyableMap | null) => void;
  searchFlyTo: (target: MapSearchTarget, map?: FlyableMap | null) => void;
  loadMapData: (countryCode?: string) => Promise<void>;
}

// Leaflet-compatible fly target
type LMap = FlyableMap;

const MapEngineCtx = createContext<MapEngineContextValue | null>(null);

interface MapEngineProviderProps {
  children: ReactNode;
  initialProvider?: MapProviderId;
  onOpenWorkspace?: (city: MapCityRecord) => void;
}

export function MapEngineProvider({
  children,
  initialProvider = 'leaflet',
  onOpenWorkspace,
}: MapEngineProviderProps) {
  const [state, dispatch] = useReducer(
    mapEngineReducer,
    createInitialMapEngineState(initialProvider),
  );

  const adapter = useMemo(() => getMapAdapter(state.provider), [state.provider]);

  const loadMapData = useCallback(async (countryCode?: string) => {
    const [cities, routes] = await Promise.all([
      futureMapAPI.fetchCities(countryCode),
      futureMapAPI.fetchRoutes(countryCode),
    ]);
    dispatch({ type: 'SET_CITIES', cities });
    dispatch({ type: 'SET_ROUTES', routes });
  }, []);

  const setProvider = useCallback((id: MapProviderId) => {
    dispatch({ type: 'SET_PROVIDER', provider: id });
  }, []);

  const setLayers = useCallback((layers: MapLayerState) => {
    dispatch({ type: 'SET_LAYERS', layers });
  }, []);

  const setBusinessFilters = useCallback((filters: Partial<BusinessFilterState>) => {
    dispatch({ type: 'SET_BUSINESS_FILTERS', filters });
  }, []);

  const resetToEurope = useCallback((map?: LMap | null) => {
    dispatch({ type: 'RESET_EUROPE' });
    if (map) flyToEurope(map);
  }, []);

  const selectCountry = useCallback((country: MapCountry | null, map?: LMap | null) => {
    dispatch({ type: 'SELECT_COUNTRY', country });
    if (country && map) flyToCountry(map, country.code, state.cities);
  }, [state.cities]);

  const selectCity = useCallback(
    (city: MapCityRecord | null, options?: { fly?: boolean; openWorkspace?: boolean }) => {
      dispatch({ type: 'SELECT_CITY', city, fly: options?.fly ?? true });
      if (city && options?.openWorkspace !== false && onOpenWorkspace) {
        const delay = options?.fly !== false ? 1100 : 0;
        window.setTimeout(() => onOpenWorkspace(city), delay);
      }
    },
    [onOpenWorkspace],
  );

  const selectRoute = useCallback((route: BusinessRouteDef | null) => {
    dispatch({ type: 'SELECT_ROUTE', route });
  }, []);

  const searchFlyTo = useCallback((target: MapSearchTarget, map?: LMap | null) => {
    if (target.kind === 'city' && target.lat != null && target.lng != null && map) {
      flyToCity(map, target.lat, target.lng);
      dispatch({
        type: 'NAVIGATE',
        navigation: { level: 'city', cityId: target.id, transitioning: true },
      });
      window.setTimeout(() => {
        dispatch({ type: 'NAVIGATE', navigation: { transitioning: false } });
      }, 1100);
    }
  }, []);

  const value = useMemo(
    (): MapEngineContextValue => ({
      state,
      setProvider,
      setLayers,
      setBusinessFilters,
      selectCountry,
      selectCity,
      selectRoute,
      resetToEurope,
      searchFlyTo,
      loadMapData,
    }),
    [
      state,
      setProvider,
      setLayers,
      setBusinessFilters,
      selectCountry,
      selectCity,
      selectRoute,
      resetToEurope,
      searchFlyTo,
      loadMapData,
    ],
  );

  void adapter;

  return <MapEngineCtx.Provider value={value}>{children}</MapEngineCtx.Provider>;
}

export function useMapEngine(): MapEngineContextValue {
  const ctx = useContext(MapEngineCtx);
  if (!ctx) throw new Error('useMapEngine must be used within MapEngineProvider');
  return ctx;
}
