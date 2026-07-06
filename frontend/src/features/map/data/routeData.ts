import type { BusinessRouteDef, MapLayerState, ResolvedRoute } from '../types/mapTypes';
import { BUSINESS_CORRIDORS } from './businessCorridors';
import { annotateRoutes, getRouteScope } from './routeCityIndex';

/** All curated business corridors with AI-ready metadata */
export const BUSINESS_ROUTES: BusinessRouteDef[] = annotateRoutes(BUSINESS_CORRIDORS);

export function filterRoutesByLayers(routes: BusinessRouteDef[], layers: MapLayerState): BusinessRouteDef[] {
  if (!layers.routes) return [];
  return routes.filter((r) => {
    if (!r.active) return false;
    if (r.mode === 'road') return layers.road;
    if (r.mode === 'rail') return layers.rail;
    if (r.mode === 'air') return layers.air;
    if (r.mode === 'sea') return layers.sea;
    if (r.mode === 'river') return layers.river;
    return true;
  });
}

/** Europe-wide view — strategic corridors only */
export function getEuropeRoutes(): BusinessRouteDef[] {
  return BUSINESS_ROUTES.filter((r) => r.active && getRouteScope(r) === 'europe');
}

/** Routes scoped to a country (internal + cross-border) */
export function getRoutesForCountry(countryCode: string): BusinessRouteDef[] {
  return BUSINESS_ROUTES.filter((r) => {
    if (!r.active) return false;
    const countries = r.relatedCountries ?? r.countryScope ?? [];
    return countries.includes(countryCode);
  });
}

/**
 * Routes for current map context.
 * - No country: europe-level corridors (zoom filter applies caps)
 * - Country selected: all corridors touching that country
 */
export function getRoutesForMapView(countryCode?: string): BusinessRouteDef[] {
  if (!countryCode) return getEuropeRoutes();
  return getRoutesForCountry(countryCode);
}

function buildCurvedPath(x1: number, y1: number, x2: number, y2: number, mode: string): string {
  const dx = x2 - x1;
  const lift = mode === 'air' ? 3 + Math.abs(dx) * 0.04 : 1.5 + Math.abs(dx) * 0.02;
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - lift;
  return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
}

export function resolveRoutePath(
  route: BusinessRouteDef,
  cityMap: Map<string, { mapX: number; mapY: number }>,
): string | null {
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  if (!from || !to) return null;
  return buildCurvedPath(from.mapX, from.mapY, to.mapX, to.mapY, route.mode);
}

export function resolveRoutes(
  routes: BusinessRouteDef[],
  cityMap: Map<string, { name: string; mapX: number; mapY: number }>,
): ResolvedRoute[] {
  return routes.flatMap((def) => {
    const path = resolveRoutePath(def, cityMap);
    const from = cityMap.get(def.fromCityId);
    const to = cityMap.get(def.toCityId);
    if (!path || !from || !to) return [];
    return [{ def, path, fromName: from.name, toName: to.name }];
  });
}

export function getRoutesForCity(cityId: string): BusinessRouteDef[] {
  return BUSINESS_ROUTES.filter((r) => r.fromCityId === cityId || r.toCityId === cityId);
}

export function getRouteById(routeId: string): BusinessRouteDef | undefined {
  return BUSINESS_ROUTES.find((r) => r.id === routeId);
}
