import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';
import { DEFAULT_HUB_ID } from '../../data/mapData';
import { EUROPE_MAX_ZOOM } from '../../config/leafletConfig';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import {
  getCityDisplayTier,
  getVisibleCityNodes,
  type CityDisplayTier,
} from '../../utils/cityVisibilityUtils';
import {
  buildCityMarkerDisplayItems,
  getIndividualVisibleCityIds,
  type CityMarkerCluster,
} from '../../utils/cityClusterUtils';
import {
  buildSpiderLayoutMap,
  CLUSTER_ZOOM_DURATION_S,
  findResidualCluster,
  getClusterZoomTarget,
  lerpSpiderPosition,
  shouldSpiderfyCluster,
  SPIDERFY_ANIM_MS,
  type LatLngPoint,
} from '../../utils/cityClusterSpiderfy';
import {
  clusterHasMoselVillage,
  MOSEL_INDIVIDUAL_MARKER_ZOOM,
} from '../../utils/moselVillageUtils';
import { LeafletSpiderfyLegs } from './LeafletSpiderfyLegs';

const CLUSTER_HIT_SIZE = 44;

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
  onSpiderTooltipPositionsChange?: (positions: Map<string, LatLngPoint> | null) => void;
}

function createCityIcon(
  city: MapCityRecord,
  isHighlighted: boolean,
  isHub: boolean,
  displayTier: CityDisplayTier,
) {
  const size =
    isHub ? 32
    : displayTier === 1 ? 28
    : displayTier === 2 ? 22
    : displayTier === 3 ? 16
    : displayTier === 4 ? 13
    : 11;
  const anchor = size / 2;

  const cls = [
    'ebh-marker',
    isHub ? 'ebh-marker-hub' : '',
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

function createClusterIcon(count: number) {
  const label = count > 99 ? '99+' : String(count);
  return L.divIcon({
    className: 'ebh-marker-wrap ebh-cluster-marker-wrap',
    html: `<div class="ebh-cluster-marker" role="button" aria-label="Expand ${label} places"><span class="ebh-cluster-glow"></span><span class="ebh-cluster-core">${label}</span></div>`,
    iconSize: [CLUSTER_HIT_SIZE, CLUSTER_HIT_SIZE],
    iconAnchor: [CLUSTER_HIT_SIZE / 2, CLUSTER_HIT_SIZE / 2],
  });
}

function clusterStableKey(cluster: CityMarkerCluster): string {
  return cluster.cities
    .map((c) => c.id)
    .sort()
    .join('|');
}

interface LeafletCityMarkerProps {
  city: MapCityRecord;
  isSelected: boolean;
  isHovered: boolean;
  isMobile: boolean;
  position?: [number, number];
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
    position,
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
        position={position ?? [city.lat, city.lng]}
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
    prev.position?.[0] === next.position?.[0] &&
    prev.position?.[1] === next.position?.[1],
);

interface LeafletCityClusterMarkerProps {
  cluster: CityMarkerCluster;
  onClusterClick: (cluster: CityMarkerCluster) => void;
}

const LeafletCityClusterMarker = memo(function LeafletCityClusterMarker({
  cluster,
  onClusterClick,
}: LeafletCityClusterMarkerProps) {
  const icon = useMemo(() => createClusterIcon(cluster.count), [cluster.count]);

  const handleActivate = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      onClusterClick(cluster);
    },
    [cluster, onClusterClick],
  );

  return (
    <Marker
      position={[cluster.lat, cluster.lng]}
      icon={icon}
      interactive
      bubblingMouseEvents={false}
      riseOnHover
      zIndexOffset={650}
      eventHandlers={{
        click: handleActivate,
        mousedown: (e) => L.DomEvent.stopPropagation(e),
        touchstart: (e) => L.DomEvent.stopPropagation(e),
      }}
    />
  );
});

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
  onSpiderTooltipPositionsChange,
}: LeafletCityMarkersProps) {
  const map = useMap();
  const { zoom, isMobile } = useLeafletMapViewport();
  const [spiderfiedCluster, setSpiderfiedCluster] = useState<CityMarkerCluster | null>(null);
  const [spiderProgress, setSpiderProgress] = useState(1);

  const pendingClusterRef = useRef<CityMarkerCluster | null>(null);
  const isProgrammaticClusterZoomRef = useRef(false);
  const spiderAnimRef = useRef(0);

  const hoveredCityId = activeTooltipId ?? undefined;

  const clearSpiderfy = useCallback(() => {
    setSpiderfiedCluster(null);
    setSpiderProgress(1);
    onSpiderTooltipPositionsChange?.(null);
    if (spiderAnimRef.current) {
      cancelAnimationFrame(spiderAnimRef.current);
      spiderAnimRef.current = 0;
    }
  }, [onSpiderTooltipPositionsChange]);

  const startSpiderfyAnimation = useCallback((cluster: CityMarkerCluster) => {
    setSpiderfiedCluster(cluster);
    setSpiderProgress(0);
    const layout = buildSpiderLayoutMap(cluster);
    onSpiderTooltipPositionsChange?.(layout);

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SPIDERFY_ANIM_MS);
      setSpiderProgress(t);
      if (t < 1) {
        spiderAnimRef.current = requestAnimationFrame(tick);
      }
    };
    if (spiderAnimRef.current) cancelAnimationFrame(spiderAnimRef.current);
    spiderAnimRef.current = requestAnimationFrame(tick);
  }, [onSpiderTooltipPositionsChange]);

  const handleMapBackgroundClick = useCallback(() => {
    clearSpiderfy();
    pendingClusterRef.current = null;
    onMapBackgroundClick();
  }, [clearSpiderfy, onMapBackgroundClick]);

  const forcedIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedCityId) ids.add(selectedCityId);
    if (hoveredCityId) ids.add(hoveredCityId);
    if (searchResultCityId) ids.add(searchResultCityId);
    return ids;
  }, [selectedCityId, hoveredCityId, searchResultCityId]);

  const trySpiderfyAfterZoom = useCallback(() => {
    const pending = pendingClusterRef.current;
    if (!pending) return;

    pendingClusterRef.current = null;
    const cityIds = new Set(pending.cities.map((c) => c.id));
    const visible = getVisibleCityNodes(
      cities,
      map.getZoom(),
      selectedCityId,
      hoveredCityId,
      searchResultCityId,
      isMobile,
    );
    const items = buildCityMarkerDisplayItems(visible, map.getZoom(), forcedIds);
    const residual = findResidualCluster(items, cityIds);

    if (
      residual &&
      shouldSpiderfyCluster(residual.cities, map.getZoom(), forcedIds)
    ) {
      startSpiderfyAnimation(residual);
    }
  }, [
    cities,
    map,
    selectedCityId,
    hoveredCityId,
    searchResultCityId,
    isMobile,
    forcedIds,
    startSpiderfyAnimation,
  ]);

  const handleClusterClick = useCallback(
    (cluster: CityMarkerCluster) => {
      clearSpiderfy();
      const currentZoom = map.getZoom();
      const targetZoom = getClusterZoomTarget(currentZoom);
      const isMosel = clusterHasMoselVillage(cluster.cities);

      if (isMosel) {
        const moselTarget = Math.max(targetZoom, MOSEL_INDIVIDUAL_MARKER_ZOOM);
        if (moselTarget > currentZoom) {
          pendingClusterRef.current = cluster;
          isProgrammaticClusterZoomRef.current = true;
          map.flyTo([cluster.lat, cluster.lng], moselTarget, {
            duration: CLUSTER_ZOOM_DURATION_S,
            easeLinearity: 0.25,
          });
        }
        return;
      }

      if (targetZoom <= currentZoom) {
        startSpiderfyAnimation(cluster);
        return;
      }

      pendingClusterRef.current = cluster;
      isProgrammaticClusterZoomRef.current = true;
      map.flyTo([cluster.lat, cluster.lng], targetZoom, {
        duration: CLUSTER_ZOOM_DURATION_S,
        easeLinearity: 0.25,
      });
    },
    [map, clearSpiderfy, startSpiderfyAnimation],
  );

  useEffect(() => {
    const onDragStart = () => {
      pendingClusterRef.current = null;
      clearSpiderfy();
      onClearTooltip();
    };

    const onZoomStart = () => {
      onClearTooltip();
      if (isProgrammaticClusterZoomRef.current) return;
      pendingClusterRef.current = null;
      clearSpiderfy();
    };

    const onZoomEnd = () => {
      if (isProgrammaticClusterZoomRef.current) {
        isProgrammaticClusterZoomRef.current = false;
        trySpiderfyAfterZoom();
        return;
      }
    };

    map.on('click', handleMapBackgroundClick);
    map.on('dragstart', onDragStart);
    map.on('zoomstart', onZoomStart);
    map.on('zoomend', onZoomEnd);

    const container = map.getContainer();
    container.addEventListener('wheel', onClearTooltip, { passive: true });

    return () => {
      map.off('click', handleMapBackgroundClick);
      map.off('dragstart', onDragStart);
      map.off('zoomstart', onZoomStart);
      map.off('zoomend', onZoomEnd);
      container.removeEventListener('wheel', onClearTooltip);
    };
  }, [
    map,
    onClearTooltip,
    handleMapBackgroundClick,
    clearSpiderfy,
    trySpiderfyAfterZoom,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pendingClusterRef.current = null;
        clearSpiderfy();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearSpiderfy]);

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

  const spiderfiedKey = spiderfiedCluster ? clusterStableKey(spiderfiedCluster) : null;

  const spiderLayout = useMemo(() => {
    if (!spiderfiedCluster) return null;
    return buildSpiderLayoutMap(spiderfiedCluster);
  }, [spiderfiedCluster]);

  const spiderCenter = useMemo<LatLngPoint | null>(() => {
    if (!spiderfiedCluster) return null;
    return { lat: spiderfiedCluster.lat, lng: spiderfiedCluster.lng };
  }, [spiderfiedCluster]);

  const individualIds = useMemo(() => {
    const ids = getIndividualVisibleCityIds(displayItems);
    if (spiderfiedCluster) {
      spiderfiedCluster.cities.forEach((c) => ids.add(c.id));
    }
    return ids;
  }, [displayItems, spiderfiedCluster]);

  useEffect(() => {
    onVisibleIndividualsChange?.(individualIds);
  }, [individualIds, onVisibleIndividualsChange]);

  useEffect(() => {
    if (!activeTooltipId || individualIds.size === 0) return;
    if (!individualIds.has(activeTooltipId)) onClearTooltip();
  }, [activeTooltipId, individualIds, onClearTooltip]);

  return (
    <>
      {spiderfiedCluster && spiderLayout && spiderCenter && (
        <LeafletSpiderfyLegs
          cluster={spiderfiedCluster}
          layout={spiderLayout}
          progress={spiderProgress}
        />
      )}
      {displayItems.map((item) => {
        if (item.type === 'cluster') {
          if (spiderfiedKey === clusterStableKey(item)) return null;
          return (
            <LeafletCityClusterMarker
              key={clusterStableKey(item)}
              cluster={item}
              onClusterClick={handleClusterClick}
            />
          );
        }

        if (spiderfiedCluster?.cities.some((c) => c.id === item.city.id)) {
          return null;
        }

        return (
          <LeafletCityMarker
            key={item.city.id}
            city={item.city}
            isSelected={item.city.id === selectedCityId}
            isHovered={item.city.id === activeTooltipId}
            isMobile={isMobile}
            onSelect={onSelect}
            onTooltipEnter={onTooltipEnter}
            onTooltipLeave={onTooltipLeave}
          />
        );
      })}
      {spiderfiedCluster &&
        spiderLayout &&
        spiderCenter &&
        spiderfiedCluster.cities.map((city) => {
          const target = spiderLayout.get(city.id);
          if (!target) return null;
          const pos = lerpSpiderPosition(spiderCenter, target, spiderProgress);
          return (
            <LeafletCityMarker
              key={`spider-${city.id}`}
              city={city}
              position={[pos.lat, pos.lng]}
              isSelected={city.id === selectedCityId}
              isHovered={city.id === activeTooltipId}
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
