import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import { getCityDisplayTier } from './cityVisibilityUtils';

/** Minimum map zoom before a route is drawn */
export function minZoomForRoute(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
): number {
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  const fromTier = from ? getCityDisplayTier(from) : 2;
  const toTier = to ? getCityDisplayTier(to) : 2;
  const maxTier = Math.max(fromTier, toTier);
  const intensity = route.intensity ?? 2;

  if (maxTier <= 1 && intensity >= 3) return 0;
  if (maxTier <= 2 && intensity >= 4) return 3.5;
  if (maxTier <= 2) return 5;
  if (maxTier === 3 && intensity >= 3) return 6;
  if (maxTier === 3) return 7;
  if (maxTier === 4 && intensity >= 3) return 8;
  if (maxTier === 4) return 8.75;
  return 10.5;
}

export function filterRoutesByZoom(
  routes: BusinessRouteDef[],
  cityMap: Map<string, MapCityRecord>,
  zoom: number,
): BusinessRouteDef[] {
  return routes.filter((route) => zoom >= minZoomForRoute(route, cityMap));
}
