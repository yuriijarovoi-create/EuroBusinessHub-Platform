import type { BusinessRouteDef } from '../types/mapTypes';
import { buildRouteBatch } from './routeBuilder';

/**
 * France — national mesh + international corridors.
 * Complements existing pan-European registry; no duplicate city pairs.
 */
export const FRANCE_CORRIDORS: BusinessRouteDef[] = [
  ...buildRouteBatch(
    [
      // ── International flagship (user-requested) ──
      ['paris', 'rotterdam', 'rail', 'europe', ['FR', 'NL'], 1, 5],
      ['lille', 'brussels', 'rail', 'europe', ['FR', 'BE'], 1, 5],
      ['lille', 'london', 'rail', 'europe', ['FR', 'GB'], 1, 4],
      ['lille', 'rotterdam', 'rail', 'europe', ['FR', 'NL'], 1, 4],
      ['lyon', 'marseille', 'rail', 'country', ['FR'], 1, 5],
      ['lyon', 'zurich', 'rail', 'europe', ['FR', 'CH'], 1, 4],
      ['marseille', 'genoa', 'sea', 'europe', ['FR', 'IT'], 1, 4],
      ['marseille', 'nice', 'road', 'country', ['FR'], 1, 4],
      ['strasbourg', 'stuttgart', 'road', 'europe', ['FR', 'DE'], 1, 4],
      ['strasbourg', 'zurich', 'rail', 'europe', ['FR', 'CH'], 1, 4],

      // ── Paris national spokes ──
      ['paris', 'bordeaux', 'rail', 'country', ['FR'], 1, 4],
      ['paris', 'toulouse', 'rail', 'country', ['FR'], 1, 4],
      ['paris', 'nantes', 'rail', 'country', ['FR'], 1, 4],
      ['paris', 'nice', 'air', 'country', ['FR'], 2, 4],
      ['paris', 'lehavre', 'sea', 'country', ['FR'], 1, 4],
      ['paris', 'rouen', 'road', 'country', ['FR'], 2, 4],
      ['paris', 'reims', 'road', 'country', ['FR'], 2, 3],
      ['paris', 'dijon', 'rail', 'country', ['FR'], 2, 3],
      ['paris', 'metz', 'rail', 'country', ['FR'], 2, 4],
      ['paris', 'clermont', 'rail', 'country', ['FR'], 2, 3],
      ['paris', 'montpellier', 'air', 'country', ['FR'], 2, 3],
      ['paris', 'grenoble', 'rail', 'country', ['FR'], 2, 3],

      // ── Regional France mesh ──
      ['lyon', 'toulouse', 'road', 'country', ['FR'], 2, 4],
      ['lyon', 'grenoble', 'road', 'country', ['FR'], 2, 4],
      ['lyon', 'dijon', 'road', 'country', ['FR'], 2, 3],
      ['lyon', 'clermont', 'road', 'country', ['FR'], 2, 3],
      ['marseille', 'montpellier', 'road', 'country', ['FR'], 2, 4],
      ['marseille', 'toulouse', 'road', 'country', ['FR'], 2, 3],
      ['nantes', 'bordeaux', 'road', 'country', ['FR'], 2, 4],
      ['bordeaux', 'toulouse', 'rail', 'country', ['FR'], 2, 4],
      ['strasbourg', 'metz', 'road', 'country', ['FR'], 2, 3],
      ['lehavre', 'rouen', 'sea', 'country', ['FR'], 2, 3],
      ['nice', 'toulouse', 'road', 'country', ['FR'], 2, 3],
      ['grenoble', 'geneva', 'road', 'europe', ['FR', 'CH'], 2, 3],
      ['toulouse', 'montpellier', 'road', 'country', ['FR'], 2, 3],
      ['lille', 'strasbourg', 'rail', 'country', ['FR'], 2, 4],
      ['bordeaux', 'lyon', 'rail', 'country', ['FR'], 2, 4],
    ],
    'fr',
  ),
];
