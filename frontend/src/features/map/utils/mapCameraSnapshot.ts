import type { Map as LeafletMap } from 'leaflet';
import {
  EUROPE_BOUNDS,
  EUROPE_DEFAULT_ZOOM,
} from '../config/leafletConfig';
import { logMapNavigation } from './mapNavigationDiagnostics';

export interface MapCameraSnapshot {
  center: { lat: number; lng: number };
  zoom: number;
}

/** Country focus enter/exit transition — 400–600 ms */
export const COUNTRY_FOCUS_TRANSITION_S = 0.5;

/** Home (⌂) — always fit full Europe bounds */
export const EUROPE_OVERVIEW_FIT_PADDING: [number, number] = [40, 40];
export const EUROPE_OVERVIEW_FIT_DURATION = 0.6;

export function captureMapCamera(map: LeafletMap): MapCameraSnapshot {
  const center = map.getCenter();
  return {
    center: { lat: center.lat, lng: center.lng },
    zoom: map.getZoom(),
  };
}

export function restoreMapCamera(map: LeafletMap, snapshot: MapCameraSnapshot): void {
  map.flyTo([snapshot.center.lat, snapshot.center.lng], snapshot.zoom, {
    duration: COUNTRY_FOCUS_TRANSITION_S,
  });
}

/** Fixed full-Europe overview — used by Home (⌂), never saved-camera restore */
export function flyToFullEuropeOverview(map: LeafletMap): void {
  logMapNavigation('europe-home', {});
  map.fitBounds(EUROPE_BOUNDS, {
    padding: EUROPE_OVERVIEW_FIT_PADDING,
    maxZoom: EUROPE_DEFAULT_ZOOM,
    animate: true,
    duration: EUROPE_OVERVIEW_FIT_DURATION,
  });
}
