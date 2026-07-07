import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { isMobileViewport } from '../utils/cityVisibilityUtils';
import { isMapAlive } from '../utils/mapLayerLifecycle';
import { mapMobileInteractionStore } from '../store/mapMobileInteractionStore';

/** Track Leaflet zoom + mobile breakpoint for visibility filtering */
export function useLeafletMapViewport() {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [center, setCenter] = useState(() => map.getCenter());
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    const syncViewport = () => {
      setZoom(map.getZoom());
      setCenter(map.getCenter());
    };
    const syncZoomIfAllowed = () => {
      if (isMobileViewport() && mapMobileInteractionStore.getState().interacting) return;
      setZoom(map.getZoom());
    };
    const onResize = () => setIsMobile(isMobileViewport());
    syncViewport();
    map.on('zoom', syncZoomIfAllowed);
    map.on('zoomend', syncViewport);
    map.on('moveend', syncViewport);
    window.addEventListener('resize', onResize);
    const unsubInteraction = mapMobileInteractionStore.subscribe(() => {
      const { interacting } = mapMobileInteractionStore.getState();
      if (!interacting && isMobileViewport()) {
        syncViewport();
      }
    });
    return () => {
      unsubInteraction();
      if (!isMapAlive(map)) return;
      map.off('zoom', syncZoomIfAllowed);
      map.off('zoomend', syncViewport);
      map.off('moveend', syncViewport);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  return { zoom, center, isMobile };
}
