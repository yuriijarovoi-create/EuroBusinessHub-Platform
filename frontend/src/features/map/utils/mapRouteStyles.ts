import type { TransportMode } from '../types/mapTypes';
import type { RouteRenderLevel } from '../routes/routeLevels';

/** Brighter inner core tint per transport mode */
export function innerCoreColor(mode: TransportMode, baseColor: string, isAi: boolean): string {
  if (isAi) return '#67e8f9';
  switch (mode) {
    case 'road':
      return '#7ec8ff';
    case 'rail':
      return '#6ee7a0';
    case 'air':
      return '#c4b5fd';
    case 'sea':
      return '#ffb380';
    case 'river':
      return '#5eead4';
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
  const base = level === 1 ? 2.6 : level === 2 ? 2 : 1.4;
  switch (mode) {
    case 'air':
      return base * 0.85;
    case 'sea':
      return base * 1.1;
    case 'rail':
      return base * 0.95;
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
  return level === 1 ? 3 : level === 2 ? 2 : 0;
}
