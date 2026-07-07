import { useSyncExternalStore } from 'react';
import { DEFAULT_LAYER_STATE, type MapLayerState } from '../types/mapTypes';
import type { MapCameraSnapshot } from '../utils/mapCameraSnapshot';
import { resolveExitReturnSnapshot, resolveReturnSnapshot } from '../utils/lastMapContext';

export type MapSessionViewMode = 'map' | 'workspace';

/** Map context captured when entering workspace — restored on "Zurück zur Europakarte" */
export interface MapReturnSnapshot {
  selectedCountryCode: string | undefined;
  selectedCityId: string | null;
  infoCardCityId: string | null;
  infoCardCountryCode: string | null;
  selectedRouteId: string | null;
  selectedBundeslandId: string | undefined;
  focusCityId: string | undefined;
  layers: MapLayerState;
  camera: MapCameraSnapshot | null;
}

export type MapReturnRestoreMode = 'snapshot' | 'fallback';

export interface MapSessionState {
  viewMode: MapSessionViewMode;
  workspaceCityId: string | null;
  camera: MapCameraSnapshot | null;
  selectedCountryCode: string | undefined;
  selectedCityId: string | null;
  infoCardCityId: string | null;
  infoCardCountryCode: string | null;
  selectedRouteId: string | null;
  selectedBundeslandId: string | undefined;
  layers: MapLayerState;
  focusCityId: string | undefined;
  theme: string | null;
  /** Home (⌂) requests full EUROPE_BOUNDS fit instead of saved-camera restore */
  homeFullEuropeOverview: boolean;
  /** Saved when entering workspace; consumed on exit */
  returnSnapshot: MapReturnSnapshot | null;
  /** One-shot flag for map + shell to apply return navigation */
  pendingReturnRestore: boolean;
  returnRestoreMode: MapReturnRestoreMode | null;
}

function createInitialMapSessionState(): MapSessionState {
  return {
    viewMode: 'map',
    workspaceCityId: null,
    camera: null,
    selectedCountryCode: undefined,
    selectedCityId: null,
    infoCardCityId: null,
    infoCardCountryCode: null,
    selectedRouteId: null,
    selectedBundeslandId: undefined,
    layers: { ...DEFAULT_LAYER_STATE },
    focusCityId: undefined,
    theme: null,
    homeFullEuropeOverview: false,
    returnSnapshot: null,
    pendingReturnRestore: false,
    returnRestoreMode: null,
  };
}

function cloneCamera(camera: MapCameraSnapshot | null): MapCameraSnapshot | null {
  if (!camera) return null;
  return {
    center: { lat: camera.center.lat, lng: camera.center.lng },
    zoom: camera.zoom,
  };
}

function captureReturnSnapshot(session: MapSessionState): MapReturnSnapshot {
  return {
    selectedCountryCode: session.selectedCountryCode,
    selectedCityId: session.selectedCityId,
    infoCardCityId: session.infoCardCityId,
    infoCardCountryCode: session.infoCardCountryCode,
    selectedRouteId: session.selectedRouteId,
    selectedBundeslandId: session.selectedBundeslandId,
    focusCityId: session.focusCityId,
    layers: { ...session.layers },
    camera: cloneCamera(session.camera),
  };
}

let state: MapSessionState = createInitialMapSessionState();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const mapSessionStore = {
  getState(): MapSessionState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  patch(partial: Partial<MapSessionState>): void {
    state = { ...state, ...partial };
    emit();
  },

  setCamera(camera: MapCameraSnapshot): void {
    if (
      state.camera?.center.lat === camera.center.lat &&
      state.camera?.center.lng === camera.center.lng &&
      state.camera?.zoom === camera.zoom
    ) {
      return;
    }
    state = { ...state, camera };
    emit();
  },

  enterWorkspace(cityId: string): void {
    const theme =
      typeof document !== 'undefined'
        ? document.documentElement.getAttribute('data-theme')
        : state.theme;
    const returnSnapshot = resolveReturnSnapshot(captureReturnSnapshot(state));
    state = {
      ...state,
      returnSnapshot,
      viewMode: 'workspace',
      workspaceCityId: cityId,
      selectedCityId: cityId,
      infoCardCityId: cityId,
      theme,
      pendingReturnRestore: false,
      returnRestoreMode: null,
    };
    emit();
  },

  exitWorkspace(): void {
    const snapshot = resolveExitReturnSnapshot(state.returnSnapshot);
    if (snapshot) {
      state = {
        ...state,
        viewMode: 'map',
        workspaceCityId: null,
        returnSnapshot: null,
        pendingReturnRestore: true,
        returnRestoreMode: 'snapshot',
        selectedCountryCode: snapshot.selectedCountryCode,
        selectedCityId: snapshot.selectedCityId,
        infoCardCityId: snapshot.infoCardCityId,
        infoCardCountryCode: snapshot.infoCardCountryCode,
        selectedRouteId: snapshot.selectedRouteId,
        selectedBundeslandId: snapshot.selectedBundeslandId,
        focusCityId: snapshot.focusCityId,
        layers: { ...snapshot.layers },
        camera: cloneCamera(snapshot.camera),
      };
    } else {
      state = {
        ...state,
        viewMode: 'map',
        workspaceCityId: null,
        returnSnapshot: null,
        pendingReturnRestore: true,
        returnRestoreMode: 'fallback',
        selectedCountryCode: undefined,
        selectedCityId: null,
        infoCardCityId: null,
        infoCardCountryCode: null,
        selectedRouteId: null,
        selectedBundeslandId: undefined,
        focusCityId: undefined,
        homeFullEuropeOverview: true,
      };
    }
    emit();
  },

  consumePendingReturnRestore(): MapReturnRestoreMode | null {
    if (!state.pendingReturnRestore) return null;
    const mode = state.returnRestoreMode;
    state = { ...state, pendingReturnRestore: false, returnRestoreMode: null };
    emit();
    return mode;
  },

  reset(): void {
    state = createInitialMapSessionState();
    emit();
  },

  requestHomeFullEuropeOverview(): void {
    state = { ...state, homeFullEuropeOverview: true };
    emit();
  },

  consumeHomeFullEuropeOverview(): boolean {
    if (!state.homeFullEuropeOverview) return false;
    state = { ...state, homeFullEuropeOverview: false };
    emit();
    return true;
  },
};

export function useMapSessionStore(): MapSessionState {
  return useSyncExternalStore(
    mapSessionStore.subscribe,
    mapSessionStore.getState,
    mapSessionStore.getState,
  );
}

export function useMapSessionSelector<T>(selector: (session: MapSessionState) => T): T {
  return useSyncExternalStore(
    mapSessionStore.subscribe,
    () => selector(mapSessionStore.getState()),
    () => selector(mapSessionStore.getState()),
  );
}
