import type { Map as LeafletMap } from 'leaflet';
import { EUROPE_MAX_ZOOM, EUROPE_MIN_ZOOM } from '../config/leafletConfig';

export type MapNavigationSource =
  | 'city-focus'
  | 'city-search'
  | 'country-fit'
  | 'country-exit-restore'
  | 'bundesland-fit'
  | 'europe-fit'
  | 'europe-home'
  | 'workspace-restore'
  | 'camera-restore'
  | 'skipped-country-fit'
  | 'skipped-country-exit'
  | 'skipped-europe-fit';

let navigationSequence = 0;

/** Development-only navigation trace — silent in production builds. */
export function logMapNavigation(
  source: MapNavigationSource,
  detail: {
    city?: string;
    country?: string;
    center?: { lat: number; lng: number };
    zoom?: number;
    reason?: string;
  },
): void {
  if (!import.meta.env.DEV) return;
  navigationSequence += 1;
  const parts = [
    `[MapNavigation ${navigationSequence}]`,
    `source=${source}`,
    detail.city ? `city=${detail.city}` : '',
    detail.country ? `country=${detail.country}` : '',
    detail.center ? `center=${detail.center.lat.toFixed(4)},${detail.center.lng.toFixed(4)}` : '',
    detail.zoom != null ? `zoom=${detail.zoom}` : '',
    detail.reason ? `reason=${detail.reason}` : '',
  ].filter(Boolean);
  // eslint-disable-next-line no-console
  console.info(parts.join(' '));
}

/** Resolve zoom from map container width — mobile / tablet / desktop breakpoints. */
export function getCityFocusZoomForMap(map: LeafletMap): number {
  const containerWidth = map.getContainer()?.clientWidth ?? 0;
  const width =
    containerWidth > 0
      ? containerWidth
      : typeof window !== 'undefined'
        ? window.innerWidth
        : 1200;
  let zoom: number;
  if (width < 768) zoom = 12;
  else if (width < 1200) zoom = 11;
  else zoom = 10;

  return Math.min(EUROPE_MAX_ZOOM, Math.max(EUROPE_MIN_ZOOM, zoom));
}

export function flyMapToCityFocus(
  map: LeafletMap,
  lat: number,
  lng: number,
  source: MapNavigationSource,
  cityLabel?: string,
): void {
  const zoom = getCityFocusZoomForMap(map);
  logMapNavigation(source, {
    city: cityLabel,
    center: { lat, lng },
    zoom,
  });
  map.flyTo([lat, lng], zoom, { duration: 1.1 });
}
