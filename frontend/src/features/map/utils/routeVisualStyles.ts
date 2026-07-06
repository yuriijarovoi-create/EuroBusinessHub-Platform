import type { BusinessRouteDef, RoutePriorityLevel, TransportMode } from '../types/mapTypes';
import { getRouteScope } from '../data/routeCityIndex';
import { isEuropeanBackbone } from './routeBackbone';
import { routeColorForCorridor, INDUSTRY_ROUTE_COLORS } from '../layers/industryRoutePalette';

/** Visual-only tier — does not affect route filtering */
export type RouteVisualTier = 'trunk' | 'international' | 'national' | 'local';

export function getRouteVisualTier(route: BusinessRouteDef): RouteVisualTier {
  const scope = getRouteScope(route);
  const tier = route.priorityTier ?? (scope === 'europe' ? 1 : scope === 'country' ? 2 : 3);

  if (isEuropeanBackbone(route.fromCityId, route.toCityId)) return 'trunk';
  if (scope === 'europe' && tier === 1) return 'trunk';
  if (scope === 'europe') return 'international';
  if (scope === 'country') return 'national';
  return 'local';
}

/** Unified industry logistics palette */
export const CORRIDOR_PALETTE: Record<
  TransportMode,
  { stroke: string; weight: number; dash?: string }
> = {
  road: { stroke: INDUSTRY_ROUTE_COLORS.road, weight: 2.4 },
  rail: { stroke: INDUSTRY_ROUTE_COLORS.rail, weight: 1.4 },
  sea: { stroke: INDUSTRY_ROUTE_COLORS.sea, weight: 1.8, dash: '10 8' },
  air: { stroke: INDUSTRY_ROUTE_COLORS.air, weight: 1.1, dash: '14 10' },
  river: { stroke: INDUSTRY_ROUTE_COLORS.river, weight: 1.0, dash: '6 8' },
};

const TIER_WEIGHT: Record<RouteVisualTier, Record<TransportMode, number>> = {
  trunk: { road: 5.2, rail: 4.6, sea: 5.0, air: 4.4, river: 4.2 },
  international: { road: 3.0, rail: 2.8, sea: 2.9, air: 2.6, river: 2.5 },
  national: { road: 2.0, rail: 1.8, sea: 1.9, air: 1.6, river: 1.5 },
  local: { road: 1.1, rail: 1.0, sea: 1.0, air: 0.9, river: 0.9 },
};

const TIER_OPACITY: Record<RouteVisualTier, { light: number; dark: number }> = {
  trunk: { light: 0.95, dark: 0.92 },
  international: { light: 0.8, dark: 0.76 },
  national: { light: 0.55, dark: 0.5 },
  local: { light: 0.28, dark: 0.24 },
};

function dashForTier(mode: TransportMode, tier: RouteVisualTier): string | undefined {
  if (tier === 'trunk') {
    if (mode === 'road' || mode === 'rail') return undefined;
    if (mode === 'sea') return '12 7';
    if (mode === 'air') return '16 12';
    return CORRIDOR_PALETTE[mode].dash;
  }
  if (tier === 'international') {
    if (mode === 'road' || mode === 'rail') return undefined;
    return CORRIDOR_PALETTE[mode].dash;
  }
  if (mode === 'road' || mode === 'rail') return undefined;
  if (mode === 'sea') return '8 10';
  if (mode === 'air') return '10 14';
  return CORRIDOR_PALETTE[mode].dash;
}

export interface RouteVisualStyle {
  weight: number;
  dashArray?: string;
  baseOpacity: number;
  tier: RouteVisualTier;
  railDoubleTrack: boolean;
  railTrackOffset: number;
}

export function getRouteVisualStyle(
  mode: TransportMode,
  route: BusinessRouteDef,
  highlighted: boolean,
  themeIsLight: boolean,
): RouteVisualStyle {
  const tier = getRouteVisualTier(route);
  const opacityBand = TIER_OPACITY[tier];

  let baseOpacity = themeIsLight ? opacityBand.light : opacityBand.dark;
  if (highlighted) baseOpacity = Math.min(0.98, baseOpacity + 0.06);

  let weight = TIER_WEIGHT[tier][mode];
  if (highlighted) weight += 0.3;

  const railDoubleTrack = mode === 'rail';
  const railTrackOffset = tier === 'trunk' ? 0.006 : tier === 'international' ? 0.0045 : 0.003;

  return {
    weight,
    dashArray: dashForTier(mode, tier),
    baseOpacity,
    tier,
    railDoubleTrack,
    railTrackOffset,
  };
}

export function corridorStrokeColor(mode: TransportMode, route: BusinessRouteDef): string {
  return routeColorForCorridor(route, mode);
}

export function baseLineOpacity(_prio: RoutePriorityLevel, _themeIsLight: boolean): number {
  return 1;
}

/** Draw order — lower sorts first (underneath) */
export function routeVisualTierSortKey(route: BusinessRouteDef): number {
  const order: Record<RouteVisualTier, number> = {
    local: 0,
    national: 1,
    international: 2,
    trunk: 3,
  };
  return order[getRouteVisualTier(route)];
}

export function routeTierZIndexOffset(tier: RouteVisualTier): number {
  switch (tier) {
    case 'trunk':
      return 320;
    case 'international':
      return 240;
    case 'national':
      return 160;
    default:
      return 80;
  }
}
