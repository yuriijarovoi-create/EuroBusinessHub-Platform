import { memo, useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { MAJOR_HUB_IDS } from '../../utils/routeVisualState';
import { isPremiumReferenceHub, isSecondaryLogisticsHubNode } from '../../data/hubRouteVisuals';
import { isPrimaryLogisticsHub } from '../../data/logisticsHubNetwork';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import { isMapAlive, safeClearGroup } from '../../utils/mapLayerLifecycle';

interface LeafletHubHaloLayerProps {
  cityMap: Map<string, MapCityRecord>;
  hoveredCityId?: string | null;
  selectedCityId?: string | null;
}

export const LeafletHubHaloLayer = memo(function LeafletHubHaloLayer({
  cityMap,
  hoveredCityId,
  selectedCityId,
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
    if (!isMapAlive(map)) return;
    if (zoom < 4.5) return;

    const group = L.layerGroup().addTo(map);

    hubIds.forEach((hubId) => {
      const city = cityMap.get(hubId);
      if (!city) return;

      const isHovered = hubId === hoveredCityId;
      const isSelected = hubId === selectedCityId;
      const isPrimary = isPrimaryLogisticsHub(hubId);
      const isSecondary = isSecondaryLogisticsHubNode(hubId);
      const isStrategic = hubId === 'izium' || hubId === 'kyiv' || hubId === 'istanbul' || hubId === 'ankara';

      const baseRadius =
        zoom < 7
          ? isPrimary ? 22 : isSecondary ? 17 : 14
          : zoom < 10
            ? isPrimary ? 28 : isSecondary ? 22 : 18
            : isPrimary ? 34 : isSecondary ? 26 : 20;
      const radius = isStrategic ? baseRadius * 1.14 : isPrimary ? baseRadius * 1.06 : baseRadius;

      const haloColor = isStrategic ? '#22d3ee' : isPrimary ? '#00c8ff' : '#38bdf8';
      const fillOpacity =
        isSelected ? 0.16
        : isHovered ? 0.12
        : isPrimary ? 0.085
        : isSecondary ? 0.06
        : zoom < 7 ? 0.04 : 0.052;
      const ringOpacity = isSelected ? 0.68 : isHovered ? 0.52 : isPrimary ? 0.42 : isSecondary ? 0.3 : 0.22;

      L.circleMarker([city.lat, city.lng], {
        radius,
        fillColor: haloColor,
        fillOpacity,
        color: haloColor,
        weight: isSelected ? 1.2 : isHovered ? 0.9 : 0.55,
        opacity: ringOpacity,
        className: `ebh-hub-halo${isPrimary ? ' ebh-hub-halo-primary' : ''}${isPremiumReferenceHub(hubId) ? ' ebh-hub-halo-premium' : ''}${isHovered ? ' ebh-hub-halo-hover' : ''}${isSelected ? ' ebh-hub-halo-selected' : ''}`,
        interactive: false,
      }).addTo(group);

      L.circleMarker([city.lat, city.lng], {
        radius: radius * 0.5,
        fillColor: 'transparent',
        fillOpacity: 0,
        color: isStrategic ? '#67e8f9' : haloColor,
        weight: isSelected ? 1.6 : isHovered ? 1.2 : 0.75,
        opacity: isSelected ? 0.72 : isHovered ? 0.58 : 0.32,
        className: `ebh-hub-energy${isPrimary ? ' ebh-hub-energy-primary' : ''}${isStrategic ? ' ebh-hub-energy-strategic' : ''}${isPremiumReferenceHub(hubId) ? ' ebh-hub-energy-premium' : ''}`,
        interactive: false,
      }).addTo(group);
    });

    return () => {
      safeClearGroup(map, group);
    };
  }, [map, cityMap, zoom, hubIds, hoveredCityId, selectedCityId]);

  return null;
});
