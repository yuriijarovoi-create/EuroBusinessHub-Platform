import { memo, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { MAJOR_HUB_IDS } from '../../utils/routeVisualState';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';

interface LeafletHubHaloLayerProps {
  cityMap: Map<string, MapCityRecord>;
}

export const LeafletHubHaloLayer = memo(function LeafletHubHaloLayer({
  cityMap,
}: LeafletHubHaloLayerProps) {
  const map = useMap();
  const { zoom } = useLeafletMapViewport();

  useEffect(() => {
    if (zoom < 5) return;
    const group = L.layerGroup().addTo(map);

    MAJOR_HUB_IDS.forEach((hubId) => {
      const city = cityMap.get(hubId);
      if (!city) return;
      const radius = zoom < 7 ? 14 : zoom < 10 ? 18 : 22;
      L.circleMarker([city.lat, city.lng], {
        radius,
        fillColor: '#2a9fc9',
        fillOpacity: zoom < 7 ? 0.035 : 0.05,
        color: '#2a9fc9',
        weight: 0.5,
        opacity: 0.18,
        className: 'ebh-hub-halo',
        interactive: false,
      }).addTo(group);
    });

    return () => {
      map.removeLayer(group);
    };
  }, [map, cityMap, zoom]);

  return null;
});
