import type { CityWorkspace, ModuleId } from '@shared/types';
import { cities, getCityById, getWorkspaceStats } from './cities';
import { createCityMetrics } from './cityMetrics';
import { routes } from '@/config';

const WORKSPACE_MODULE_IDS: ModuleId[] = [
  'marketplace',
  'transport',
  'lager',
  'unternehmen',
  'jobs',
  'services',
  'partner',
  'ki',
];

export function getWorkspaceForCity(cityId: string): CityWorkspace | null {
  const city = getCityById(cityId);
  if (!city) return null;

  return {
    cityId: city.id,
    countryCode: city.countryCode,
    stats: getWorkspaceStats(city.id),
    metrics: createCityMetrics(city.businesses),
    modules: WORKSPACE_MODULE_IDS.map((moduleId) => ({
      moduleId,
      enabled: city.activeModules.includes(moduleId),
      route: routes.module(moduleId),
    })),
  };
}

export function getCountryWorkspaces(countryCode: string): CityWorkspace[] {
  return cities
    .filter((c) => c.countryCode === countryCode)
    .map((c) => getWorkspaceForCity(c.id))
    .filter((w): w is CityWorkspace => w !== null);
}
