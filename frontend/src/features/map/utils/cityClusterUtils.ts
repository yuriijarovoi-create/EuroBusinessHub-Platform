import type { MapCityRecord } from '../types/mapTypes';
import { getCityDisplayTier, type CityDisplayTier } from './cityVisibilityUtils';
import { isMoselVillageId, MOSEL_INDIVIDUAL_MARKER_ZOOM } from './moselVillageUtils';

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

function clusterCellSize(zoom: number): number {
  if (zoom >= 11) return 0.05;
  if (zoom >= 10) return 0.08;
  if (zoom >= 9) return 0.14;
  if (zoom >= 8) return 0.24;
  if (zoom >= 7) return 0.38;
  if (zoom >= 6) return 0.58;
  return 0.85;
}

function isClusterableTier(tier: CityDisplayTier, zoom: number): boolean {
  if (tier <= 2) return false;
  if (zoom >= 11) return tier >= 5;
  if (zoom >= 10) return tier >= 4;
  return tier >= 3;
}

/**
 * Grid-cluster nearby small places at medium zoom.
 * Tier 1–2 and forced-visible cities always render individually.
 */
export function buildCityMarkerDisplayItems(
  cities: MapCityRecord[],
  zoom: number,
  forcedIds: ReadonlySet<string>,
): CityMarkerDisplayItem[] {
  if (cities.length === 0) return [];

  const cellSize = clusterCellSize(zoom);
  const singles: MapCityRecord[] = [];
  const buckets = new Map<string, MapCityRecord[]>();

  for (const city of cities) {
    const tier = getCityDisplayTier(city);
    if (forcedIds.has(city.id) || !isClusterableTier(tier, zoom)) {
      singles.push(city);
      continue;
    }

    if (isMoselVillageId(city.id) && zoom >= MOSEL_INDIVIDUAL_MARKER_ZOOM) {
      singles.push(city);
      continue;
    }

    const cellX = Math.floor(city.lng / cellSize);
    const cellY = Math.floor(city.lat / cellSize);
    const key = `${cellX}:${cellY}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(city);
    else buckets.set(key, [city]);
  }

  const items: CityMarkerDisplayItem[] = singles.map((city) => ({ type: 'city', city }));

  for (const [key, bucket] of buckets) {
    if (bucket.length === 1) {
      items.push({ type: 'city', city: bucket[0]! });
      continue;
    }

    const lat = bucket.reduce((s, c) => s + c.lat, 0) / bucket.length;
    const lng = bucket.reduce((s, c) => s + c.lng, 0) / bucket.length;
    items.push({
      type: 'cluster',
      id: `cluster-${key}-${bucket.length}`,
      lat,
      lng,
      cities: bucket,
      count: bucket.length,
    });
  }

  return items;
}

/** Cities rendered as individual markers (excludes those hidden inside clusters). */
export function getIndividualVisibleCityIds(items: CityMarkerDisplayItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.type === 'city') ids.add(item.city.id);
  }
  return ids;
}
