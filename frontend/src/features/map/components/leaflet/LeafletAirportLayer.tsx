import { memo, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import {
  createAirportAnchorIcon,
  AIRPORT_CITY_IDS,
  airportAnchorVisibleAtZoom,
} from '../../utils/routeVehicleIcons';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';

interface LeafletAirportLayerProps {
  cityMap: Map<string, MapCityRecord>;
}

export const LeafletAirportLayer = memo(function LeafletAirportLayer({
  cityMap,
}: LeafletAirportLayerProps) {
  const map = useMap();
  const { zoom } = useLeafletMapViewport();

  useEffect(() => {
    if (!airportAnchorVisibleAtZoom(zoom)) return;

    const group = L.layerGroup().addTo(map);

    AIRPORT_CITY_IDS.forEach((airportId) => {
      const city = cityMap.get(airportId);
      if (!city) return;
      L.marker([city.lat, city.lng], {
        icon: createAirportAnchorIcon('#c084fc'),
        interactive: false,
        zIndexOffset: 210,
        opacity: 1,
      }).addTo(group);
    });

    return () => {
      map.removeLayer(group);
    };
  }, [map, cityMap, zoom]);

  return null;
});
