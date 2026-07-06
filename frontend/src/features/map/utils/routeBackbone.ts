import {
  BACKBONE_PAIR_KEYS,
  backbonePairKey,
} from '../data/logisticsHubNetwork';

/** Canonical European backbone pairs — Level 1 logistics corridors */
export const EUROPEAN_BACKBONE_PAIRS = BACKBONE_PAIR_KEYS;

export function isEuropeanBackbone(fromCityId: string, toCityId: string): boolean {
  return EUROPEAN_BACKBONE_PAIRS.has(backbonePairKey(fromCityId, toCityId));
}
