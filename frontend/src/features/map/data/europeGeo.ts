/** SVG geography — georeferenced Europe silhouette (viewBox 0 0 100 70) */

import { coordsToSvgPath, latLngToMapXY } from '../utils/projection';

export const MAP_VIEWBOX = { width: 100, height: 70 } as const;

/** Continental Europe + Scandinavia + Mediterranean — clockwise from Portugal */
const MAINLAND_COORDS: [number, number][] = [
  [37.02, -9.50], [36.85, -7.20], [36.00, -5.35], [36.50, -2.50], [37.97, -0.68],
  [39.47, 0.38], [41.35, 2.17], [42.60, 3.05], [43.30, 4.00], [43.90, 7.50],
  [44.10, 8.80], [45.46, 9.19], [44.50, 11.00], [43.80, 12.50], [41.90, 12.50],
  [40.63, 17.85], [37.65, 15.50], [38.50, 16.50], [40.80, 18.80], [41.50, 20.50],
  [39.00, 22.00], [37.98, 23.73], [40.50, 25.50], [42.00, 28.00], [43.30, 28.30],
  [45.00, 30.50], [47.00, 32.00], [52.10, 32.50], [56.00, 30.00], [59.00, 28.00],
  [60.50, 25.00], [65.00, 26.00], [69.50, 28.00], [71.00, 24.00], [71.00, 16.00],
  [70.00, 10.00], [65.00, 7.00], [62.00, 5.00], [58.00, 6.00], [57.80, 8.00],
  [55.70, 12.60], [54.50, 11.00], [54.00, 14.00], [53.55, 9.99], [52.50, 4.00],
  [51.00, 2.50], [49.00, -1.50], [47.00, -2.50], [44.50, -1.50], [43.30, -1.70],
  [40.50, -8.50], [37.02, -9.50],
];

const UK_COORDS: [number, number][] = [
  [50.05, -5.80], [50.50, -4.00], [51.00, -2.00], [52.00, 1.00], [53.50, 0.50],
  [55.00, -1.50], [57.50, -2.00], [58.50, -3.50], [58.00, -5.00], [56.00, -5.50],
  [54.50, -5.00], [52.00, -5.50], [50.05, -5.80],
];

const IRELAND_COORDS: [number, number][] = [
  [51.50, -10.50], [52.50, -9.50], [54.00, -8.00], [55.50, -7.50], [55.00, -6.00],
  [52.50, -6.00], [51.50, -9.00], [51.50, -10.50],
];

const ICELAND_COORDS: [number, number][] = [
  [63.40, -24.50], [64.50, -22.00], [66.50, -18.00], [66.00, -14.00], [64.00, -14.50],
  [63.00, -18.00], [63.40, -24.50],
];

const SICILY_COORDS: [number, number][] = [
  [36.65, 14.50], [37.50, 15.50], [38.20, 15.00], [37.80, 13.50], [36.65, 14.50],
];

export const MAINLAND_EUROPE = coordsToSvgPath(MAINLAND_COORDS);
export const UNITED_KINGDOM = coordsToSvgPath(UK_COORDS);
export const IRELAND_ISLAND = coordsToSvgPath(IRELAND_COORDS);
export const ICELAND_ISLAND = coordsToSvgPath(ICELAND_COORDS);
export const SICILY = coordsToSvgPath(SICILY_COORDS);

/** Legacy exports — kept for backward compatibility */
export const EUROPE_OUTLINE = MAINLAND_EUROPE;
export const IBERIA_OUTLINE = '';
export const ITALY_OUTLINE = '';
export const SCANDINAVIA_OUTLINE = '';

export const GERMANY_REGION = coordsToSvgPath([
  [47.50, 6.00], [49.00, 6.50], [50.50, 7.50], [54.00, 9.00], [54.50, 12.00],
  [53.50, 14.50], [51.00, 14.50], [49.00, 13.00], [47.50, 10.50], [47.50, 6.00],
]);

export const DEFAULT_HUB_CITY_ID = 'berlin';

const hubCoords = latLngToMapXY(52.52, 13.405);

export const HUB = {
  id: DEFAULT_HUB_CITY_ID,
  x: hubCoords.mapX,
  y: hubCoords.mapY,
  label: 'Berlin Hub',
} as const;
