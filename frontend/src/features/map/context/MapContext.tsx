import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { City, MapCountry, MapNavigationState, MapRoute } from '@shared/types';
import { cities } from '@/data/cities';
import {
  getAllCountries,
  getCountryViewportForCode,
  getCitiesByCountry,
} from '../services/mapService';
import { useMapViewport } from '../hooks/useMapViewport';
import { EUROPE_DEFAULT_VIEWPORT } from '../utils/projection';

interface MapContextValue {
  navigation: MapNavigationState;
  viewport: ReturnType<typeof useMapViewport>;
  countries: MapCountry[];
  visibleCities: City[];
  routes: MapRoute[];
  selectCountry: (country: MapCountry) => void;
  selectCity: (city: City) => void;
  resetToEurope: () => void;
  selectedCountry: MapCountry | null;
}

const MapCtx = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const viewport = useMapViewport();
  const countries = useMemo(() => getAllCountries(), []);

  const [navigation, setNavigation] = useState<MapNavigationState>({
    phase: 'europe',
    selectedCountryCode: null,
    selectedCityId: null,
  });

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === navigation.selectedCountryCode) ?? null,
    [countries, navigation.selectedCountryCode],
  );

  const visibleCities = useMemo(() => {
    if (navigation.phase === 'europe') return cities;
    if (navigation.selectedCountryCode) {
      return getCitiesByCountry(navigation.selectedCountryCode);
    }
    return cities;
  }, [navigation]);

  const routes = useMemo(() => [], []);

  const selectCountry = useCallback(
    (country: MapCountry) => {
      const target = getCountryViewportForCode(country.code);
      if (target) viewport.animateTo(target);
      setNavigation({
        phase: 'country',
        selectedCountryCode: country.code,
        selectedCityId: null,
      });
    },
    [viewport],
  );

  const selectCity = useCallback(
    (city: City) => {
      setNavigation((prev) => ({
        ...prev,
        phase: 'city',
        selectedCityId: city.id,
        selectedCountryCode: city.countryCode,
      }));
      navigate(`/workspace/${city.id}`);
    },
    [navigate],
  );

  const resetToEurope = useCallback(() => {
    viewport.animateTo({ ...EUROPE_DEFAULT_VIEWPORT });
    setNavigation({ phase: 'europe', selectedCountryCode: null, selectedCityId: null });
  }, [viewport]);

  const value: MapContextValue = {
    navigation,
    viewport,
    countries,
    visibleCities,
    routes,
    selectCountry,
    selectCity,
    resetToEurope,
    selectedCountry,
  };

  return <MapCtx.Provider value={value}>{children}</MapCtx.Provider>;
}

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapCtx);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}

export function useOptionalMapContext(): MapContextValue | null {
  return useContext(MapCtx);
}
