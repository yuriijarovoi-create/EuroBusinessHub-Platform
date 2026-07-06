import type { LatLngTuple } from 'leaflet';

const MAX_ENTRIES = 240;
const cache = new Map<string, LatLngTuple[]>();

export function getCachedRoutePath(
  key: string,
  build: () => LatLngTuple[],
): LatLngTuple[] {
  const hit = cache.get(key);
  if (hit) return hit;
  const path = build();
  if (cache.size >= MAX_ENTRIES) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, path);
  return path;
}

export function routePathCacheKey(
  routeId: string,
  zoom: number,
  mode: string,
): string {
  return `${routeId}|${Math.floor(zoom * 2) / 2}|${mode}`;
}
