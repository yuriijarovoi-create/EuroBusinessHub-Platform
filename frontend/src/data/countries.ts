import type { MapCountry } from '@shared/types';
import { getAllCountries, getCountryByCode as getCountryByCodeFromService } from '@/features/map/services/mapService';

/** European countries — sourced from map service registry */
export const countries: MapCountry[] = getAllCountries();

export function getCountryByCode(code: string): MapCountry | undefined {
  return getCountryByCodeFromService(code);
}

export function getHubCountry(): MapCountry | undefined {
  return countries.find((c) => c.isHub);
}
