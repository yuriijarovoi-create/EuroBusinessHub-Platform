import { useLayoutEffect } from 'react';
import { useMap } from 'react-leaflet';
import { isMobileViewport } from '../../utils/cityVisibilityUtils';
import { isMapAlive } from '../../utils/mapLayerLifecycle';
import { mapMobileInteractionStore } from '../../store/mapMobileInteractionStore';
import { mapViewportStore } from '../../store/mapViewportStore';

/**
 * Single shared Leaflet viewport subscription for the map tree.
 * Syncs zoom/center/padded bounds on mount, moveend, zoomend, and resize —
 * never on continuous `move`.
 */
export function LeafletMapViewportSync() {
  const map = useMap();

  useLayoutEffect(() => {
    if (!isMapAlive(map)) return;

    const syncFull = () => {
      if (!isMapAlive(map)) return;
      mapViewportStore.syncFromMap(map, { updateBounds: true });
    };

    const syncZoomIfAllowed = () => {
      if (!isMapAlive(map)) return;
      if (isMobileViewport() && mapMobileInteractionStore.getState().interacting) return;
      mapViewportStore.syncZoomFromMap(map);
    };

    const onResize = () => {
      mapViewportStore.syncMobileBreakpoint();
      if (isMapAlive(map)) {
        mapViewportStore.syncFromMap(map, { updateBounds: true });
      }
    };

    syncFull();
    map.on('zoom', syncZoomIfAllowed);
    map.on('zoomend', syncFull);
    map.on('moveend', syncFull);
    window.addEventListener('resize', onResize);

    const unsubInteraction = mapMobileInteractionStore.subscribe(() => {
      const { interacting } = mapMobileInteractionStore.getState();
      if (!interacting) {
        syncFull();
      }
    });

    return () => {
      unsubInteraction();
      if (isMapAlive(map)) {
        map.off('zoom', syncZoomIfAllowed);
        map.off('zoomend', syncFull);
        map.off('moveend', syncFull);
      }
      window.removeEventListener('resize', onResize);
      mapViewportStore.reset();
    };
  }, [map]);

  return null;
}
