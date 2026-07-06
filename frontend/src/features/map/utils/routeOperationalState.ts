import type { BusinessRouteDef } from '../types/mapTypes';

/** Future-ready corridor operational states */
export type RouteOperationalState =
  | 'available'
  | 'high_demand'
  | 'delayed'
  | 'overloaded'
  | 'reserved';

export function getOperationalState(route: BusinessRouteDef): RouteOperationalState {
  if (route.status === 'congested') return 'overloaded';
  if (route.status === 'maintenance') return 'delayed';
  if (route.status === 'seasonal') return 'reserved';
  const offers = route.activeOffers ?? 0;
  const orders = route.activeOrders ?? 0;
  if (offers >= 18 || orders >= 14) return 'overloaded';
  if (offers >= 10 || orders >= 8) return 'high_demand';
  return 'available';
}

/** Muted enterprise tint — blended lightly over mode color */
export const OPERATIONAL_TINT: Record<RouteOperationalState, string | null> = {
  available: null,
  high_demand: '#9a6b2e',
  delayed: '#6b7280',
  overloaded: '#8b4a5c',
  reserved: '#5c6b8a',
};

export function blendRouteColor(modeColor: string, state: RouteOperationalState): string {
  const tint = OPERATIONAL_TINT[state];
  if (!tint) return modeColor;
  return tint;
}
