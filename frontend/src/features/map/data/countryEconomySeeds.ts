/**
 * Economy tier seeds (0–1) — drives proportional mock stats for every country.
 * City aggregates are merged on top when cities exist in the registry.
 */
export const COUNTRY_ECONOMY_SEED: Record<string, number> = {
  DE: 1,
  FR: 0.88,
  GB: 0.82,
  IT: 0.76,
  ES: 0.68,
  NL: 0.72,
  BE: 0.58,
  PL: 0.62,
  CH: 0.64,
  AT: 0.54,
  SE: 0.52,
  NO: 0.48,
  UA: 0.42,
  TR: 0.55,
  RO: 0.38,
  CZ: 0.4,
  PT: 0.36,
  GR: 0.34,
  HU: 0.32,
  DK: 0.44,
  FI: 0.4,
  IE: 0.38,
  SK: 0.28,
  BG: 0.26,
  HR: 0.24,
  SI: 0.22,
  LT: 0.2,
  LV: 0.19,
  EE: 0.18,
  LU: 0.3,
  RS: 0.22,
  BA: 0.16,
  MK: 0.14,
  AL: 0.15,
  ME: 0.12,
  MD: 0.14,
};

export function economySeedForCountry(code: string): number {
  if (COUNTRY_ECONOMY_SEED[code]) return COUNTRY_ECONOMY_SEED[code];
  const hash = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 0.14 + (hash % 28) / 100;
}

export function baselineCountryMetrics(seed: number) {
  return {
    companies: Math.round(4200 * seed + 800),
    jobs: Math.round(1280 * seed + 320),
    warehouses: Math.round(48 * seed + 8),
    transport: Math.round(220 * seed + 40),
    marketplace: Math.round(1800 * seed + 400),
    partners: Math.round(320 * seed + 60),
    aiScore: Math.min(97, Math.round(72 + seed * 22)),
  };
}
