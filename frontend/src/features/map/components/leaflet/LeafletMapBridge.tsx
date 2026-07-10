import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import { EUROPE_BOUNDS, EUROPE_DEFAULT_ZOOM } from '../../config/leafletConfig';
import { getBundeslandById } from '../../data/germany/bundeslandData';
import { getMapCityById } from '../../data/mapData';
import { flyToCity } from '../../engine/ViewportManager';
import { hasActiveCityFocus } from '../../utils/mapCityNavigation';
import {
  logMapNavigation,
} from '../../utils/mapNavigationDiagnostics';
import {
  captureMapCamera,
  COUNTRY_FOCUS_TRANSITION_S,
  flyToFullEuropeOverview,
  restoreMapCamera,
  type MapCameraSnapshot,
} from '../../utils/mapCameraSnapshot';
import { stopAllParticleAnimation } from '../../routes/RouteVehicles';
import {
  isMapAlive,
  purgeOrphanedRouteDom,
  releaseRouteCanvasRenderer,
} from '../../utils/mapLayerLifecycle';
import { mapSessionStore, useMapSessionSelector } from '../../store/mapSessionStore';
import {
  mapMobileInteractionStore,
} from '../../store/mapMobileInteractionStore';
import { isMobileViewport } from '../../utils/cityVisibilityUtils';
import type { MapCityRecord } from '../../types/mapTypes';

const MOBILE_INTERACTION_CLASS = 'ebh-map-mobile-interacting';

export function MapDestroyCleanup() {
  const map = useMap();

  useEffect(() => {
    return () => {
      stopAllParticleAnimation();
      if (isMapAlive(map)) {
        releaseRouteCanvasRenderer(map);
        purgeOrphanedRouteDom(map);
      }
    };
  }, [map]);

  return null;
}

export function MapInstanceCapture({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export function LeafletFitEurope({ active }: { active: boolean }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (!active || didFit.current) return;
    if (hasActiveCityFocus()) {
      logMapNavigation('skipped-europe-fit', {
        reason: 'selectedCityId exists',
      });
      return;
    }
    didFit.current = true;
    logMapNavigation('europe-fit', { zoom: EUROPE_DEFAULT_ZOOM });
    map.fitBounds(EUROPE_BOUNDS, { padding: [24, 24], maxZoom: EUROPE_DEFAULT_ZOOM });
  }, [map, active]);

  return null;
}

/** Smooth zoom to country / Bundesland bounds; restores pre-focus camera on exit */
export function LeafletCountryFocus({
  countryCode,
  cities,
  bundeslandId,
}: {
  countryCode?: string;
  cities: MapCityRecord[];
  bundeslandId?: string;
}) {
  const map = useMap();
  const prevCountryRef = useRef<string | undefined>(undefined);
  const prevBundeslandRef = useRef<string | undefined>(undefined);
  const europeCameraRef = useRef<MapCameraSnapshot | null>(null);

  useEffect(() => {
    const prevCountry = prevCountryRef.current;
    const prevBundesland = prevBundeslandRef.current;
    const flyDuration = COUNTRY_FOCUS_TRANSITION_S;

    if (prevCountry && !countryCode) {
      if (hasActiveCityFocus()) {
        logMapNavigation('skipped-country-exit', {
          country: prevCountry,
          reason: 'selectedCityId exists',
        });
        prevCountryRef.current = undefined;
        prevBundeslandRef.current = undefined;
        europeCameraRef.current = null;
        return;
      }

      map.stop();
      if (mapSessionStore.consumeHomeFullEuropeOverview()) {
        logMapNavigation('europe-home', { reason: 'country-exit-home-flag' });
        flyToFullEuropeOverview(map);
        europeCameraRef.current = null;
      } else if (europeCameraRef.current) {
        logMapNavigation('country-exit-restore', {
          country: prevCountry,
          center: europeCameraRef.current.center,
          zoom: europeCameraRef.current.zoom,
        });
        restoreMapCamera(map, europeCameraRef.current);
        europeCameraRef.current = null;
      }
      prevCountryRef.current = undefined;
      prevBundeslandRef.current = undefined;
      return;
    }

    if (bundeslandId && countryCode && bundeslandId !== prevBundesland) {
      if (hasActiveCityFocus()) {
        logMapNavigation('skipped-country-fit', {
          country: countryCode,
          reason: 'selectedCityId exists-bundesland',
        });
        prevBundeslandRef.current = bundeslandId;
        prevCountryRef.current = countryCode;
        return;
      }

      const bl = getBundeslandById(bundeslandId);
      if (bl) {
        const bounds = L.latLngBounds(bl.ring.map(([lat, lng]) => [lat, lng] as [number, number]));
        logMapNavigation('bundesland-fit', { country: countryCode, zoom: 10 });
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 10, duration: flyDuration });
      }
      prevBundeslandRef.current = bundeslandId;
      prevCountryRef.current = countryCode;
      return;
    }

    if (countryCode && countryCode !== prevCountry) {
      if (hasActiveCityFocus()) {
        logMapNavigation('skipped-country-fit', {
          country: countryCode,
          reason: 'selectedCityId exists',
        });
        prevCountryRef.current = countryCode;
        prevBundeslandRef.current = bundeslandId;
        return;
      }

      if (!prevCountry) {
        europeCameraRef.current = captureMapCamera(map);
      }

      const countryCities = cities.filter((c) => c.countryCode === countryCode);
      if (countryCities.length > 0) {
        const bounds = L.latLngBounds(countryCities.map((c) => [c.lat, c.lng] as [number, number]));
        const maxZoom = countryCode === 'DE' ? 7 : 7.5;
        logMapNavigation('country-fit', { country: countryCode, zoom: maxZoom });
        map.flyToBounds(bounds, { padding: [48, 48], maxZoom, duration: flyDuration });
      }

      prevCountryRef.current = countryCode;
      prevBundeslandRef.current = bundeslandId;
    }
  }, [map, countryCode, cities, bundeslandId]);

  return null;
}

export function MapCameraSync() {
  const map = useMap();

  useEffect(() => {
    const sync = () => {
      if (!isMapAlive(map)) return;
      mapSessionStore.setCamera(captureMapCamera(map));
    };

    sync();
    map.on('moveend', sync);
    map.on('zoomend', sync);

    return () => {
      if (!isMapAlive(map)) return;
      map.off('moveend', sync);
      map.off('zoomend', sync);
    };
  }, [map]);

  return null;
}

/** Restore saved map view after leaving workspace — snapshot or Europe overview fallback */
export function LeafletWorkspaceReturnRestore() {
  const map = useMap();
  const pendingReturnRestore = useMapSessionSelector((s) => s.pendingReturnRestore);
  const returnRestoreMode = useMapSessionSelector((s) => s.returnRestoreMode);
  const camera = useMapSessionSelector((s) => s.camera);

  useEffect(() => {
    if (!pendingReturnRestore || !returnRestoreMode || !isMapAlive(map)) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!isMapAlive(map)) return;
        map.invalidateSize({ animate: false });

        const mode = mapSessionStore.consumePendingReturnRestore();
        if (!mode) return;

        map.stop();
        if (mode === 'snapshot' && camera) {
          logMapNavigation('workspace-restore', {
            center: camera.center,
            zoom: camera.zoom,
          });
          restoreMapCamera(map, camera);
          return;
        }
        if (mode === 'fallback' && mapSessionStore.consumeHomeFullEuropeOverview()) {
          flyToFullEuropeOverview(map);
        }
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [map, pendingReturnRestore, returnRestoreMode, camera]);

  return null;
}

/**
 * Mobile-only: temporarily reduce heavy map effects while panning/zooming.
 * Restores full visuals 300ms after dragend/zoomend.
 */
export function MapMobileInteractionBridge() {
  const map = useMap();
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isMapAlive(map)) return;

    const container = map.getContainer();

    const setInteracting = (interacting: boolean) => {
      mapMobileInteractionStore.setInteracting(interacting);
      container.classList.toggle(MOBILE_INTERACTION_CLASS, interacting);
    };

    const beginInteraction = () => {
      if (!isMobileViewport()) return;
      if (restoreTimerRef.current) {
        clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
      setInteracting(true);
    };

    const scheduleRestore = () => {
      if (!isMobileViewport()) return;
      if (restoreTimerRef.current) {
        clearTimeout(restoreTimerRef.current);
      }
      restoreTimerRef.current = setTimeout(() => {
        setInteracting(false);
        restoreTimerRef.current = null;
      }, mapMobileInteractionStore.restoreDelayMs);
    };

    const onResize = () => {
      if (!isMobileViewport()) {
        if (restoreTimerRef.current) {
          clearTimeout(restoreTimerRef.current);
          restoreTimerRef.current = null;
        }
        setInteracting(false);
      }
    };

    map.on('dragstart', beginInteraction);
    map.on('zoomstart', beginInteraction);
    map.on('moveend', scheduleRestore);
    map.on('zoomend', scheduleRestore);
    window.addEventListener('resize', onResize);

    return () => {
      if (restoreTimerRef.current) {
        clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
      setInteracting(false);
      if (!isMapAlive(map)) return;
      map.off('dragstart', beginInteraction);
      map.off('zoomstart', beginInteraction);
      map.off('moveend', scheduleRestore);
      map.off('zoomend', scheduleRestore);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  return null;
}

/** Fly to a searched or focused city — authoritative city-level zoom for every layer */
export function LeafletCityFocus({
  cityId,
  cityMap,
  countryCode,
}: {
  cityId?: string;
  cityMap: Map<string, MapCityRecord>;
  countryCode?: string;
}) {
  const map = useMap();
  const prevId = useRef('');

  useEffect(() => {
    if (!cityId) {
      if (prevId.current && isMapAlive(map)) {
        map.stop();
        if (mapSessionStore.consumeHomeFullEuropeOverview()) {
          logMapNavigation('europe-home', { reason: 'city-focus-cleared' });
          flyToFullEuropeOverview(map);
        }
      }
      prevId.current = '';
      return;
    }
    if (cityId === prevId.current) return;

    const city = cityMap.get(cityId) ?? getMapCityById(cityId) ?? null;
    if (!city) return;
    if (countryCode && city.countryCode !== countryCode) return;

    prevId.current = cityId;
    map.stop();
    flyToCity(map, city.lat, city.lng, city);
  }, [map, cityId, cityMap, countryCode]);

  return null;
}
