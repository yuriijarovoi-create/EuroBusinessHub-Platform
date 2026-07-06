import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import { getCityDisplayTier } from './cityVisibilityUtils';

const EARTH_RADIUS_KM = 6371;

type RouteScope = 'international' | 'national' | 'regional' | 'local';

/** Great-circle distance between route endpoints in km */
export function routeDistanceKm(from: MapCityRecord, to: MapCityRecord): number {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isGermanCity(city: MapCityRecord | undefined): boolean {
  return city?.countryCode === 'DE';
}

function classifyRouteScope(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
  distanceKm: number,
): RouteScope {
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  if (!from || !to) return 'national';

  if (!isGermanCity(from) || !isGermanCity(to)) return 'international';

  const fromTier = getCityDisplayTier(from);
  const toTier = getCityDisplayTier(to);
  const maxTier = Math.max(fromTier, toTier);
  const minTier = Math.min(fromTier, toTier);

  if (route.mode === 'air' && distanceKm > 80) return 'national';
  if (distanceKm > 220 || (maxTier <= 1 && distanceKm > 100)) return 'national';
  if (distanceKm <= 40 && minTier >= 4) return 'local';
  if (distanceKm <= 55 && maxTier >= 4) return 'local';
  if (distanceKm > 65 || maxTier <= 3) return 'regional';
  return 'local';
}

/** Minimum map zoom before a route is drawn */
export function minZoomForRoute(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
): number {
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  if (!from || !to) return 6;

  const distanceKm = routeDistanceKm(from, to);
  const scope = classifyRouteScope(route, cityMap, distanceKm);
  const maxTier = Math.max(getCityDisplayTier(from), getCityDisplayTier(to));
  const intensity = route.intensity ?? 2;

  switch (scope) {
    case 'international':
      return 0;
    case 'national':
      if (maxTier <= 1 && intensity >= 3) return 3.5;
      return 4.5;
    case 'regional':
      if (maxTier === 3 && intensity >= 3) return 6;
      return 6.5;
    case 'local':
      if (maxTier >= 5) return 8.5;
      return 8;
    default:
      return 6;
  }
}

/** Maximum map zoom while route remains visible — hides long corridors at village zoom */
export function maxZoomForRoute(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
): number {
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  if (!from || !to) return 9;

  const distanceKm = routeDistanceKm(from, to);
  const scope = classifyRouteScope(route, cityMap, distanceKm);

  switch (scope) {
    case 'international':
      return 5.5;
    case 'national':
      if (distanceKm > 180) return 8;
      if (distanceKm > 120) return 8.75;
      return 9.25;
    case 'regional':
      if (distanceKm > 100) return 9.5;
      if (distanceKm > 60) return 10.25;
      return 10.75;
    case 'local':
      if (distanceKm > 35) return 11.5;
      return 14;
    default:
      return 9;
  }
}

export function isRouteVisibleAtZoom(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
  zoom: number,
): boolean {
  return zoom >= minZoomForRoute(route, cityMap) && zoom <= maxZoomForRoute(route, cityMap);
}

export function filterRoutesByZoom(
  routes: BusinessRouteDef[],
  cityMap: Map<string, MapCityRecord>,
  zoom: number,
): BusinessRouteDef[] {
  return routes.filter((route) => isRouteVisibleAtZoom(route, cityMap, zoom));
}
