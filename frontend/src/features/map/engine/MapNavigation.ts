import type { MapViewLevel } from './types';

const LEVEL_ZOOM_HINT: Record<MapViewLevel, number> = {
  europe: 4.5,
  country: 6.5,
  region: 8.5,
  city: 10.5,
  workspace: 12,
};

export function zoomHintForLevel(level: MapViewLevel): number {
  return LEVEL_ZOOM_HINT[level];
}

export function levelLabelKey(level: MapViewLevel): string {
  return `navigation.${level}`;
}

export function nextLevel(current: MapViewLevel): MapViewLevel | null {
  const chain: MapViewLevel[] = ['europe', 'country', 'region', 'city', 'workspace'];
  const i = chain.indexOf(current);
  return i >= 0 && i < chain.length - 1 ? chain[i + 1] : null;
}

export function prevLevel(current: MapViewLevel): MapViewLevel | null {
  const chain: MapViewLevel[] = ['europe', 'country', 'region', 'city', 'workspace'];
  const i = chain.indexOf(current);
  return i > 0 ? chain[i - 1] : null;
}
