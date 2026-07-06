import { cities } from '@/data/cities';
import { enrichRouteMetrics } from './routeMetadata';
import type { BusinessRouteDef, RouteScope } from '../types/mapTypes';

const CITY_BY_ID = new Map(cities.map((c) => [c.id, c]));

const EARTH_RADIUS_KM = 6371;

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getRouteScope(route: BusinessRouteDef): RouteScope {
  return route.scope ?? route.level ?? 'country';
}

export function getCityCountryCode(cityId: string): string | undefined {
  return CITY_BY_ID.get(cityId)?.countryCode;
}

export function inferRouteScope(route: BusinessRouteDef): RouteScope {
  if (route.scope) return route.scope;
  if (route.level) return route.level;
  const from = CITY_BY_ID.get(route.fromCityId);
  const to = CITY_BY_ID.get(route.toCityId);
  if (!from || !to) return 'country';
  if (from.countryCode !== to.countryCode) return 'europe';
  const dist = distanceKm(from.lat, from.lng, to.lat, to.lng);
  if (dist > 180) return 'country';
  if (dist > 55) return 'regional';
  return 'local';
}

export function inferRelatedCountries(route: BusinessRouteDef): string[] {
  if (route.relatedCountries?.length) return route.relatedCountries;
  if (route.countryScope?.length) return route.countryScope;
  const scopes = new Set<string>();
  const fromCc = getCityCountryCode(route.fromCityId);
  const toCc = getCityCountryCode(route.toCityId);
  if (fromCc) scopes.add(fromCc);
  if (toCc) scopes.add(toCc);
  return [...scopes];
}

const SCOPE_ZOOM: Record<RouteScope, { min: number; max: number }> = {
  europe: { min: 3, max: 7 },
  country: { min: 6, max: 10 },
  regional: { min: 9, max: 12 },
  local: { min: 11, max: 14 },
};

/** Attach AI-ready metadata to corridor definitions */
export function annotateRoute(route: BusinessRouteDef): BusinessRouteDef {
  const scope = inferRouteScope(route);
  const relatedCountries = inferRelatedCountries(route);
  const fromCountry = route.fromCountry ?? getCityCountryCode(route.fromCityId);
  const toCountry = route.toCountry ?? getCityCountryCode(route.toCityId);
  const zoom = SCOPE_ZOOM[scope];
  const tier = route.priorityTier ?? (scope === 'europe' ? 1 : scope === 'country' ? 2 : 3);
  const priority =
    route.priority ??
    (tier === 1 ? 100 : tier === 2 ? 65 : 35) + (route.intensity ?? 3);

  return enrichRouteMetrics({
    ...route,
    fromCountry,
    toCountry,
    scope,
    level: scope,
    relatedCountries,
    countryScope: relatedCountries,
    type: route.type ?? route.mode,
    priorityTier: tier,
    routePriority: route.routePriority ?? (tier === 1 ? 'primary' : tier === 2 ? 'secondary' : 'local'),
    priority,
    businessPurpose: route.businessPurpose ?? 'logistics',
    aiRecommended: route.aiRecommended ?? tier <= 2,
    activeWhenCountrySelected:
      route.activeWhenCountrySelected ?? (scope === 'europe' || scope === 'country'),
    visibleZoomMin: route.visibleZoomMin ?? zoom.min,
    visibleZoomMax: route.visibleZoomMax ?? zoom.max,
  });
}

export function annotateRoutes(routes: BusinessRouteDef[]): BusinessRouteDef[] {
  return routes.map(annotateRoute);
}

export { CITY_BY_ID };
