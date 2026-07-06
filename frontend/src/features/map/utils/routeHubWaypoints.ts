import type { TransportMode } from '../types/mapTypes';

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * Hub chains for corridor geometry — routes follow logistics nodes, not straight diagonals.
 * Render-time only; does not alter route registry.
 */
const HUB_CHAINS: Record<string, string[]> = {
  'paris|rotterdam': ['lille', 'brussels'],
  'paris|london': ['lille'],
  'paris|milan': ['lyon'],
  'paris|barcelona': ['lyon'],
  'paris|frankfurt': ['reims', 'strasbourg'],
  'paris|lehavre': ['rouen'],
  'paris|bordeaux': [],
  'paris|toulouse': ['bordeaux'],
  'paris|nantes': [],
  'paris|nice': ['lyon', 'marseille'],
  'paris|metz': ['reims'],
  'lyon|marseille': [],
  'lyon|zurich': ['geneva'],
  'lyon|milan': ['turin'],
  'marseille|genoa': [],
  'marseille|barcelona': [],
  'marseille|nice': [],
  'lille|brussels': [],
  'lille|london': [],
  'lille|rotterdam': ['brussels'],
  'strasbourg|stuttgart': [],
  'strasbourg|frankfurt': [],
  'strasbourg|zurich': [],
  'bordeaux|toulouse': [],
  'nantes|bordeaux': [],
  'grenoble|geneva': ['lyon'],
  'berlin|paris': ['brussels', 'cologne'],
  'berlin|kyiv': ['warsaw'],
  'izium|kyiv': [],
  'izium|kharkiv': [],
  'izium|dnipro': ['kharkiv'],
  'izium|warsaw': ['kyiv', 'lviv'],
  'izium|berlin': ['kyiv', 'warsaw'],
  'izium|frankfurt': ['kyiv', 'warsaw', 'berlin'],
  'izium|prague': ['kyiv', 'lviv'],
  'kyiv|kharkiv': [],
  'kyiv|dnipro': [],
  'kyiv|lviv': [],
  'kyiv|odesa': [],
  'kyiv|vienna': ['lviv', 'prague'],
  'kyiv|prague': ['lviv'],
  'krakow|lviv': [],
  'bucharest|odesa': [],
  'odesa|izium': ['dnipro'],
  'istanbul|izmir': [],
  'istanbul|bursa': [],
  'izmir|ankara': ['ankara'],
  'istanbul|sofia': [],
  'istanbul|bucharest': ['sofia'],
  'istanbul|vienna': ['sofia', 'budapest'],
  'istanbul|budapest': ['sofia'],
  'istanbul|berlin': ['sofia', 'budapest', 'warsaw'],
  'istanbul|frankfurt': ['sofia', 'budapest', 'vienna'],
  'istanbul|kyiv': ['bucharest', 'warsaw'],
  'ankara|istanbul': [],
  'odesa|istanbul': [],
  'odesa|constanta': [],
  'lviv|warsaw': [],
  'vilnius|warsaw': [],
  'stockholm|helsinki': [],
  'stockholm|copenhagen': ['copenhagen'],
  'oslo|copenhagen': [],
  'helsinki|tallinn': [],
  'tallinn|riga': [],
  'riga|vilnius': [],
  'copenhagen|hamburg': [],
  'london|amsterdam': ['brussels'],
  'dublin|london': [],
  'madrid|lisbon': [],
  'belgrade|budapest': [],
  'zagreb|vienna': ['ljubljana'],
  'bucharest|budapest': [],
  'athens|sofia': ['thessaloniki'],
  'berlin|stockholm': ['hamburg', 'copenhagen'],
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
