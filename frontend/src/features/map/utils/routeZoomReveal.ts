import type { BusinessRouteDef } from '../types/mapTypes';
import { getRouteVisualTier } from './routeVisualStyles';

/**
 * Smooth opacity ramp as routes enter their visible zoom band.
 * Visual only — does not change which routes the filter returns.
 */
export function zoomRevealMultiplier(route: BusinessRouteDef, zoom: number): number {
  const min = route.visibleZoomMin ?? 0;
  const tier = getRouteVisualTier(route);
  const fadeSpan = tier === 'trunk' ? 0.35 : tier === 'international' ? 0.65 : 0.9;

  if (zoom >= min + fadeSpan) return 1;
  if (zoom <= min) return tier === 'trunk' ? 0.82 : 0.28;

  const t = (zoom - min) / fadeSpan;
  const eased = t * t * (3 - 2 * t);
  const floor = tier === 'trunk' ? 0.82 : tier === 'international' ? 0.38 : 0.22;
  return floor + (1 - floor) * eased;
}
