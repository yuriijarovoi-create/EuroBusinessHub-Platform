import type { MapCityRecord } from '../types/mapTypes';

/** Mosel corridor — real coordinates, no spiderfy; marker visibility uses tier-4 zoom floor */
export const MOSEL_VILLAGE_IDS = new Set([
  'cochem',
  'klotten',
  'ernst',
  'valwig',
  'bruttig_fankel',
  'beilstein',
  'ellenz_poltersdorf',
  'senheim',
  'bremm',
  'ediger_eller',
  'treis_karden',
  'mueden',
  'pommern',
  'moselkern',
  'kaisersesch',
  'zell_an_der_mosel',
  'bullay',
  'alf',
]);

/** From this zoom level, Mosel villages never grid-cluster (real lat/lng markers only) */
export const MOSEL_INDIVIDUAL_MARKER_ZOOM = 10;

export function isMoselVillageId(cityId: string): boolean {
  return MOSEL_VILLAGE_IDS.has(cityId);
}

export function isMoselVillageCluster(cities: readonly MapCityRecord[]): boolean {
  return cities.length > 0 && cities.every((c) => isMoselVillageId(c.id));
}

export function clusterHasMoselVillage(cities: readonly MapCityRecord[]): boolean {
  return cities.some((c) => isMoselVillageId(c.id));
}

/** Mosel villages use real placement — never spiderfy or artificial offset */
export function shouldDisableSpiderfyForCluster(cities: readonly MapCityRecord[]): boolean {
  return clusterHasMoselVillage(cities);
}
