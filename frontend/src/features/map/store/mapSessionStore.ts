import { useSyncExternalStore } from 'react';
import { DEFAULT_LAYER_STATE, type MapLayerState } from '../types/mapTypes';
import type { MapCameraSnapshot } from '../utils/mapCameraSnapshot';

export type MapSessionViewMode = 'map' | 'workspace';

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
    state = {
      ...state,
      viewMode: 'workspace',
      workspaceCityId: cityId,
      selectedCityId: cityId,
      infoCardCityId: cityId,
      theme,
    };
    emit();
  },

  exitWorkspace(): void {
    state = { ...state, viewMode: 'map', workspaceCityId: null };
    emit();
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
