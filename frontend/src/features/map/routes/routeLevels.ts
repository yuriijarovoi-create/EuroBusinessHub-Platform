import type { BusinessRouteDef } from '../types/mapTypes';
import type { RouteVisualTier } from '../utils/routeVisualStyles';
import { isEuropeanBackbone } from '../utils/routeBackbone';

/** Four-level route hierarchy for rendering */
export type RouteRenderLevel = 1 | 2 | 3 | 4;

export function getRouteRenderLevel(route: BusinessRouteDef): RouteRenderLevel {
  const tier = route.priorityTier ?? 3;
  if (tier <= 1) return 1;
  if (tier === 2) return 2;
  if (tier === 3) return 3;
  return 4;
}

export interface LevelStyleConfig {
  weightScale: number;
  opacityScale: number;
  glowOuter: number;
  glowAtmo: number;
  particleCount: number;
}

export const LEVEL_STYLE: Record<RouteRenderLevel, LevelStyleConfig> = {
  1: { weightScale: 1, opacityScale: 0.96, glowOuter: 14, glowAtmo: 18, particleCount: 3 },
  2: { weightScale: 1, opacityScale: 0.82, glowOuter: 9, glowAtmo: 12, particleCount: 2 },
  3: { weightScale: 1, opacityScale: 0.68, glowOuter: 6, glowAtmo: 8, particleCount: 1 },
  4: { weightScale: 1, opacityScale: 0.58, glowOuter: 4, glowAtmo: 5, particleCount: 1 },
};

export function particleCountForRoute(
  route: BusinessRouteDef,
  zoom: number,
  globalCount: number,
  maxGlobal = 72,
): number {
  if (globalCount >= maxGlobal || zoom >= 10.5) return 0;
  const level = getRouteRenderLevel(route);
  const cfg = LEVEL_STYLE[level];
  if (level === 4 && zoom < 11) return 0;
  if (level === 3 && zoom < 9) return 0;
  if (level === 2 && zoom < 6) return 0;
  if (level === 1 && zoom < 3) return 0;
  let count = cfg.particleCount;
  if (isEuropeanBackbone(route.fromCityId, route.toCityId) && level === 1) {
    count = Math.min(4, count + 1);
  }
  return count;
}

export function tierToLevelClass(tier: RouteVisualTier): string {
  const level =
    tier === 'trunk' || tier === 'international'
      ? 1
      : tier === 'national'
        ? 2
        : tier === 'regional'
          ? 3
          : 4;
  return `ebh-route-level-${level}`;
}
