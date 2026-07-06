import { memo, useCallback, useEffect, useMemo } from 'react';
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
import {
  buildCityMarkerDisplayItems,
  getIndividualVisibleCityIds,
} from '../../utils/cityClusterUtils';

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
  onVisibleIndividualsChange?: (ids: Set<string>) => void;
}

function markerSizeForTier(
  displayTier: CityDisplayTier,
  isHub: boolean,
  zoom: number,
): number {
  if (isHub) return 32;
  const base =
    displayTier === 1 ? 28
    : displayTier === 2 ? 22
    : displayTier === 3 ? 16
    : displayTier === 4 ? 13
    : 11;
  if (displayTier >= 4 && zoom < 9) return Math.max(7, base - 4);
  if (displayTier >= 4 && zoom < 11) return Math.max(8, base - 2);
  return base;
}

function createCityIcon(
  city: MapCityRecord,
  isHighlighted: boolean,
  isHub: boolean,
  displayTier: CityDisplayTier,
  zoom: number,
) {
  const size = markerSizeForTier(displayTier, isHub, zoom);
  const anchor = size / 2;
  const isIzium = city.id === 'izium';

  const cls = [
    'ebh-marker',
    isHub ? 'ebh-marker-hub' : '',
    isIzium ? 'ebh-marker-izium' : '',
    displayTier === 1 ? 'ebh-marker-tier1' : '',
    displayTier === 2 ? 'ebh-marker-tier2' : '',
    displayTier === 3 ? 'ebh-marker-tier3' : '',
    displayTier === 4 ? 'ebh-marker-tier4' : '',
    displayTier === 5 ? 'ebh-marker-tier5' : '',
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
  zoom: number;
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
    zoom,
    onSelect,
    onTooltipEnter,
    onTooltipLeave,
  }: LeafletCityMarkerProps) {
    const isHub = Boolean(city.isMajorHub) || city.id === DEFAULT_HUB_ID;
    const isHighlighted = isSelected || isHovered;
    const displayTier = getCityDisplayTier(city);
    const icon = useMemo(
      () => createCityIcon(city, isHighlighted, isHub, displayTier, zoom),
      [city, isHighlighted, isHub, displayTier, zoom],
    );

    return (
      <Marker
        position={[city.lat, city.lng]}
        icon={icon}
        interactive
        bubblingMouseEvents={false}
        zIndexOffset={
          isHub ? 1000 : isHighlighted ? 700 : displayTier === 1 ? 250 : displayTier === 2 ? 120 : 200
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
    prev.isMobile === next.isMobile &&
    prev.zoom === next.zoom,
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
  onVisibleIndividualsChange,
}: LeafletCityMarkersProps) {
  const map = useMap();
  const { zoom, isMobile } = useLeafletMapViewport();

  const hoveredCityId = activeTooltipId ?? undefined;

  const forcedIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedCityId) ids.add(selectedCityId);
    if (hoveredCityId) ids.add(hoveredCityId);
    if (searchResultCityId) ids.add(searchResultCityId);
    return ids;
  }, [selectedCityId, hoveredCityId, searchResultCityId]);

  const handleMapBackgroundClick = useCallback(() => {
    onMapBackgroundClick();
  }, [onMapBackgroundClick]);

  useEffect(() => {
    const onDragStart = () => onClearTooltip();
    const onZoomStart = () => onClearTooltip();

    map.on('click', handleMapBackgroundClick);
    map.on('dragstart', onDragStart);
    map.on('zoomstart', onZoomStart);

    const container = map.getContainer();
    container.addEventListener('wheel', onClearTooltip, { passive: true });

    return () => {
      map.off('click', handleMapBackgroundClick);
      map.off('dragstart', onDragStart);
      map.off('zoomstart', onZoomStart);
      container.removeEventListener('wheel', onClearTooltip);
    };
  }, [map, onClearTooltip, handleMapBackgroundClick]);

  const displayItems = useMemo(() => {
    const visible = getVisibleCityNodes(
      cities,
      zoom,
      selectedCityId,
      hoveredCityId,
      searchResultCityId,
      isMobile,
    );
    return buildCityMarkerDisplayItems(visible, zoom, forcedIds);
  }, [cities, zoom, selectedCityId, hoveredCityId, searchResultCityId, isMobile, forcedIds]);

  const individualIds = useMemo(
    () => getIndividualVisibleCityIds(displayItems),
    [displayItems],
  );

  useEffect(() => {
    onVisibleIndividualsChange?.(individualIds);
  }, [individualIds, onVisibleIndividualsChange]);

  useEffect(() => {
    if (!activeTooltipId || individualIds.size === 0) return;
    if (!individualIds.has(activeTooltipId)) onClearTooltip();
  }, [activeTooltipId, individualIds, onClearTooltip]);

  return (
    <>
      {displayItems.map((item) => {
        if (item.type !== 'city') return null;
        return (
          <LeafletCityMarker
            key={item.city.id}
            city={item.city}
            zoom={zoom}
            isSelected={item.city.id === selectedCityId}
            isHovered={item.city.id === activeTooltipId}
            isMobile={isMobile}
            onSelect={onSelect}
            onTooltipEnter={onTooltipEnter}
            onTooltipLeave={onTooltipLeave}
          />
        );
      })}
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
