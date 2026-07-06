import type { MapCountry, MapCityData, MapRoute, MapLiveStat, CityWorkspace } from '@shared/types';
import type { City } from '@shared/types';
import { EUROPE_COUNTRY_PATHS } from '@/features/map/data/countryPaths';
import { cities, getCityById } from '@/data/cities';
import { createCityMetrics } from '@/data/cityMetrics';
import { mapLiveStats } from '@/data/mapLiveStats';
import { getCountryViewport } from '@/features/map/utils/projection';
import { routes } from '@/config';

/** Build country registry with dynamic city IDs */
export function getAllCountries(): MapCountry[] {
  return EUROPE_COUNTRY_PATHS.map((def) => ({
    id: def.id,
    code: def.code,
    name: def.name,
    nameEn: def.nameEn,
    mapPath: def.mapPath,
    centerX: def.centerX,
    centerY: def.centerY,
    lat: def.lat,
    lng: def.lng,
    zoomLevel: def.zoomLevel,
    hubCityId: def.hubCityId,
    isHub: def.isHub,
    cityIds: cities.filter((c) => c.countryCode === def.code).map((c) => c.id),
  }));
}

export function getCountryByCode(code: string): MapCountry | undefined {
  return getAllCountries().find((c) => c.code === code);
}

export function getCitiesByCountry(countryCode: string): City[] {
  return cities.filter((c) => c.countryCode === countryCode);
}

export function getMapCityData(cityId: string): MapCityData | null {
  const city = getCityById(cityId);
  if (!city) return null;
  const metrics = createCityMetrics(city.businesses);
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    lat: city.lat,
    lng: city.lng,
    mapX: city.mapX,
    mapY: city.mapY,
    metrics,
    activeModules: city.activeModules,
    isMajorHub: city.isMajorHub,
  };
}

export function getBusinessRoutes(_filterCountryCode?: string): MapRoute[] {
  return [];
}

export function getMapLiveStats(): MapLiveStat[] {
  return mapLiveStats;
}

export function getCountryViewportForCode(code: string) {
  const country = getCountryByCode(code);
  if (!country) return null;
  return getCountryViewport(country);
}

const WORKSPACE_MODULES = [
  'dashboard',
  'marketplace',
  'transport',
  'lager',
  'unternehmen',
  'jobs',
  'partner',
  'services',
  'digitale-produkte',
  'analytics',
  'ki',
  'payments',
  'notifications',
] as const;

export function getFullCityWorkspace(cityId: string): CityWorkspace | null {
  const data = getMapCityData(cityId);
  if (!data) return null;
  return {
    cityId: data.id,
    countryCode: data.countryCode,
    stats: {
      activeUsers: Math.floor(data.metrics.companies * 0.12),
      openOrders: Math.floor(data.metrics.transport * 0.15),
      listings: Math.floor(data.metrics.marketplace * 1.2),
    },
    metrics: data.metrics,
    modules: WORKSPACE_MODULES.map((moduleId) => ({
      moduleId,
      enabled:
        data.activeModules.includes(moduleId) ||
        moduleId === 'dashboard' ||
        moduleId === 'notifications',
      route:
        moduleId === 'dashboard'
          ? routes.dashboard
          : moduleId === 'notifications'
            ? routes.home
            : routes.module(moduleId),
      labelKey: `modules:${moduleId}.name`,
    })),
  };
}
