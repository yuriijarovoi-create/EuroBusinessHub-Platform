import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';

/** CartoDB Dark Matter — enterprise dark basemap */
export const DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

/** CartoDB Positron — premium light basemap */
export const LIGHT_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export function getTileUrlForTheme(theme: 'light' | 'dark'): string {
  return theme === 'light' ? LIGHT_TILE_URL : DARK_TILE_URL;
}

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const EUROPE_CENTER: LatLngExpression = [54.0, 15.0];

export const EUROPE_DEFAULT_ZOOM = 4;

export const EUROPE_MIN_ZOOM = 3;

export const EUROPE_MAX_ZOOM = 14;

/** Finer wheel / pinch steps for regional & village zoom */
export const MAP_ZOOM_SNAP = 0.25;
export const MAP_ZOOM_DELTA = 0.5;
export const MAP_WHEEL_PX_PER_ZOOM = 90;

/** Bounds: [southWest, northEast] — includes Ukraine, Turkey (Istanbul), Iceland */
export const EUROPE_BOUNDS: LatLngBoundsExpression = [
  [34.0, -25.0],
  [72.0, 45.0],
];

export const ROUTE_COLORS = {
  road: '#38bdf8',
  rail: '#34d399',
  air: '#7dd3fc',
  sea: '#60a5fa',
  river: '#22d3ee',
} as const;

export const ROUTE_DASH = {
  road: '8 6',
  rail: '4 8',
  air: '2 6',
  sea: '10 8',
  river: '6 4',
} as const;

/** Germany-focused map bounds */
export const GERMANY_BOUNDS: LatLngBoundsExpression = [
  [47.2, 5.8],
  [55.1, 15.1],
];
