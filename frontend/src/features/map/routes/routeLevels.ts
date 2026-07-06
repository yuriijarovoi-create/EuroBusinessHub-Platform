import type { BusinessRouteDef } from '../types/mapTypes';
import { getRouteVisualTier, type RouteVisualTier } from '../utils/routeVisualStyles';

/** Three-level route hierarchy for rendering */
export type RouteRenderLevel = 1 | 2 | 3;

export function getRouteRenderLevel(route: BusinessRouteDef): RouteRenderLevel {
  const tier = getRouteVisualTier(route);
  if (tier === 'trunk' || tier === 'international') return 1;
  if (tier === 'national') return 2;
  return 3;
}

export interface LevelStyleConfig {
  weightScale: number;
  opacityScale: number;
  glowOuter: number;
  glowAtmo: number;
  particleCount: number;
}

export const LEVEL_STYLE: Record<RouteRenderLevel, LevelStyleConfig> = {
  1: { weightScale: 1, opacityScale: 1, glowOuter: 3.2, glowAtmo: 6.5, particleCount: 4 },
  2: { weightScale: 0.72, opacityScale: 0.78, glowOuter: 1.8, glowAtmo: 3.6, particleCount: 2 },
  3: { weightScale: 0.48, opacityScale: 0.52, glowOuter: 0.9, glowAtmo: 1.8, particleCount: 1 },
};

export function particleCountForRoute(
  route: BusinessRouteDef,
  zoom: number,
  globalCount: number,
  maxGlobal = 36,
): number {
  if (globalCount >= maxGlobal || zoom < 5.5) return 0;
  const level = getRouteRenderLevel(route);
  const cfg = LEVEL_STYLE[level];
  if (level === 3 && zoom < 10) return 0;
  if (level === 2 && zoom < 7.5) return 0;
  if (level === 1 && zoom < 5.5) return 0;
  return cfg.particleCount;
}

export function tierToLevelClass(tier: RouteVisualTier): string {
  const level = tier === 'trunk' || tier === 'international' ? 1 : tier === 'national' ? 2 : 3;
  return `ebh-route-level-${level}`;
}
