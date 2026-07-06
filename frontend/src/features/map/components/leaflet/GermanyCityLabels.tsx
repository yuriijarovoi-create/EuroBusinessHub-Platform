import { memo, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import {
  filterVisibleCityLabels,
  getCityDisplayTier,
  type CityDisplayTier,
} from '../../utils/cityVisibilityUtils';

interface GermanyCityLabelsProps {
  active: boolean;
  cities: MapCityRecord[];
  selectedCityId?: string;
  hoveredCityId?: string;
  searchResultCityId?: string;
}

function labelIcon(name: string, tier: CityDisplayTier, selected: boolean) {
  const cls = [
    'ebh-city-label',
    tier === 1 ? 'ebh-city-label-tier1' : '',
    tier === 2 ? 'ebh-city-label-tier2' : '',
    tier === 3 ? 'ebh-city-label-tier3' : '',
    tier === 4 ? 'ebh-city-label-tier4' : '',
    tier === 5 ? 'ebh-city-label-tier5' : '',
    selected ? 'ebh-city-label-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'ebh-city-label-wrap',
    html: `<span class="${cls}">${name}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export const GermanyCityLabels = memo(function GermanyCityLabels({
  active,
  cities,
  selectedCityId,
  hoveredCityId,
  searchResultCityId,
}: GermanyCityLabelsProps) {
  const { zoom, isMobile } = useLeafletMapViewport();

  const labels = useMemo(() => {
    if (!active || zoom < (isMobile ? 5.5 : 5)) return [];
    return filterVisibleCityLabels(cities, {
      zoom,
      isMobile,
      selectedCityId,
      hoveredCityId,
      searchResultId: searchResultCityId,
    });
  }, [active, cities, zoom, isMobile, selectedCityId, hoveredCityId, searchResultCityId]);

  if (!active || zoom < (isMobile ? 5.5 : 5)) return null;

  return (
    <>
      {labels.map((city) => {
        const tier = getCityDisplayTier(city);
        return (
          <Marker
            key={`label-${city.id}`}
            position={[city.lat, city.lng]}
            icon={labelIcon(city.name, tier, city.id === selectedCityId)}
            interactive={false}
            zIndexOffset={
              city.id === selectedCityId ? 500 : tier === 1 ? 300 : tier === 2 ? 150 : 0
            }
          />
        );
      })}
    </>
  );
});
