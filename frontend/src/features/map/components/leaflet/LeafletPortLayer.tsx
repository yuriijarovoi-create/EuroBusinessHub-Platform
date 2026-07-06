import { memo, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { createPortAnchorIcon, isPortCity, PORT_CITY_IDS } from '../../utils/routeVehicleIcons';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';

interface LeafletPortLayerProps {
  cityMap: Map<string, MapCityRecord>;
}

export const LeafletPortLayer = memo(function LeafletPortLayer({
  cityMap,
}: LeafletPortLayerProps) {
  const map = useMap();
  const { zoom } = useLeafletMapViewport();

  useEffect(() => {
    if (zoom < 7) return;
    const group = L.layerGroup().addTo(map);
    const color = '#3d9eae';

    PORT_CITY_IDS.forEach((portId) => {
      if (!isPortCity(portId)) return;
      const city = cityMap.get(portId);
      if (!city) return;
      L.marker([city.lat, city.lng], {
        icon: createPortAnchorIcon(color),
        interactive: false,
        zIndexOffset: 200,
      }).addTo(group);
    });

    return () => {
      map.removeLayer(group);
    };
  }, [map, cityMap, zoom]);

  return null;
});
