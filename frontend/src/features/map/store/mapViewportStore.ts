import { useSyncExternalStore } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { isMobileViewport } from '../utils/cityVisibilityUtils';
import {
  boundsSnapshotsEqual,
  readPaddedBoundsSnapshot,
  type MapViewportBoundsSnapshot,
} from '../utils/viewportBoundsUtils';

export type { MapViewportBoundsSnapshot };
export { SETTLEMENT_VIEWPORT_BOUNDS_PAD, readPaddedBoundsSnapshot, isLatLngInBoundsSnapshot } from '../utils/viewportBoundsUtils';

export interface MapViewportCenter {
  lat: number;
  lng: number;
}

export interface MapViewportState {
  zoom: number;
  center: MapViewportCenter;
  /** Padded bounds used for settlement marker viewport filtering. */
  bounds: MapViewportBoundsSnapshot | null;
  isMobile: boolean;
  /** True after the first sync from a live Leaflet map instance. */
  ready: boolean;
}

const initialState: MapViewportState = {
  zoom: 3,
  center: { lat: 50, lng: 10 },
  bounds: null,
  isMobile: false,
  ready: false,
};

let state: MapViewportState = initialState;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function centerEqual(a: MapViewportCenter, b: MapViewportCenter): boolean {
  return a.lat === b.lat && a.lng === b.lng;
}

export const mapViewportStore = {
  getState(): MapViewportState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Full viewport sync — mount, moveend, zoomend, post-interaction, resize. */
  syncFromMap(map: LeafletMap, options?: { updateBounds?: boolean }): void {
    const updateBounds = options?.updateBounds !== false;
    const center = map.getCenter();
    const nextCenter = { lat: center.lat, lng: center.lng };
    const nextZoom = map.getZoom();
    const nextMobile = isMobileViewport();
    const nextBounds = updateBounds
      ? readPaddedBoundsSnapshot(map)
      : state.bounds;

    if (
      state.ready &&
      state.zoom === nextZoom &&
      centerEqual(state.center, nextCenter) &&
      state.isMobile === nextMobile &&
      ((nextBounds === null && state.bounds === null) ||
        (nextBounds !== null &&
          state.bounds !== null &&
          boundsSnapshotsEqual(state.bounds, nextBounds)))
    ) {
      return;
    }

    state = {
      zoom: nextZoom,
      center: nextCenter,
      bounds: nextBounds,
      isMobile: nextMobile,
      ready: true,
    };
    emit();
  },

  /** Live zoom only — does not refresh padded bounds (avoids drag/zoom-frame churn). */
  syncZoomFromMap(map: LeafletMap): void {
    const nextZoom = map.getZoom();
    if (state.ready && state.zoom === nextZoom) return;
    state = {
      ...state,
      zoom: nextZoom,
      ready: true,
    };
    emit();
  },

  syncMobileBreakpoint(): void {
    const nextMobile = isMobileViewport();
    if (state.isMobile === nextMobile) return;
    state = { ...state, isMobile: nextMobile };
    emit();
  },

  reset(): void {
    state = initialState;
    emit();
  },
};

export function useMapViewportStore(): MapViewportState {
  return useSyncExternalStore(
    mapViewportStore.subscribe,
    mapViewportStore.getState,
    mapViewportStore.getState,
  );
}

export function useMapViewportSelector<T>(selector: (value: MapViewportState) => T): T {
  return useSyncExternalStore(
    mapViewportStore.subscribe,
    () => selector(mapViewportStore.getState()),
    () => selector(mapViewportStore.getState()),
  );
}
