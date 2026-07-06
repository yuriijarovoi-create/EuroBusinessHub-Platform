import type { MapCityRecord } from '../types/mapTypes';
import { EUROPE_MAX_ZOOM } from '../config/leafletConfig';
import {
  buildCityMarkerDisplayItems,
  type CityMarkerCluster,
  type CityMarkerDisplayItem,
} from './cityClusterUtils';
import { shouldDisableSpiderfyForCluster } from './moselVillageUtils';

export const SPIDERFY_ANIM_MS = 250;
export const CLUSTER_ZOOM_DURATION_S = SPIDERFY_ANIM_MS / 1000;

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/** Spider leg radius in degrees — scales slightly with cluster size */
export function getSpiderfyPositions(
  centerLat: number,
  centerLng: number,
  count: number,
): LatLngPoint[] {
  const radius = count <= 3 ? 0.006 : count <= 6 ? 0.008 : 0.01;
  const lngScale = Math.cos((centerLat * Math.PI) / 180);

  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      lat: centerLat + radius * Math.sin(angle),
      lng: centerLng + (radius * Math.cos(angle)) / lngScale,
    };
  });
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function lerpSpiderPosition(
  center: LatLngPoint,
  target: LatLngPoint,
  progress: number,
): LatLngPoint {
  const t = easeOutCubic(Math.min(1, Math.max(0, progress)));
  return {
    lat: center.lat + (target.lat - center.lat) * t,
    lng: center.lng + (target.lng - center.lng) * t,
  };
}

/** True when a zoom step would not break this group into individuals */
export function clusterRemainsAfterZoom(
  cities: MapCityRecord[],
  targetZoom: number,
  forcedIds: ReadonlySet<string>,
): boolean {
  const cityIds = new Set(cities.map((c) => c.id));
  const items = buildCityMarkerDisplayItems(cities, targetZoom, forcedIds);
  return items.some(
    (item) =>
      item.type === 'cluster' &&
      item.count > 1 &&
      item.cities.every((c) => cityIds.has(c.id)),
  );
}

export function getClusterZoomTarget(currentZoom: number): number {
  return Math.min(currentZoom + 2, EUROPE_MAX_ZOOM);
}

export function shouldSpiderfyCluster(
  cities: MapCityRecord[],
  currentZoom: number,
  forcedIds: ReadonlySet<string>,
): boolean {
  if (shouldDisableSpiderfyForCluster(cities)) return false;
  if (currentZoom >= EUROPE_MAX_ZOOM) return true;
  const targetZoom = getClusterZoomTarget(currentZoom);
  if (targetZoom <= currentZoom) return true;
  return clusterRemainsAfterZoom(cities, targetZoom, forcedIds);
}

/** Find a multi-place cluster still grouping cities from the clicked cluster */
export function findResidualCluster(
  items: CityMarkerDisplayItem[],
  cityIds: ReadonlySet<string>,
): CityMarkerCluster | null {
  for (const item of items) {
    if (item.type !== 'cluster' || item.count < 2) continue;
    if (item.cities.every((c) => cityIds.has(c.id))) {
      return item;
    }
  }
  return null;
}

export function buildSpiderLayoutMap(
  cluster: CityMarkerCluster,
): Map<string, LatLngPoint> {
  const positions = getSpiderfyPositions(cluster.lat, cluster.lng, cluster.cities.length);
  return new Map(cluster.cities.map((city, i) => [city.id, positions[i]!]));
}
