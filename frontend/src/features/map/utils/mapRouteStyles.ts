import type { TransportMode } from '../types/mapTypes';
import type { RouteRenderLevel } from '../routes/routeLevels';

/** Brighter inner core — electric highlight per mode */
export function innerCoreColor(mode: TransportMode, baseColor: string, isAi: boolean): string {
  if (isAi) return '#a5f3fc';
  switch (mode) {
    case 'road':
      return '#b8ecff';
    case 'rail':
      return '#86efac';
    case 'air':
      return '#ddd6fe';
    case 'sea':
      return '#fde68a';
    case 'river':
      return '#99f6e4';
    default:
      return baseColor;
  }
}

/** Soft bloom tint for outer glow layers */
export function glowBloomColor(mode: TransportMode, baseColor: string, isAi: boolean): string {
  if (isAi) return '#06b6d4';
  switch (mode) {
    case 'road':
      return '#00c8ff';
    case 'rail':
      return '#22c55e';
    case 'air':
      return '#a855f7';
    case 'sea':
      return '#f59e0b';
    case 'river':
      return '#06b6d4';
    default:
      return baseColor;
  }
}

/** Dark underlay for depth on premium routes */
export function basePathColor(_mode: TransportMode): string {
  return '#0a1628';
}

export function particleClassForMode(mode: TransportMode, isAi: boolean): string {
  if (isAi) return 'ebh-particle-ai';
  return `ebh-particle-${mode}`;
}

export function particleRadiusForMode(mode: TransportMode, level: RouteRenderLevel): number {
  const base = level === 1 ? 1.6 : level === 2 ? 1.2 : 0.9;
  switch (mode) {
    case 'air':
      return base * 0.8;
    case 'sea':
      return base * 0.95;
    case 'rail':
      return base * 0.88;
    default:
      return base;
  }
}

export function particleSpeedForMode(mode: TransportMode): number {
  switch (mode) {
    case 'air':
      return 1.35;
    case 'sea':
      return 0.72;
    case 'rail':
      return 1.05;
    case 'road':
      return 1;
    default:
      return 0.9;
  }
}

export function directionMarkerCount(level: RouteRenderLevel): number {
  return level === 1 ? 2 : level === 2 ? 1 : 0;
}
