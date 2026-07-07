import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { isMobileViewport } from '../utils/cityVisibilityUtils';
import { isMapAlive } from '../utils/mapLayerLifecycle';

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
    const onResize = () => setIsMobile(isMobileViewport());
    syncViewport();
    map.on('zoom', syncViewport);
    map.on('zoomend', syncViewport);
    map.on('moveend', syncViewport);
    window.addEventListener('resize', onResize);
    return () => {
      if (!isMapAlive(map)) return;
      map.off('zoom', syncViewport);
      map.off('zoomend', syncViewport);
      map.off('moveend', syncViewport);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  return { zoom, center, isMobile };
}
