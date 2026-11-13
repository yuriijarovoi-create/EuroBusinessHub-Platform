import type { LatLngBoundsExpression } from 'leaflet';

/**
 * CARTO Dark Matter / Positron raster tiles now require an API key.
 * Unkeyed requests still return HTTP 200 PNGs with an "API KEY REQUIRED" watermark.
 * Default basemap is Esri World Gray Canvas (no private key). If
 * VITE_CARTO_BASEMAP_KEY is set at build time, CARTO is used instead.
 */

const CARTO_KEY = (import.meta.env.VITE_CARTO_BASEMAP_KEY ?? '').trim();

export const CARTO_DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export const CARTO_LIGHT_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

/** Esri World Dark Gray Canvas — XYZ path uses {z}/{y}/{x} */
export const ESRI_DARK_BASE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const ESRI_DARK_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

export const ESRI_LIGHT_BASE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const ESRI_LIGHT_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

export const DARK_TILE_URL = CARTO_KEY ? CARTO_DARK_TILE_URL : ESRI_DARK_BASE_URL;

export const LIGHT_TILE_URL = CARTO_KEY ? CARTO_LIGHT_TILE_URL : ESRI_LIGHT_BASE_URL;

export function getTileUrlForTheme(theme: 'light' | 'dark'): string {
  return theme === 'light' ? LIGHT_TILE_URL : DARK_TILE_URL;
}

export const CARTO_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const ESRI_TILE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, and the GIS User Community';

export const TILE_ATTRIBUTION = CARTO_KEY ? CARTO_TILE_ATTRIBUTION : ESRI_TILE_ATTRIBUTION;

export interface BasemapLayerSpec {
  id: string;
  url: string;
  attribution?: string;
}

function withCartoKey(url: string): string {
  return `${url}?key=${encodeURIComponent(CARTO_KEY)}`;
}

export function getBasemapLayersForTheme(theme: 'light' | 'dark'): BasemapLayerSpec[] {
  if (CARTO_KEY) {
    const url = withCartoKey(theme === 'light' ? CARTO_LIGHT_TILE_URL : CARTO_DARK_TILE_URL);
    return [{ id: `carto-${theme}`, url, attribution: CARTO_TILE_ATTRIBUTION }];
  }

  if (theme === 'light') {
    return [
      { id: 'esri-light-base', url: ESRI_LIGHT_BASE_URL, attribution: ESRI_TILE_ATTRIBUTION },
      { id: 'esri-light-labels', url: ESRI_LIGHT_LABELS_URL },
    ];
  }

  return [
    { id: 'esri-dark-base', url: ESRI_DARK_BASE_URL, attribution: ESRI_TILE_ATTRIBUTION },
    { id: 'esri-dark-labels', url: ESRI_DARK_LABELS_URL },
  ];
}

export const EUROPE_CENTER: [number, number] = [54.0, 15.0];

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
  road: '#2a9fc9',
  rail: '#5b7f9d',
  air: '#b8cfe8',
  sea: '#3d9eae',
  river: '#3aada8',
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
