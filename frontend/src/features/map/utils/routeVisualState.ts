import type { BusinessRouteDef, RoutePriorityLevel } from '../types/mapTypes';
import { getRouteScope } from '../data/routeCityIndex';
import { getRouteVisualTier } from './routeVisualStyles';
import { isPortCity } from './routeVehicleIcons';
import { routeDistanceKm } from './routeGeometry';
import { baseSpeedPerFrame, tierMotionMultiplier } from './routeAnimation';

export interface RouteVisualContext {
  selectedCountryCode?: string;
  selectedCityId?: string;
  selectedRouteId?: string;
  hoveredRouteId?: string;
}

const BUSY_PAIRS = new Set([
  'berlin|hamburg',
  'hamburg|berlin',
  'berlin|frankfurt',
  'frankfurt|berlin',
  'cologne|rotterdam',
  'rotterdam|cologne',
  'munich|vienna',
  'vienna|munich',
  'berlin|warsaw',
  'warsaw|berlin',
  'rotterdam|hamburg',
  'hamburg|rotterdam',
  'paris|brussels',
  'brussels|paris',
]);

export const MAJOR_HUB_IDS = new Set([
  'berlin',
  'hamburg',
  'frankfurt',
  'munich',
  'cologne',
  'rotterdam',
  'warsaw',
  'vienna',
  'paris',
  'amsterdam',
  'brussels',
  'lyon',
  'milan',
  'zurich',
  'budapest',
  'istanbul',
  'stockholm',
  'copenhagen',
]);

export function getRoutePriority(route: BusinessRouteDef): RoutePriorityLevel {
  if (route.routePriority) return route.routePriority;
  const scope = getRouteScope(route);
  if (scope === 'europe' || route.priorityTier === 1) return 'primary';
  if (scope === 'country' || route.priorityTier === 2) return 'secondary';
  return 'local';
}

export function routeConnectsCity(route: BusinessRouteDef, cityId?: string): boolean {
  if (!cityId) return false;
  return route.fromCityId === cityId || route.toCityId === cityId;
}

export function isBusyCorridor(route: BusinessRouteDef): boolean {
  const key = `${route.fromCityId}|${route.toCityId}`;
  return BUSY_PAIRS.has(key);
}

export function getRouteLineOpacity(route: BusinessRouteDef, ctx: RouteVisualContext): number {
  const connected = routeConnectsCity(route, ctx.selectedCityId);
  const selected = route.id === ctx.selectedRouteId;
  const hovered = route.id === ctx.hoveredRouteId;
  const tier = getRouteVisualTier(route);

  if (selected || hovered) return 1;
  if (ctx.selectedCityId) return connected ? 0.96 : 0.1;

  if (ctx.selectedCountryCode) {
    switch (tier) {
      case 'trunk':
        return 0.98;
      case 'international':
        return 0.88;
      case 'national':
        return 0.78;
      default:
        return 0.42;
    }
  }

  switch (tier) {
    case 'trunk':
      return 1;
    case 'international':
      return 0.82;
    case 'national':
      return 0.48;
    default:
      return 0.3;
  }
}

const MAX_ROUTE_VEHICLES = 16;

export function shouldShowVehicle(
  route: BusinessRouteDef,
  ctx: RouteVisualContext,
  zoom: number,
  vehicleCount: number,
): boolean {
  if (vehicleCount >= MAX_ROUTE_VEHICLES) return false;

  const connected = routeConnectsCity(route, ctx.selectedCityId);
  const selected = route.id === ctx.selectedRouteId;
  const hovered = route.id === ctx.hoveredRouteId;
  const tier = getRouteVisualTier(route);

  if (route.mode === 'sea' && !isPortCity(route.fromCityId) && !isPortCity(route.toCityId)) {
    return false;
  }

  if (selected || connected || hovered) return true;

  switch (tier) {
    case 'trunk':
      return zoom >= 6;
    case 'international':
      return zoom >= 7.5;
    case 'national':
      return zoom >= 9 || !!ctx.selectedCountryCode;
    default:
      return zoom >= 11.5 || !!ctx.selectedCityId;
  }
}

export function freightPulseCount(
  route: BusinessRouteDef,
  zoom: number,
  pulseCount: number,
): number {
  const tier = getRouteVisualTier(route);
  const maxTotal = 10;
  if (pulseCount >= maxTotal) return 0;

  if (tier === 'trunk' && zoom >= 6) return 1;
  if (tier === 'international' && zoom >= 8 && isBusyCorridor(route)) return 1;
  return 0;
}

export function animationSpeedForRoute(
  route: BusinessRouteDef,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const tier = getRouteVisualTier(route);
  const dist = route.distanceKm ?? routeDistanceKm(from, to);
  const base = route.animationSpeed ?? baseSpeedPerFrame(route.mode, dist);
  return base * tierMotionMultiplier(tier);
}
