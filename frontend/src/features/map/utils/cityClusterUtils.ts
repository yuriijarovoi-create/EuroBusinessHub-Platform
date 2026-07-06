import type { MapCityRecord } from '../types/mapTypes';

export interface CityMarkerCluster {
  type: 'cluster';
  id: string;
  lat: number;
  lng: number;
  cities: MapCityRecord[];
  count: number;
}

export interface CityMarkerSingle {
  type: 'city';
  city: MapCityRecord;
}

export type CityMarkerDisplayItem = CityMarkerCluster | CityMarkerSingle;

/**
 * Build marker display list — every settlement renders at its true lat/lng.
 * Numbered grid clusters are disabled; dense areas use individual small dots.
 */
export function buildCityMarkerDisplayItems(
  cities: MapCityRecord[],
  _zoom: number,
  _forcedIds: ReadonlySet<string>,
): CityMarkerDisplayItem[] {
  return cities.map((city) => ({ type: 'city', city }));
}

/** Cities rendered as individual markers (all visible nodes when clustering is off). */
export function getIndividualVisibleCityIds(items: CityMarkerDisplayItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.type === 'city') ids.add(item.city.id);
  }
  return ids;
}
