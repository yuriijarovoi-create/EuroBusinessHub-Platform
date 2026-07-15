import type { RawLocalNodeDef } from './germanyLocalNodes.generated';

export type SettlementMapTier = 1 | 2 | 3 | 4;

/**
 * Infer map tier from population — aligns with platform hierarchy:
 * 1 major hub, 2 large city, 3 medium town, 4 small town / village
 * (display tier 5 for villages is derived in cityVisibilityUtils when pop < 3500)
 */
export function inferSettlementMapTier(def: RawLocalNodeDef): SettlementMapTier {
  const pop = def.population;
  if (pop >= 50000) return 2;
  if (pop >= 5000) return 3;
  return 4;
}

/** Count fractional digits in coordinate — prefer OSM-precision defs on dedup. */
export function coordinatePrecision(def: RawLocalNodeDef): number {
  const latDec = decimalPlaces(def.lat);
  const lngDec = decimalPlaces(def.lng);
  return latDec + lngDec;
}

function decimalPlaces(n: number): number {
  const s = String(n);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

/** Deduplicate by id — keep the record with higher coordinate precision (OSM wins). */
export function dedupeSettlementDefs(defs: RawLocalNodeDef[]): RawLocalNodeDef[] {
  const byId = new Map<string, RawLocalNodeDef>();
  for (const def of defs) {
    const existing = byId.get(def.id);
    if (!existing) {
      byId.set(def.id, def);
      continue;
    }
    if (coordinatePrecision(def) > coordinatePrecision(existing)) {
      byId.set(def.id, def);
    }
  }
  return [...byId.values()];
}

/** Legacy duplicate slugs removed from seed merge — kept for search redirect only. */
export const DUPLICATE_SETTLEMENT_SLUGS = new Set([
  'bingen_am_rhein',
  'landau_in_der_pfalz',
  'weiden_in_der_oberpfalz',
]);
