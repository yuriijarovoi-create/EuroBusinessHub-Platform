/** Canonical European backbone pairs — visual tier only, ~15–25 strategic corridors */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

const EUROPEAN_BACKBONE_RAW: Array<[string, string]> = [
  ['rotterdam', 'hamburg'],
  ['rotterdam', 'cologne'],
  ['cologne', 'rotterdam'],
  ['berlin', 'hamburg'],
  ['berlin', 'warsaw'],
  ['berlin', 'prague'],
  ['berlin', 'vienna'],
  ['berlin', 'paris'],
  ['frankfurt', 'cologne'],
  ['frankfurt', 'amsterdam'],
  ['frankfurt', 'paris'],
  ['munich', 'vienna'],
  ['munich', 'zurich'],
  ['vienna', 'budapest'],
  ['paris', 'brussels'],
  ['paris', 'amsterdam'],
  ['amsterdam', 'brussels'],
  ['amsterdam', 'rotterdam'],
  ['rotterdam', 'antwerp'],
  ['hamburg', 'copenhagen'],
  ['warsaw', 'kyiv'],
  ['lyon', 'milan'],
  ['zurich', 'milan'],
  ['prague', 'berlin'],
  ['cologne', 'brussels'],
];

export const EUROPEAN_BACKBONE_PAIRS = new Set(
  EUROPEAN_BACKBONE_RAW.map(([a, b]) => pairKey(a, b)),
);

export function isEuropeanBackbone(fromCityId: string, toCityId: string): boolean {
  return EUROPEAN_BACKBONE_PAIRS.has(pairKey(fromCityId, toCityId));
}
