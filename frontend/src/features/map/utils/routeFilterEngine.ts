import type { BusinessRouteDef, MapCityRecord, RoutePriorityLevel, RouteScope } from '../types/mapTypes';
import { getRouteScope } from '../data/routeCityIndex';
import { routeDistanceKm } from './routeGeometry';
import { getRoutePriority } from './routeVisualState';

export interface RouteFilterContext {
  zoom: number;
  selectedCountryCode?: string;
  selectedCityId?: string;
  cityMap: Map<string, MapCityRecord>;
}

const ZOOM_ROUTE_CAPS: Array<{ min: number; max: number; cap: number }> = [
  { min: 0, max: 5.99, cap: 18 },
  { min: 6, max: 7.99, cap: 26 },
  { min: 8, max: 10.99, cap: 24 },
  { min: 11, max: 12.99, cap: 16 },
  { min: 13, max: 24, cap: 6 },
];

const LOCAL_MAX_KM = 40;

function routeCapForZoom(zoom: number): number {
  const band = ZOOM_ROUTE_CAPS.find((b) => zoom >= b.min && zoom <= b.max);
  return band?.cap ?? 22;
}

function prioritiesForZoom(zoom: number, countryCode?: string, cityId?: string): Set<RoutePriorityLevel> {
  if (cityId && zoom >= 10) return new Set(['secondary', 'local']);
  if (zoom < 6) return new Set(['primary']);
  if (zoom < 8) {
    const s = new Set<RoutePriorityLevel>(['primary']);
    if (countryCode) s.add('secondary');
    return s;
  }
  if (zoom < 11) {
    if (countryCode || cityId) return new Set(['primary', 'secondary']);
    return new Set(['secondary']);
  }
  if (zoom < 13) return new Set(['secondary', 'local']);
  return new Set(['local']);
}

function scopesForZoom(zoom: number, countryCode?: string): Set<RouteScope> {
  if (zoom < 6) return new Set(['europe']);
  if (zoom < 8) {
    const s = new Set<RouteScope>(['europe']);
    if (countryCode) s.add('country');
    return s;
  }
  if (zoom < 11) {
    if (countryCode) return new Set(['country', 'regional']);
    return new Set(['country']);
  }
  if (zoom < 13) return new Set(['regional']);
  return new Set(['local']);
}

function routeTouchesCountry(route: BusinessRouteDef, countryCode: string): boolean {
  const countries = route.relatedCountries ?? route.countryScope ?? [];
  return countries.includes(countryCode);
}

function isRouteInZoomBand(route: BusinessRouteDef, zoom: number, countryCode?: string): boolean {
  const scope = getRouteScope(route);
  const allowedScopes = scopesForZoom(zoom, countryCode);
  if (!allowedScopes.has(scope)) return false;

  const allowedPriorities = prioritiesForZoom(zoom, countryCode);
  if (!allowedPriorities.has(getRoutePriority(route))) return false;

  const minZ = route.visibleZoomMin ?? 0;
  let maxZ = route.visibleZoomMax ?? 14;

  if (countryCode && scope === 'europe' && routeTouchesCountry(route, countryCode)) {
    maxZ = Math.max(maxZ, 10);
  }

  if (countryCode && zoom >= 8 && zoom <= 10 && scope === 'europe' && !routeTouchesCountry(route, countryCode)) {
    return false;
  }

  if (countryCode && zoom >= 11 && scope === 'europe') return false;

  return zoom >= minZ && zoom <= maxZ;
}

function passesDistanceGate(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
  zoom: number,
  cityId?: string,
): boolean {
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  if (!from || !to) return false;

  const dist = routeDistanceKm(from, to);
  const scope = getRouteScope(route);

  if (cityId && zoom >= 10) {
    return route.fromCityId === cityId || route.toCityId === cityId;
  }
  if (zoom >= 13) return scope === 'local' && dist <= LOCAL_MAX_KM;
  if (zoom >= 11 && scope === 'europe') return false;
  if (zoom >= 11 && scope === 'country' && dist > 120) return false;
  return true;
}

function sortRoutes(routes: BusinessRouteDef[], ctx: RouteFilterContext): BusinessRouteDef[] {
  return [...routes].sort((a, b) => {
    const aCity =
      ctx.selectedCityId &&
      (a.fromCityId === ctx.selectedCityId || a.toCityId === ctx.selectedCityId)
        ? 1
        : 0;
    const bCity =
      ctx.selectedCityId &&
      (b.fromCityId === ctx.selectedCityId || b.toCityId === ctx.selectedCityId)
        ? 1
        : 0;
    if (bCity !== aCity) return bCity - aCity;

    const prioOrder = { primary: 0, secondary: 1, local: 2 };
    const ap = prioOrder[getRoutePriority(a)];
    const bp = prioOrder[getRoutePriority(b)];
    if (ap !== bp) return ap - bp;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });
}

export function filterCorridorRoutes(
  routes: BusinessRouteDef[],
  ctx: RouteFilterContext,
): BusinessRouteDef[] {
  const { zoom, selectedCountryCode, selectedCityId, cityMap } = ctx;
  const cap = routeCapForZoom(zoom);

  const pool = routes.filter((route) => {
    if (!route.active) return false;
    if (!cityMap.has(route.fromCityId) || !cityMap.has(route.toCityId)) return false;
    if (!isRouteInZoomBand(route, zoom, selectedCountryCode)) return false;
    if (!passesDistanceGate(route, cityMap, zoom, selectedCityId)) return false;

    if (selectedCountryCode) return routeTouchesCountry(route, selectedCountryCode);
    return getRouteScope(route) === 'europe';
  });

  return sortRoutes(pool, ctx).slice(0, cap);
}

export function routeDensityOpacity(routeCount: number): number {
  if (routeCount <= 8) return 1;
  if (routeCount <= 14) return 0.92;
  if (routeCount <= 22) return 0.86;
  return 0.8;
}
