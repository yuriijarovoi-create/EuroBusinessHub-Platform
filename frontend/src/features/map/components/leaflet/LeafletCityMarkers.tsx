import { memo, useCallback, useEffect, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { DEFAULT_HUB_ID } from '../../data/mapData';
import { isPrimaryLogisticsHub, isSecondaryLogisticsHub } from '../../data/logisticsHubNetwork';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import { isMapAlive } from '../../utils/mapLayerLifecycle';
import {
  getCityDisplayTier,
  getVisibleCityNodes,
  type CityDisplayTier,
} from '../../utils/cityVisibilityUtils';
import {
  buildCityMarkerDisplayItems,
} from '../../utils/cityClusterUtils';
import {
  computeSettlementMarkerViewportStats,
  filterCitiesInViewportBounds,
} from '../../utils/viewportBoundsUtils';
import {
  shouldShowUkraineFlagMarker,
  UKRAINE_FLAG_MARKER_CITY_ID,
} from '../../utils/ukraineMarkerVisibility';
import {
  isCityMarkerTouchGuardActive,
  markCityMarkerTouchHandled,
  stopLeafletPropagation,
} from '../../utils/cityMarkerTouchGuard';

interface LeafletCityMarkersProps {
  cities: MapCityRecord[];
  selectedCityId?: string;
  hoveredCityId?: string | null;
  searchResultCityId?: string;
  onSelect: (city: MapCityRecord) => void;
  onCityHover: (cityId: string) => void;
  onCityHoverLeave: () => void;
  onClearInfoCard: () => void;
  onMapBackgroundClick: () => void;
  countryFocusActive?: boolean;
  selectedCountryCode?: string;
}

function markerSizeForTier(
  displayTier: CityDisplayTier,
  isHub: boolean,
  zoom: number,
  cityId: string,
): number {
  if (isPrimaryLogisticsHub(cityId)) return zoom < 7 ? 36 : 42;
  if (isSecondaryLogisticsHub(cityId) || isHub) return zoom < 7 ? 30 : 34;
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
  const size = markerSizeForTier(displayTier, isHub, zoom, city.id);
  const anchor = size / 2;
  const isIzium = city.id === 'izium';

  const cls = [
    'ebh-marker',
    isPrimaryLogisticsHub(city.id) ? 'ebh-marker-primary-hub' : '',
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
    className: 'ebh-marker-wrap ebh-marker-interactive',
    html: `<div class="${cls}"><span class="ebh-marker-core"></span><span class="ebh-marker-pulse"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

interface LeafletCityMarkerProps {
  city: MapCityRecord;
  isSelected: boolean;
  isMobile: boolean;
  zoom: number;
  onSelect: (city: MapCityRecord) => void;
}

function closeOpenSettlementTooltips(map: L.Map): void {
  map.eachLayer((layer) => {
    if (!(layer instanceof L.Marker)) return;
    const tooltip = layer.getTooltip();
    if (!tooltip?.isOpen()) return;
    const el = tooltip.getElement();
    if (el?.classList.contains('ebh-settlement-name-tooltip')) {
      layer.closeTooltip();
    }
  });
}

const LeafletCityMarker = memo(
  function LeafletCityMarker({
    city,
    isSelected,
    isMobile,
    zoom,
    onSelect,
  }: LeafletCityMarkerProps) {
    const isHub = Boolean(city.isMajorHub) || city.id === DEFAULT_HUB_ID;
    const isHighlighted = isSelected;
    const displayTier = getCityDisplayTier(city);
    const markerSize = markerSizeForTier(displayTier, isHub, zoom, city.id);
    const icon = useMemo(
      () => createCityIcon(city, isHighlighted, isHub, displayTier, zoom),
      [city, isHighlighted, isHub, displayTier, zoom],
    );
    const nameTooltipOffset: [number, number] = [0, -(Math.round(markerSize / 2) + 6)];

    const activateCity = () => {
      onSelect(city);
    };

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
            L.DomEvent.stop(e);
            if (isCityMarkerTouchGuardActive()) return;
            if (e.target instanceof L.Marker) {
              e.target.closeTooltip();
            }
            activateCity();
          },
          dblclick: (e) => {
            L.DomEvent.stop(e);
          },
          ...(isMobile
            ? {
                touchend: (e: L.LeafletEvent) => {
                  stopLeafletPropagation(e);
                  markCityMarkerTouchHandled();
                  activateCity();
                },
              }
            : {}),
        }}
      >
        {!isMobile && !isSelected && (
          <Tooltip
            permanent={false}
            sticky={false}
            interactive={false}
            direction="top"
            offset={nameTooltipOffset}
            opacity={0.95}
            className="ebh-tooltip ebh-settlement-name-tooltip"
          >
            {city.name}
          </Tooltip>
        )}
      </Marker>
    );
  },
  (prev, next) =>
    prev.city.id === next.city.id &&
    prev.isSelected === next.isSelected &&
    prev.isMobile === next.isMobile &&
    prev.zoom === next.zoom,
);

export const LeafletCityMarkers = memo(function LeafletCityMarkers({
  cities,
  selectedCityId,
  hoveredCityId,
  searchResultCityId,
  onSelect,
  onClearInfoCard,
  onMapBackgroundClick,
  countryFocusActive = false,
  selectedCountryCode,
}: LeafletCityMarkersProps) {
  const map = useMap();
  const { zoom, center, bounds, isMobile, ready } = useLeafletMapViewport();

  const forcedIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedCityId) ids.add(selectedCityId);
    if (hoveredCityId) ids.add(hoveredCityId);
    if (searchResultCityId) ids.add(searchResultCityId);
    return ids;
  }, [selectedCityId, hoveredCityId, searchResultCityId]);

  const handleMapBackgroundClick = useCallback(() => {
    if (isCityMarkerTouchGuardActive()) return;
    onMapBackgroundClick();
  }, [onMapBackgroundClick]);

  const handleMapInteractionStart = useCallback(() => {
    closeOpenSettlementTooltips(map);
    onClearInfoCard();
  }, [map, onClearInfoCard]);

  useEffect(() => {
    if (countryFocusActive) return;

    map.on('click', handleMapBackgroundClick);
    map.on('dragstart', handleMapInteractionStart);
    map.on('zoomstart', handleMapInteractionStart);

    return () => {
      if (!isMapAlive(map)) return;
      map.off('click', handleMapBackgroundClick);
      map.off('dragstart', handleMapInteractionStart);
      map.off('zoomstart', handleMapInteractionStart);
    };
  }, [map, handleMapBackgroundClick, handleMapInteractionStart, countryFocusActive]);

  useEffect(() => {
    if (!countryFocusActive) return;

    map.on('dragstart', handleMapInteractionStart);
    map.on('zoomstart', handleMapInteractionStart);

    return () => {
      if (!isMapAlive(map)) return;
      map.off('dragstart', handleMapInteractionStart);
      map.off('zoomstart', handleMapInteractionStart);
    };
  }, [map, handleMapInteractionStart, countryFocusActive]);

  const zoomEligibleCities = useMemo(
    () =>
      getVisibleCityNodes(
        cities,
        zoom,
        selectedCityId,
        hoveredCityId ?? undefined,
        searchResultCityId ?? undefined,
        isMobile,
      ),
    [cities, zoom, selectedCityId, hoveredCityId, searchResultCityId, isMobile],
  );

  const viewportCities = useMemo(
    () => filterCitiesInViewportBounds(zoomEligibleCities, ready ? bounds : null, forcedIds),
    [zoomEligibleCities, ready, bounds, forcedIds],
  );

  const displayItems = useMemo(() => {
    const items = buildCityMarkerDisplayItems(viewportCities, zoom, forcedIds);
    const showUkraineFlag = shouldShowUkraineFlagMarker({
      zoom,
      mapCenterLat: center.lat,
      mapCenterLng: center.lng,
      selectedCountryCode,
      selectedCityId,
      hoveredCityId,
      searchResultCityId,
    });
    if (showUkraineFlag) return items;
    return items.filter(
      (item) => item.type !== 'city' || item.city.id !== UKRAINE_FLAG_MARKER_CITY_ID,
    );
  }, [
    viewportCities,
    zoom,
    center.lat,
    center.lng,
    selectedCountryCode,
    selectedCityId,
    hoveredCityId,
    searchResultCityId,
    forcedIds,
  ]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const stats = computeSettlementMarkerViewportStats(
      cities.length,
      zoomEligibleCities.length,
      viewportCities.length,
    );
    console.debug('[EBH settlement markers]', stats);
  }, [cities.length, zoomEligibleCities.length, viewportCities.length]);

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
            isMobile={isMobile}
            onSelect={onSelect}
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
