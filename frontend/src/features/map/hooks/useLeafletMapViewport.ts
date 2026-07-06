import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { isMobileViewport } from '../utils/cityVisibilityUtils';
import { isMapAlive } from '../utils/mapLayerLifecycle';

/** Track Leaflet zoom + mobile breakpoint for visibility filtering */
export function useLeafletMapViewport() {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    const onResize = () => setIsMobile(isMobileViewport());
    map.on('zoom', onZoom);
    map.on('zoomend', onZoom);
    window.addEventListener('resize', onResize);
    return () => {
      if (!isMapAlive(map)) return;
      map.off('zoom', onZoom);
      map.off('zoomend', onZoom);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  return { zoom, isMobile };
}
