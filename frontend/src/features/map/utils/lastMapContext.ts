import type { Map as LeafletMap } from 'leaflet';
import type { MapLayerState } from '../types/mapTypes';
import type { MapCityRecord } from '../types/mapTypes';
import type { MapReturnSnapshot } from '../store/mapSessionStore';
import { captureMapCamera } from './mapCameraSnapshot';
import { EUROPE_DEFAULT_ZOOM } from '../config/leafletConfig';

export const LAST_MAP_CONTEXT_KEY = 'eurobusinesshub:lastMapContext';

export interface StoredLastMapContext {
  selectedCityId: string | null;
  selectedCitySlug: string;
  selectedCountry: string | undefined;
  center: { lat: number; lng: number };
  zoom: number;
  selectedCountryCode: string | undefined;
  infoCardCityId: string | null;
  infoCardCountryCode: string | null;
  selectedRouteId: string | null;
  selectedBundeslandId: string | undefined;
  focusCityId: string | undefined;
  layers: MapLayerState;
}

export interface LastMapContextSessionSlice {
  selectedCityId: string | null;
  infoCardCityId: string | null;
  infoCardCountryCode: string | null;
  selectedRouteId: string | null;
  selectedBundeslandId: string | undefined;
  focusCityId: string | undefined;
  selectedCountryCode: string | undefined;
  layers: MapLayerState;
  camera: { center: { lat: number; lng: number }; zoom: number } | null;
}

function cloneLayers(layers: MapLayerState): MapLayerState {
  return { ...layers };
}

/** Persist map context immediately before workspace navigation (incl. live Leaflet camera). */
export function saveLastMapContext(
  city: MapCityRecord,
  session: LastMapContextSessionSlice,
  liveMap?: LeafletMap | null,
): StoredLastMapContext {
  const liveCamera = liveMap ? captureMapCamera(liveMap) : null;
  const camera = liveCamera ?? session.camera;

  const context: StoredLastMapContext = {
    selectedCityId: session.selectedCityId ?? city.id,
    selectedCitySlug: city.id,
    selectedCountry: city.countryCode,
    center: camera?.center ?? { lat: city.lat, lng: city.lng },
    zoom: camera?.zoom ?? EUROPE_DEFAULT_ZOOM,
    selectedCountryCode: session.selectedCountryCode,
    infoCardCityId: session.infoCardCityId ?? city.id,
    infoCardCountryCode: session.infoCardCountryCode,
    selectedRouteId: session.selectedRouteId,
    selectedBundeslandId: session.selectedBundeslandId,
    focusCityId: session.focusCityId,
    layers: cloneLayers(session.layers),
  };

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(LAST_MAP_CONTEXT_KEY, JSON.stringify(context));
    } catch {
      // sessionStorage unavailable — in-memory snapshot remains the fallback
    }
  }

  return context;
}

export function loadLastMapContext(): StoredLastMapContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(LAST_MAP_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLastMapContext;
  } catch {
    return null;
  }
}

export function storedContextToReturnSnapshot(
  context: StoredLastMapContext,
): MapReturnSnapshot {
  return {
    selectedCountryCode: context.selectedCountryCode,
    selectedCityId: context.selectedCityId,
    infoCardCityId: context.infoCardCityId,
    infoCardCountryCode: context.infoCardCountryCode,
    selectedRouteId: context.selectedRouteId,
    selectedBundeslandId: context.selectedBundeslandId,
    focusCityId: context.focusCityId,
    layers: cloneLayers(context.layers),
    camera: {
      center: { lat: context.center.lat, lng: context.center.lng },
      zoom: context.zoom,
    },
  };
}

export function loadReturnSnapshotFromStorage(): MapReturnSnapshot | null {
  const stored = loadLastMapContext();
  return stored ? storedContextToReturnSnapshot(stored) : null;
}

function mergeReturnSnapshots(
  primary: MapReturnSnapshot,
  secondary: MapReturnSnapshot | null,
): MapReturnSnapshot {
  if (!secondary) return primary;
  return {
    selectedCountryCode: primary.selectedCountryCode ?? secondary.selectedCountryCode,
    selectedCityId: primary.selectedCityId ?? secondary.selectedCityId,
    infoCardCityId: primary.infoCardCityId ?? secondary.infoCardCityId,
    infoCardCountryCode: primary.infoCardCountryCode ?? secondary.infoCardCountryCode,
    selectedRouteId: primary.selectedRouteId ?? secondary.selectedRouteId,
    selectedBundeslandId: primary.selectedBundeslandId ?? secondary.selectedBundeslandId,
    focusCityId: primary.focusCityId ?? secondary.focusCityId,
    layers: primary.layers,
    camera: primary.camera ?? secondary.camera,
  };
}

export function resolveReturnSnapshot(memorySnapshot: MapReturnSnapshot): MapReturnSnapshot {
  const stored = loadReturnSnapshotFromStorage();
  return mergeReturnSnapshots(memorySnapshot, stored);
}

export function resolveExitReturnSnapshot(
  memorySnapshot: MapReturnSnapshot | null,
): MapReturnSnapshot | null {
  if (memorySnapshot) {
    return resolveReturnSnapshot(memorySnapshot);
  }
  return loadReturnSnapshotFromStorage();
}
