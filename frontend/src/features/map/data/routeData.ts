import type { BusinessRouteDef, MapLayerState, ResolvedRoute } from '../types/mapTypes';
import { DEFAULT_HUB_ID } from './mapData';
import { CORRIDOR_ROUTES, mergeRoutes } from './routeCorridors';
import { GERMANY_NETWORK_ROUTES } from './germany/germanyRoutes';

const H = DEFAULT_HUB_ID;

/** Berlin-centric living business network routes */
const CORE_ROUTES: BusinessRouteDef[] = [
  // Berlin hub spokes
  { id: 'road-ber-par', fromCityId: H, toCityId: 'paris', mode: 'road', active: true, delay: 0 },
  { id: 'rail-ber-waw', fromCityId: H, toCityId: 'warsaw', mode: 'rail', active: true, delay: 0.2 },
  { id: 'road-ber-prg', fromCityId: H, toCityId: 'prague', mode: 'road', active: true, delay: 0.4 },
  { id: 'rail-ber-vie', fromCityId: H, toCityId: 'vienna', mode: 'rail', active: true, delay: 0.3 },
  { id: 'road-ber-ham', fromCityId: H, toCityId: 'hamburg', mode: 'road', active: true, delay: 0.1 },
  { id: 'rail-ber-mun', fromCityId: H, toCityId: 'munich', mode: 'rail', active: true, delay: 0.5 },
  { id: 'road-ber-fra', fromCityId: H, toCityId: 'frankfurt', mode: 'road', active: true, delay: 0.15 },
  { id: 'air-ber-lon', fromCityId: H, toCityId: 'london', mode: 'air', active: true, delay: 0.6 },
  { id: 'air-ber-mad', fromCityId: H, toCityId: 'madrid', mode: 'air', active: true, delay: 0.9 },
  { id: 'air-ber-ist', fromCityId: H, toCityId: 'istanbul', mode: 'air', active: true, delay: 1.1 },
  { id: 'air-ber-rom', fromCityId: H, toCityId: 'rome', mode: 'air', active: true, delay: 0.8 },
  { id: 'sea-ber-cph', fromCityId: H, toCityId: 'copenhagen', mode: 'sea', active: true, delay: 0.7 },
  { id: 'rail-ber-sto', fromCityId: H, toCityId: 'stockholm', mode: 'rail', active: true, delay: 1.0 },
  { id: 'road-ber-ams', fromCityId: H, toCityId: 'amsterdam', mode: 'road', active: true, delay: 0.25 },
  { id: 'rail-ber-bru', fromCityId: H, toCityId: 'brussels', mode: 'rail', active: true, delay: 0.35 },
  { id: 'road-ber-kyi', fromCityId: H, toCityId: 'kyiv', mode: 'road', active: true, delay: 0.55 },
  { id: 'rail-ber-bud', fromCityId: H, toCityId: 'budapest', mode: 'rail', active: true, delay: 0.45 },
  { id: 'air-ber-hel', fromCityId: H, toCityId: 'helsinki', mode: 'air', active: true, delay: 1.2 },
  // Inter-hub corridors
  { id: 'rail-par-lon', fromCityId: 'paris', toCityId: 'london', mode: 'rail', active: true, delay: 0.2 },
  { id: 'road-par-bar', fromCityId: 'paris', toCityId: 'barcelona', mode: 'road', active: true, delay: 0.5 },
  { id: 'air-par-mrs', fromCityId: 'paris', toCityId: 'marseille', mode: 'air', active: true, delay: 0.3 },
  { id: 'road-par-lyo', fromCityId: 'paris', toCityId: 'lyon', mode: 'road', active: true, delay: 0.4 },
  { id: 'rail-mil-zur', fromCityId: 'milan', toCityId: 'zurich', mode: 'rail', active: true, delay: 0.2 },
  { id: 'road-mil-rom', fromCityId: 'milan', toCityId: 'rome', mode: 'road', active: true, delay: 0.3 },
  { id: 'sea-bar-rom', fromCityId: 'barcelona', toCityId: 'rome', mode: 'sea', active: true, delay: 0.6 },
  { id: 'air-mad-lis', fromCityId: 'madrid', toCityId: 'lisbon', mode: 'air', active: true, delay: 0.4 },
  { id: 'sea-lon-dub', fromCityId: 'london', toCityId: 'dublin', mode: 'sea', active: true, delay: 0.5 },
  { id: 'sea-ams-lon', fromCityId: 'amsterdam', toCityId: 'london', mode: 'sea', active: true, delay: 0.3 },
  { id: 'rail-waw-krk', fromCityId: 'warsaw', toCityId: 'krakow', mode: 'rail', active: true, delay: 0.2 },
  { id: 'road-waw-vil', fromCityId: 'warsaw', toCityId: 'vilnius', mode: 'road', active: true, delay: 0.4 },
  { id: 'rail-sto-osl', fromCityId: 'stockholm', toCityId: 'oslo', mode: 'rail', active: true, delay: 0.3 },
  { id: 'sea-sto-rig', fromCityId: 'stockholm', toCityId: 'riga', mode: 'sea', active: true, delay: 0.5 },
  { id: 'sea-rig-tal', fromCityId: 'riga', toCityId: 'tallinn', mode: 'sea', active: true, delay: 0.2 },
  { id: 'road-bud-buc', fromCityId: 'budapest', toCityId: 'bucharest', mode: 'road', active: true, delay: 0.3 },
  { id: 'rail-bud-sof', fromCityId: 'budapest', toCityId: 'sofia', mode: 'rail', active: true, delay: 0.4 },
  { id: 'air-ath-buc', fromCityId: 'athens', toCityId: 'bucharest', mode: 'air', active: true, delay: 0.5 },
  { id: 'road-mun-zur', fromCityId: 'munich', toCityId: 'zurich', mode: 'road', active: true, delay: 0.2 },
  { id: 'sea-ham-cph', fromCityId: 'hamburg', toCityId: 'copenhagen', mode: 'sea', active: true, delay: 0.3 },
  { id: 'air-ist-ath', fromCityId: 'istanbul', toCityId: 'athens', mode: 'air', active: true, delay: 0.6, intensity: 2 },
];

export const BUSINESS_ROUTES: BusinessRouteDef[] = mergeRoutes(
  CORE_ROUTES,
  CORRIDOR_ROUTES,
  GERMANY_NETWORK_ROUTES,
);

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

export function getEuropeRoutes(): BusinessRouteDef[] {
  return BUSINESS_ROUTES.filter((r) => r.active);
}

export function getRoutesForCountry(countryCode: string, cities: { id: string; countryCode: string }[]): BusinessRouteDef[] {
  const ids = new Set(cities.filter((c) => c.countryCode === countryCode).map((c) => c.id));
  return BUSINESS_ROUTES.filter(
    (r) => r.active && (ids.has(r.fromCityId) || ids.has(r.toCityId)),
  );
}

function buildCurvedPath(x1: number, y1: number, x2: number, y2: number, mode: string): string {
  const dx = x2 - x1;
  const lift = mode === 'air' ? 5 + Math.abs(dx) * 0.08 : 2.5 + Math.abs(dx) * 0.04;
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
