import { memo, useEffect, useMemo } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { DEFAULT_HUB_ID } from '../../data/mapData';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import {
  getCityDisplayTier,
  getVisibleCityNodes,
  type CityDisplayTier,
} from '../../utils/cityVisibilityUtils';

interface LeafletCityMarkersProps {
  cities: MapCityRecord[];
  selectedCityId?: string;
  activeTooltipId?: string | null;
  searchResultCityId?: string;
  onSelect: (city: MapCityRecord) => void;
  onTooltipEnter: (cityId: string) => void;
  onTooltipLeave: () => void;
  onClearTooltip: () => void;
  onMapBackgroundClick: () => void;
}

function createCityIcon(
  city: MapCityRecord,
  isHighlighted: boolean,
  isHub: boolean,
  displayTier: CityDisplayTier,
) {
  const size = isHub ? 32 : displayTier === 1 ? 28 : displayTier === 2 ? 22 : displayTier === 3 ? 16 : 14;
  const anchor = size / 2;

  const cls = [
    'ebh-marker',
    isHub ? 'ebh-marker-hub' : '',
    displayTier === 1 ? 'ebh-marker-tier1' : '',
    displayTier === 2 ? 'ebh-marker-tier2' : '',
    displayTier === 3 ? 'ebh-marker-tier3' : '',
    displayTier === 4 ? 'ebh-marker-tier4' : '',
    isHighlighted ? 'ebh-marker-selected' : '',
    displayTier >= 3 && !isHub ? 'ebh-marker-small' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'ebh-marker-wrap',
    html: `<div class="${cls}"><span class="ebh-marker-core"></span><span class="ebh-marker-pulse"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

interface LeafletCityMarkerProps {
  city: MapCityRecord;
  isSelected: boolean;
  isHovered: boolean;
  isMobile: boolean;
  onSelect: (city: MapCityRecord) => void;
  onTooltipEnter: (cityId: string) => void;
  onTooltipLeave: () => void;
}

const LeafletCityMarker = memo(
  function LeafletCityMarker({
    city,
    isSelected,
    isHovered,
    isMobile,
    onSelect,
    onTooltipEnter,
    onTooltipLeave,
  }: LeafletCityMarkerProps) {
    const isHub = city.id === DEFAULT_HUB_ID;
    const isHighlighted = isSelected || isHovered;
    const displayTier = getCityDisplayTier(city);
    const icon = useMemo(
      () => createCityIcon(city, isHighlighted, isHub, displayTier),
      [city, isHighlighted, isHub, displayTier],
    );

    return (
      <Marker
        position={[city.lat, city.lng]}
        icon={icon}
        zIndexOffset={
          isHub ? 1000 : isHighlighted ? 500 : displayTier === 1 ? 250 : displayTier === 2 ? 120 : 0
        }
        eventHandlers={{
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelect(city);
          },
          ...(!isMobile
            ? {
                mouseover: () => onTooltipEnter(city.id),
                mouseout: () => onTooltipLeave(),
              }
            : {}),
        }}
      />
    );
  },
  (prev, next) =>
    prev.city.id === next.city.id &&
    prev.isSelected === next.isSelected &&
    prev.isHovered === next.isHovered &&
    prev.isMobile === next.isMobile,
);

export const LeafletCityMarkers = memo(function LeafletCityMarkers({
  cities,
  selectedCityId,
  activeTooltipId,
  searchResultCityId,
  onSelect,
  onTooltipEnter,
  onTooltipLeave,
  onClearTooltip,
  onMapBackgroundClick,
}: LeafletCityMarkersProps) {
  const map = useMap();
  const { zoom, isMobile } = useLeafletMapViewport();

  const hoveredCityId = activeTooltipId ?? undefined;

  useEffect(() => {
    map.on('click', onMapBackgroundClick);
    map.on('dragstart', onClearTooltip);
    map.on('zoomstart', onClearTooltip);

    const container = map.getContainer();
    container.addEventListener('wheel', onClearTooltip, { passive: true });

    return () => {
      map.off('click', onMapBackgroundClick);
      map.off('dragstart', onClearTooltip);
      map.off('zoomstart', onClearTooltip);
      container.removeEventListener('wheel', onClearTooltip);
    };
  }, [map, onClearTooltip, onMapBackgroundClick]);

  const visibleCities = useMemo(
    () => getVisibleCityNodes(cities, zoom, selectedCityId, hoveredCityId, searchResultCityId, isMobile),
    [cities, zoom, selectedCityId, hoveredCityId, searchResultCityId, isMobile],
  );

  return (
    <>
      {visibleCities.map((city) => (
        <LeafletCityMarker
          key={city.id}
          city={city}
          isSelected={city.id === selectedCityId}
          isHovered={city.id === activeTooltipId}
          isMobile={isMobile}
          onSelect={onSelect}
          onTooltipEnter={onTooltipEnter}
          onTooltipLeave={onTooltipLeave}
        />
      ))}
    </>
  );
});

/** Fly to hub on first load */
export function LeafletHubFocus({ cityId }: { cityId?: string }) {
  const map = useMap();
  useEffect(() => {
    if (cityId === DEFAULT_HUB_ID) {
      map.setView([52.52, 13.405], 5, { animate: false });
    }
  }, [map, cityId]);
  return null;
}

export { HUB } from '../../data/europeGeo';
