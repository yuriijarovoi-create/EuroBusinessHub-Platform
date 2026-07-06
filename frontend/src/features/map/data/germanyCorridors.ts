import type { BusinessRouteDef } from '../types/mapTypes';
import { buildRouteBatch } from './routeBuilder';

/** Extended Germany hub corridors — internal + international spokes */
export const GERMANY_EXTENDED_CORRIDORS: BusinessRouteDef[] = [
  ...buildRouteBatch(
    [
      // Internal Germany (additional)
      ['berlin', 'cologne', 'rail', 'country', ['DE'], 1, 4],
      ['hamburg', 'kiel', 'sea', 'country', ['DE'], 2, 3],
      ['hamburg', 'luebeck', 'sea', 'country', ['DE'], 3, 3],
      ['frankfurt', 'mannheim', 'road', 'country', ['DE'], 2, 4],
      ['cologne', 'essen', 'road', 'country', ['DE'], 2, 4],
      ['duisburg', 'dortmund', 'rail', 'country', ['DE'], 2, 5],
      ['duisburg', 'cologne', 'river', 'country', ['DE'], 2, 5],
      ['stuttgart', 'karlsruhe', 'road', 'country', ['DE'], 2, 3],
      ['munich', 'augsburg', 'road', 'country', ['DE'], 2, 3],
      ['hanover', 'dortmund', 'rail', 'country', ['DE'], 2, 3],
      ['mannheim', 'karlsruhe', 'road', 'regional', ['DE'], 3, 3],
      ['mainz', 'wiesbaden', 'road', 'regional', ['DE'], 3, 2],
      ['bonn', 'cologne', 'road', 'regional', ['DE'], 3, 3],
      ['mainz', 'frankfurt', 'river', 'regional', ['DE'], 3, 4],
      ['cologne', 'bonn', 'river', 'regional', ['DE'], 3, 3],

      // International from Germany
      ['berlin', 'amsterdam', 'rail', 'europe', ['DE', 'NL'], 1, 4],
      ['berlin', 'copenhagen', 'rail', 'europe', ['DE', 'DK'], 1, 4],
      ['berlin', 'stockholm', 'rail', 'europe', ['DE', 'SE'], 1, 3],
      ['berlin', 'kyiv', 'rail', 'europe', ['DE', 'UA'], 1, 3],
      ['frankfurt', 'zurich', 'air', 'europe', ['DE', 'CH'], 1, 4],
      ['frankfurt', 'brussels', 'rail', 'europe', ['DE', 'BE'], 1, 4],
      ['frankfurt', 'vienna', 'rail', 'europe', ['DE', 'AT'], 1, 4],
      ['hamburg', 'antwerp', 'sea', 'europe', ['DE', 'BE'], 1, 4],
      ['hamburg', 'stockholm', 'sea', 'europe', ['DE', 'SE'], 2, 3],
      ['munich', 'prague', 'rail', 'europe', ['DE', 'CZ'], 2, 4],
      ['cologne', 'amsterdam', 'road', 'europe', ['DE', 'NL'], 2, 4],
      ['cologne', 'paris', 'rail', 'europe', ['DE', 'FR'], 2, 4],
      ['duesseldorf', 'rotterdam', 'road', 'europe', ['DE', 'NL'], 2, 4],
      ['duesseldorf', 'antwerp', 'road', 'europe', ['DE', 'BE'], 2, 3],
      ['duisburg', 'rotterdam', 'sea', 'europe', ['DE', 'NL'], 1, 5],
    ],
    'de',
  ),
];
