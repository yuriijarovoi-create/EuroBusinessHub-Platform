import type { TransportMode } from '../types/mapTypes';

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * Hub chains for corridor geometry — routes follow logistics nodes, not straight diagonals.
 * Render-time only; does not alter route registry.
 */
const HUB_CHAINS: Record<string, string[]> = {
  'berlin|stockholm': ['hamburg', 'copenhagen'],
  'berlin|kyiv': ['warsaw'],
  'berlin|copenhagen': ['hamburg'],
  'berlin|amsterdam': ['hamburg'],
  'berlin|paris': ['hanover', 'cologne', 'brussels'],
  'berlin|munich': ['leipzig', 'frankfurt'],
  'hamburg|stockholm': ['copenhagen'],
  'hamburg|munich': ['hanover', 'frankfurt'],
  'frankfurt|milan': ['munich', 'zurich'],
  'frankfurt|vienna': ['munich'],
  'frankfurt|brussels': ['cologne'],
  'paris|milan': ['lyon'],
  'barcelona|paris': ['lyon'],
  'cologne|paris': ['brussels'],
  'munich|milan': ['zurich'],
  'milan|munich': ['zurich'],
  'warsaw|krakow': [],
  'hamburg|bremen': [],
  'bremen|hanover': [],
  'hanover|frankfurt': [],
  'frankfurt|stuttgart': [],
  'stuttgart|munich': [],
  'vienna|budapest': [],
  'budapest|bratislava': [],
  'rotterdam|cologne': ['antwerp'],
  'duesseldorf|rotterdam': ['cologne'],
};

const NATIONAL_CHAINS: Record<string, string[]> = {
  'berlin|munich': ['leipzig', 'frankfurt'],
  'hamburg|munich': ['hanover', 'frankfurt', 'stuttgart'],
  'hamburg|frankfurt': ['hanover'],
  'berlin|frankfurt': ['leipzig'],
  'berlin|cologne': ['hanover'],
  'munich|stuttgart': [],
  'paris|marseille': ['lyon'],
  'madrid|barcelona': [],
};

export function resolveHubWaypointIds(
  fromCityId: string,
  toCityId: string,
  scope: string,
  distanceKm: number,
): string[] {
  const key = pairKey(fromCityId, toCityId);
  const explicit = HUB_CHAINS[key];
  if (explicit?.length) return explicit;

  if (scope === 'country' || scope === 'regional') {
    const national = NATIONAL_CHAINS[key];
    if (national?.length) return national;
  }

  if (distanceKm > 700) {
    return HUB_CHAINS[key] ?? [];
  }

  return [];
}

/** Per-mode lane separation for parallel corridors on the same city pair */
export function modeLaneIndex(mode: TransportMode): number {
  switch (mode) {
    case 'road':
      return 0;
    case 'rail':
      return -1.1;
    case 'sea':
      return 1.1;
    case 'air':
      return 2.2;
    case 'river':
      return -2;
    default:
      return 0;
  }
}
