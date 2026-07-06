import { buildRouteBatch } from './routeBuilder';

/** Premium reference corridors — strategic arcs from the logistics command-center map */
export const PREMIUM_REFERENCE_CORRIDORS = buildRouteBatch(
  [
    ['rotterdam', 'munich', 'rail', 'europe', ['NL', 'DE'], 1, 5],
    ['frankfurt', 'zurich', 'rail', 'europe', ['DE', 'CH'], 1, 5],
  ],
  'ref',
);
