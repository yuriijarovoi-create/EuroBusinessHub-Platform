/** Ukraine special marker (Izium reconstruction hub) — visibility on Europe overview */

export const UKRAINE_FLAG_MARKER_CITY_ID = 'izium';
export const UKRAINE_COUNTRY_CODE = 'UA';
export const UKRAINE_MARKER_MIN_ZOOM = 6;

const UKRAINE_CENTER = { lat: 49.0, lng: 31.5 };
const NEAR_UKRAINE_RADIUS_DEG = 9;

const UKRAINE_CITY_IDS = new Set([
  'kyiv',
  'kharkiv',
  'lviv',
  'odesa',
  'dnipro',
  UKRAINE_FLAG_MARKER_CITY_ID,
]);

export interface UkraineMarkerVisibilityContext {
  zoom: number;
  mapCenterLat: number;
  mapCenterLng: number;
  selectedCountryCode?: string;
  selectedCityId?: string;
  hoveredCityId?: string | null;
  searchResultCityId?: string;
}

export function isUkraineCityId(cityId?: string | null): boolean {
  return !!cityId && UKRAINE_CITY_IDS.has(cityId);
}

export function isMapCenterNearUkraine(lat: number, lng: number): boolean {
  return (
    Math.hypot(lat - UKRAINE_CENTER.lat, lng - UKRAINE_CENTER.lng) <= NEAR_UKRAINE_RADIUS_DEG
  );
}

/** Controls the Izium flag-style marker and Ukraine strategic hub halos */
export function shouldShowUkraineFlagMarker(ctx: UkraineMarkerVisibilityContext): boolean {
  if (ctx.selectedCountryCode === UKRAINE_COUNTRY_CODE) return true;
  if (isUkraineCityId(ctx.selectedCityId)) return true;
  if (isUkraineCityId(ctx.hoveredCityId)) return true;
  if (isUkraineCityId(ctx.searchResultCityId)) return true;
  if (ctx.zoom < UKRAINE_MARKER_MIN_ZOOM) return false;
  return isMapCenterNearUkraine(ctx.mapCenterLat, ctx.mapCenterLng);
}

export function isUkraineStrategicHubId(hubId: string): boolean {
  return hubId === UKRAINE_FLAG_MARKER_CITY_ID || hubId === 'kyiv';
}
