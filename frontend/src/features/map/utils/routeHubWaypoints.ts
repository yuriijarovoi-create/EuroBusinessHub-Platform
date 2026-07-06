import type { TransportMode } from '../types/mapTypes';
import { corridorWaypointChain, isLogisticsHub } from '../data/logisticsHubNetwork';

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * Hub chains for corridor geometry — routes follow engineered transport spines.
 */
const HUB_CHAINS: Record<string, string[]> = {};

export function resolveHubWaypointIds(
  fromCityId: string,
  toCityId: string,
  scope: string,
  distanceKm: number,
): string[] {
  const corridorWaypoints = corridorWaypointChain(fromCityId, toCityId);
  if (corridorWaypoints?.length) return corridorWaypoints;

  if (isLogisticsHub(fromCityId) && isLogisticsHub(toCityId)) {
    return [];
  }

  const key = pairKey(fromCityId, toCityId);
  const explicit = HUB_CHAINS[key];
  if (explicit !== undefined) return explicit;

  if (distanceKm > 900) {
    return HUB_CHAINS[key] ?? [];
  }

  return [];
}

/** Per-mode lane separation — minimal offset to avoid spaghetti crossings */
export function modeLaneIndex(mode: TransportMode): number {
  switch (mode) {
    case 'road':
      return 0;
    case 'rail':
      return 0.28;
    case 'air':
      return 0.65;
    case 'sea':
      return 0.42;
    case 'river':
      return 0.2;
    default:
      return 0;
  }
}
