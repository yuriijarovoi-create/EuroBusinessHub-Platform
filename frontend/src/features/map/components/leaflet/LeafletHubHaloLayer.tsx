import { memo, useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { MAJOR_HUB_IDS } from '../../utils/routeVisualState';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';

interface LeafletHubHaloLayerProps {
  cityMap: Map<string, MapCityRecord>;
  hoveredCityId?: string | null;
}

export const LeafletHubHaloLayer = memo(function LeafletHubHaloLayer({
  cityMap,
  hoveredCityId,
}: LeafletHubHaloLayerProps) {
  const map = useMap();
  const { zoom } = useLeafletMapViewport();

  const hubIds = useMemo(() => {
    const ids = new Set(MAJOR_HUB_IDS);
    for (const [id, city] of cityMap) {
      if (city.isMajorHub) ids.add(id);
    }
    return ids;
  }, [cityMap]);

  useEffect(() => {
    if (zoom < 4.5) return;
    const group = L.layerGroup().addTo(map);

    hubIds.forEach((hubId) => {
      const city = cityMap.get(hubId);
      if (!city) return;

      const isHovered = hubId === hoveredCityId;
      const isStrategic = hubId === 'izium' || hubId === 'kyiv' || hubId === 'istanbul' || hubId === 'ankara';
      const baseRadius = zoom < 7 ? 14 : zoom < 10 ? 18 : 22;
      const radius = isStrategic ? baseRadius * 1.15 : baseRadius;

      L.circleMarker([city.lat, city.lng], {
        radius,
        fillColor: isStrategic ? '#3db8e8' : '#2a9fc9',
        fillOpacity: isHovered ? 0.09 : zoom < 7 ? 0.035 : 0.05,
        color: isStrategic ? '#3db8e8' : '#2a9fc9',
        weight: isHovered ? 1 : 0.5,
        opacity: isHovered ? 0.32 : 0.18,
        className: `ebh-hub-halo${isHovered ? ' ebh-hub-halo-hover' : ''}`,
        interactive: false,
      }).addTo(group);

      L.circleMarker([city.lat, city.lng], {
        radius: radius * 0.55,
        fillColor: 'transparent',
        fillOpacity: 0,
        color: isStrategic ? '#5cc8f5' : '#2a9fc9',
        weight: isHovered ? 1.4 : 0.8,
        opacity: isHovered ? 0.55 : 0.28,
        className: `ebh-hub-energy${isStrategic ? ' ebh-hub-energy-strategic' : ''}`,
        interactive: false,
      }).addTo(group);
    });

    return () => {
      map.removeLayer(group);
    };
  }, [map, cityMap, zoom, hubIds, hoveredCityId]);

  return null;
});
