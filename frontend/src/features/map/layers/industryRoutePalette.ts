import type { TransportMode } from '../types/mapTypes';
import type { BusinessRouteDef } from '../types/mapTypes';

/** Industry / mode color system — premium logistics streams (reference palette) */
export const INDUSTRY_ROUTE_COLORS = {
  road: '#00c8ff',
  rail: '#22c55e',
  sea: '#f59e0b',
  air: '#a855f7',
  aiOptimized: '#06b6d4',
  partnership: 'rgba(255,255,255,0.65)',
  river: '#06b6d4',
} as const;

export function routeColorForCorridor(route: BusinessRouteDef, mode: TransportMode): string {
  if (route.aiRecommended) return INDUSTRY_ROUTE_COLORS.aiOptimized;
  if (
    route.businessPurpose === 'trade' &&
    mode !== 'road' &&
    mode !== 'rail' &&
    mode !== 'air' &&
    mode !== 'sea'
  ) {
    return INDUSTRY_ROUTE_COLORS.partnership;
  }
  if (route.businessPurpose === 'trade' && (mode === 'sea' || mode === 'air')) {
    return INDUSTRY_ROUTE_COLORS.partnership;
  }
  return INDUSTRY_ROUTE_COLORS[mode] ?? INDUSTRY_ROUTE_COLORS.road;
}

export function isMajorHubNode(city: { isMajorHub?: boolean; businesses?: number }): boolean {
  return !!city.isMajorHub || (city.businesses ?? 0) >= 600;
}

export function hubGlowClass(city: { isMajorHub?: boolean; businesses?: number }): string {
  if (city.isMajorHub) return 'ebh-node-hub-major';
  if ((city.businesses ?? 0) >= 500) return 'ebh-node-hub-regional';
  return 'ebh-node-hub-standard';
}
