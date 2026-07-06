import type { BusinessRouteDef } from '../types/mapTypes';
import { buildRouteBatch } from './routeBuilder';
import { GERMANY_EXTENDED_CORRIDORS } from './germanyCorridors';
import { EASTERN_EUROPE_CORRIDORS } from './easternEuropeCorridors';
import { FRANCE_CORRIDORS } from './franceCorridors';

/**
 * Curated European Business Corridor registry.
 * Only meaningful logistics / trade corridors — no dense local mesh.
 */
export const BUSINESS_CORRIDORS: BusinessRouteDef[] = [
  ...buildRouteBatch(
    [
      // ── Europe: strategic corridors ──
      ['berlin', 'paris', 'rail', 'europe', ['DE', 'FR'], 1, 5],
      ['berlin', 'warsaw', 'rail', 'europe', ['DE', 'PL'], 1, 5],
      ['berlin', 'prague', 'road', 'europe', ['DE', 'CZ'], 1, 4],
      ['berlin', 'vienna', 'rail', 'europe', ['DE', 'AT'], 1, 4],
      ['frankfurt', 'paris', 'air', 'europe', ['DE', 'FR'], 1, 4],
      ['frankfurt', 'amsterdam', 'road', 'europe', ['DE', 'NL'], 1, 4],
      ['frankfurt', 'milan', 'air', 'europe', ['DE', 'IT'], 1, 4],
      ['hamburg', 'copenhagen', 'sea', 'europe', ['DE', 'DK'], 1, 4],
      ['cologne', 'brussels', 'rail', 'europe', ['DE', 'BE'], 1, 4],
      ['munich', 'zurich', 'road', 'europe', ['DE', 'CH'], 1, 4],
      ['munich', 'vienna', 'rail', 'europe', ['DE', 'AT'], 1, 4],
      ['warsaw', 'kyiv', 'rail', 'europe', ['PL', 'UA'], 1, 4],
      ['paris', 'brussels', 'rail', 'europe', ['FR', 'BE'], 1, 5],
      ['paris', 'amsterdam', 'rail', 'europe', ['FR', 'NL'], 1, 4],
      ['amsterdam', 'brussels', 'rail', 'europe', ['NL', 'BE'], 1, 4],
      ['rotterdam', 'hamburg', 'sea', 'europe', ['NL', 'DE'], 1, 5],
      ['lyon', 'milan', 'rail', 'europe', ['FR', 'IT'], 1, 4],
      ['paris', 'milan', 'air', 'europe', ['FR', 'IT'], 1, 4],
      ['marseille', 'barcelona', 'sea', 'europe', ['FR', 'ES'], 1, 4],
      ['barcelona', 'paris', 'rail', 'europe', ['ES', 'FR'], 2, 3],
      ['london', 'paris', 'rail', 'europe', ['GB', 'FR'], 2, 4],
      ['zurich', 'milan', 'rail', 'europe', ['CH', 'IT'], 1, 4],
      ['prague', 'berlin', 'rail', 'europe', ['CZ', 'DE'], 2, 4],
      ['vienna', 'budapest', 'rail', 'europe', ['AT', 'HU'], 2, 4],
      ['strasbourg', 'frankfurt', 'road', 'europe', ['FR', 'DE'], 2, 3],
      ['antwerp', 'rotterdam', 'sea', 'europe', ['BE', 'NL'], 2, 4],

      // ── Germany: national economic corridors ──
      ['berlin', 'hamburg', 'rail', 'country', ['DE'], 1, 5],
      ['berlin', 'leipzig', 'rail', 'country', ['DE'], 1, 4],
      ['berlin', 'dresden', 'rail', 'country', ['DE'], 1, 4],
      ['berlin', 'frankfurt', 'road', 'country', ['DE'], 1, 4],
      ['berlin', 'munich', 'rail', 'country', ['DE'], 1, 5],
      ['hamburg', 'bremen', 'sea', 'country', ['DE'], 2, 4],
      ['hamburg', 'hanover', 'road', 'country', ['DE'], 2, 4],
      ['frankfurt', 'cologne', 'road', 'country', ['DE'], 1, 5],
      ['frankfurt', 'duesseldorf', 'rail', 'country', ['DE'], 1, 4],
      ['frankfurt', 'stuttgart', 'rail', 'country', ['DE'], 1, 4],
      ['frankfurt', 'munich', 'air', 'country', ['DE'], 1, 5],
      ['cologne', 'duesseldorf', 'road', 'country', ['DE'], 2, 4],
      ['cologne', 'dortmund', 'rail', 'country', ['DE'], 2, 4],
      ['munich', 'nuremberg', 'rail', 'country', ['DE'], 2, 4],
      ['munich', 'stuttgart', 'road', 'country', ['DE'], 2, 4],
      ['leipzig', 'dresden', 'rail', 'country', ['DE'], 2, 4],
      ['stuttgart', 'munich', 'road', 'country', ['DE'], 2, 3],
      ['hanover', 'frankfurt', 'rail', 'country', ['DE'], 2, 3],
      ['dresden', 'prague', 'rail', 'country', ['DE', 'CZ'], 2, 3],

      // ── Poland ──
      ['warsaw', 'berlin', 'rail', 'europe', ['PL', 'DE'], 1, 5],
      ['warsaw', 'krakow', 'rail', 'country', ['PL'], 1, 4],
      ['warsaw', 'gdansk', 'rail', 'country', ['PL'], 1, 4],
      ['warsaw', 'poznan', 'road', 'country', ['PL'], 2, 3],
      ['warsaw', 'wroclaw', 'rail', 'country', ['PL'], 2, 4],
      ['poznan', 'berlin', 'road', 'europe', ['PL', 'DE'], 2, 4],
      ['wroclaw', 'dresden', 'rail', 'europe', ['PL', 'DE'], 2, 4],
      ['gdansk', 'hamburg', 'sea', 'europe', ['PL', 'DE'], 2, 4],
      ['krakow', 'vienna', 'rail', 'europe', ['PL', 'AT'], 2, 3],
      ['lodz', 'warsaw', 'road', 'regional', ['PL'], 3, 3],

      // ── France ──
      ['paris', 'berlin', 'rail', 'europe', ['FR', 'DE'], 1, 5],
      ['paris', 'frankfurt', 'air', 'europe', ['FR', 'DE'], 1, 4],
      ['paris', 'lyon', 'rail', 'country', ['FR'], 1, 4],
      ['paris', 'marseille', 'air', 'country', ['FR'], 1, 4],
      ['paris', 'strasbourg', 'road', 'country', ['FR'], 2, 3],
      ['paris', 'lille', 'rail', 'country', ['FR'], 2, 3],

      // ── Austria ──
      ['vienna', 'munich', 'rail', 'europe', ['AT', 'DE'], 1, 4],
      ['vienna', 'prague', 'rail', 'europe', ['AT', 'CZ'], 1, 4],
      ['vienna', 'bratislava', 'road', 'europe', ['AT', 'SK'], 2, 4],
      ['vienna', 'salzburg', 'road', 'country', ['AT'], 2, 3],
      ['salzburg', 'munich', 'road', 'europe', ['AT', 'DE'], 2, 4],
      ['graz', 'vienna', 'road', 'country', ['AT'], 3, 3],
      ['linz', 'prague', 'road', 'europe', ['AT', 'CZ'], 3, 3],

      // ── Netherlands / Belgium ──
      ['amsterdam', 'rotterdam', 'road', 'country', ['NL'], 1, 5],
      ['rotterdam', 'antwerp', 'sea', 'europe', ['NL', 'BE'], 1, 5],
      ['brussels', 'antwerp', 'road', 'country', ['BE'], 2, 4],
      ['brussels', 'paris', 'rail', 'europe', ['BE', 'FR'], 1, 4],
      ['brussels', 'cologne', 'road', 'europe', ['BE', 'DE'], 2, 4],
      ['antwerp', 'cologne', 'road', 'europe', ['BE', 'DE'], 2, 3],
      ['liege', 'cologne', 'road', 'europe', ['BE', 'DE'], 3, 3],

      // ── Czech Republic ──
      ['prague', 'vienna', 'rail', 'europe', ['CZ', 'AT'], 2, 4],
      ['prague', 'brno', 'road', 'country', ['CZ'], 3, 3],
      ['wroclaw', 'prague', 'road', 'europe', ['PL', 'CZ'], 2, 3],

      // ── Switzerland ──
      ['zurich', 'munich', 'rail', 'europe', ['CH', 'DE'], 2, 4],
      ['zurich', 'basel', 'rail', 'country', ['CH'], 3, 3],
      ['zurich', 'geneva', 'rail', 'country', ['CH'], 3, 3],
      ['geneva', 'lyon', 'road', 'europe', ['CH', 'FR'], 3, 3],
      ['basel', 'frankfurt', 'rail', 'europe', ['CH', 'DE'], 2, 4],

      // ── Italy ──
      ['milan', 'zurich', 'rail', 'europe', ['IT', 'CH'], 1, 4],
      ['milan', 'munich', 'rail', 'europe', ['IT', 'DE'], 2, 4],
      ['milan', 'rome', 'rail', 'country', ['IT'], 1, 5],
      ['milan', 'turin', 'road', 'country', ['IT'], 2, 4],
      ['rome', 'naples', 'road', 'country', ['IT'], 2, 4],
      ['venice', 'vienna', 'rail', 'europe', ['IT', 'AT'], 2, 3],
      ['venice', 'milan', 'road', 'country', ['IT'], 3, 3],
      ['bologna', 'florence', 'road', 'regional', ['IT'], 3, 3],

      // ── Spain ──
      ['madrid', 'barcelona', 'rail', 'country', ['ES'], 1, 5],
      ['madrid', 'valencia', 'rail', 'country', ['ES'], 2, 4],
      ['barcelona', 'marseille', 'sea', 'europe', ['ES', 'FR'], 2, 4],
      ['barcelona', 'valencia', 'road', 'country', ['ES'], 3, 3],
      ['bilbao', 'madrid', 'road', 'country', ['ES'], 2, 3],
      ['bilbao', 'bordeaux', 'road', 'europe', ['ES', 'FR'], 3, 3],
    ],
    'corridor',
  ),
  ...GERMANY_EXTENDED_CORRIDORS,
  ...EASTERN_EUROPE_CORRIDORS,
  ...FRANCE_CORRIDORS,
];
