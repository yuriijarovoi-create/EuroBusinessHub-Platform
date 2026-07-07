import type { BusinessRouteDef, RoutePriorityLevel } from '../types/mapTypes';
import { routeTouchesCountry } from './routeFilterEngine';
import { getRouteVisualTier } from './routeVisualStyles';
import { isPortCity } from './routeVehicleIcons';
import { routeDistanceKm } from './routeGeometry';
import { baseSpeedPerFrame, tierMotionMultiplier } from './routeAnimation';
import { ALL_LOGISTICS_HUBS, BACKBONE_PAIR_KEYS, backbonePairKey } from '../data/logisticsHubNetwork';

export interface RouteVisualContext {
  selectedCountryCode?: string;
  selectedCityId?: string;
  selectedRouteId?: string;
  hoveredRouteId?: string;
  hoveredCityId?: string;
  hoveredCountryCode?: string;
}

const BUSY_PAIRS = BACKBONE_PAIR_KEYS;

export const MAJOR_HUB_IDS = ALL_LOGISTICS_HUBS;

export function getRoutePriority(route: BusinessRouteDef): RoutePriorityLevel {
  if (route.routePriority) return route.routePriority;
  const tier = route.priorityTier ?? 2;
  if (tier === 1) return 'primary';
  if (tier === 2 || tier === 3) return 'secondary';
  return 'local';
}

export function routeConnectsCity(route: BusinessRouteDef, cityId?: string): boolean {
  if (!cityId) return false;
  return route.fromCityId === cityId || route.toCityId === cityId;
}

export function isBusyCorridor(route: BusinessRouteDef): boolean {
  return BUSY_PAIRS.has(backbonePairKey(route.fromCityId, route.toCityId));
}

function baseRouteLineOpacity(route: BusinessRouteDef, ctx: RouteVisualContext): number {
  const tier = getRouteVisualTier(route);

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

export function getRouteLineOpacity(route: BusinessRouteDef, ctx: RouteVisualContext): number {
  const connected = routeConnectsCity(route, ctx.selectedCityId);
  const hoverCityConnected = routeConnectsCity(route, ctx.hoveredCityId);
  const hoverCountryConnected =
    !!ctx.hoveredCountryCode && routeTouchesCountry(route, ctx.hoveredCountryCode);
  const selected = route.id === ctx.selectedRouteId;
  const hovered = route.id === ctx.hoveredRouteId;

  if (selected || hovered) return 1;
  if (ctx.selectedCityId) return connected ? 0.96 : 0.1;

  const base = baseRouteLineOpacity(route, ctx);
  if (hoverCityConnected || hoverCountryConnected) {
    return Math.min(0.96, base * 1.28 + 0.1);
  }

  return base;
}

export function isRouteHoverHighlighted(route: BusinessRouteDef, ctx: RouteVisualContext): boolean {
  if (route.id === ctx.selectedRouteId) return true;
  if (ctx.selectedCityId && routeConnectsCity(route, ctx.selectedCityId)) return true;
  if (ctx.hoveredCityId && routeConnectsCity(route, ctx.hoveredCityId)) return true;
  if (ctx.hoveredCountryCode && routeTouchesCountry(route, ctx.hoveredCountryCode)) return true;
  return false;
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
