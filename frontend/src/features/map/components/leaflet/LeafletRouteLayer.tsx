import { memo, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusinessRouteDef, MapCityRecord } from '../../types/mapTypes';
import { filterRoutesByZoom, routeDensityOpacity } from '../../utils/routeVisibilityUtils';
import { getRouteScope } from '../../data/routeCityIndex';
import { buildRouteTooltipHtml } from '../../data/routeMetadata';
import {
  corridorStrokeColor,
  getRouteVisualStyle,
  routeVisualTierSortKey,
} from '../../utils/routeVisualStyles';
import {
  animationSpeedForRoute,
  getRouteLineOpacity,
  type RouteVisualContext,
} from '../../utils/routeVisualState';
import { getCachedRoutePath, routePathCacheKey } from '../../utils/routePathCache';
import { zoomRevealMultiplier } from '../../utils/routeZoomReveal';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import { getResolvedMapTheme, useMapThemeRevision } from '../../utils/mapThemeUtils';
import {
  applyRouteHover,
  applyRouteSelected,
  buildPremiumCorridorPath,
  createParticleEngine,
  addRouteParticles,
  startParticleAnimation,
  stopParticleAnimation,
  setParticleRouteFocus,
  particleCountForRoute,
  renderPremiumRoute,
  type RouteGlowBundle,
} from '../../routes';

interface LeafletRouteLayerProps {
  routes: BusinessRouteDef[];
  cityMap: Map<string, MapCityRecord>;
  selectedCountryCode?: string;
  selectedCityId?: string;
  selectedRouteId?: string;
  onRouteSelect?: (route: BusinessRouteDef) => void;
}

function cityCoordLookup(
  cityMap: Map<string, MapCityRecord>,
): Map<string, { lat: number; lng: number }> {
  const lookup = new Map<string, { lat: number; lng: number }>();
  cityMap.forEach((c, id) => lookup.set(id, { lat: c.lat, lng: c.lng }));
  return lookup;
}

export const LeafletRouteLayer = memo(function LeafletRouteLayer({
  routes,
  cityMap,
  selectedCountryCode,
  selectedCityId,
  selectedRouteId,
  onRouteSelect,
}: LeafletRouteLayerProps) {
  const map = useMap();
  const { zoom } = useLeafletMapViewport();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const themeRev = useMapThemeRevision();
  const onSelectRef = useRef(onRouteSelect);
  onSelectRef.current = onRouteSelect;
  const hoveredRef = useRef<string | null>(null);

  useEffect(() => {
    const isLight = getResolvedMapTheme() === 'light';
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;
    const coordLookup = cityCoordLookup(cityMap);
    const particleEngine = createParticleEngine();
    setParticleRouteFocus(particleEngine, { selectedRouteId: selectedRouteId ?? null, hoveredRouteId: null });

    const visualCtx: RouteVisualContext = { selectedCountryCode, selectedCityId, selectedRouteId };
    const bundleByRoute = new Map<string, RouteGlowBundle>();
    let particleGlobal = 0;

    let visible = filterRoutesByZoom(routes, cityMap, zoom, selectedCountryCode, selectedCityId);
    const densityScale = routeDensityOpacity(visible.length);

    visible = [...visible].sort((a, b) => {
      const tierDiff = routeVisualTierSortKey(a) - routeVisualTierSortKey(b);
      if (tierDiff !== 0) return tierDiff;
      return getRouteLineOpacity(a, visualCtx) - getRouteLineOpacity(b, visualCtx);
    });

    const applyHover = (routeId: string | null) => {
      hoveredRef.current = routeId;
      setParticleRouteFocus(particleEngine, { hoveredRouteId: routeId });
      bundleByRoute.forEach((bundle, id) => {
        applyRouteHover(bundle, id === routeId);
      });
    };

    visible.forEach((route, idx) => {
      const from = cityMap.get(route.fromCityId)!;
      const to = cityMap.get(route.toCityId)!;
      const scope = getRouteScope(route);
      const isSelected = route.id === selectedRouteId;
      const highlighted =
        isSelected ||
        (!!selectedCityId &&
          (route.fromCityId === selectedCityId || route.toCityId === selectedCityId));

      const focusOpacity = getRouteLineOpacity(route, visualCtx);
      const visual = getRouteVisualStyle(route.mode, route, highlighted, isLight);
      const color = corridorStrokeColor(route.mode, route);
      const reveal = zoomRevealMultiplier(route, zoom);
      const lineOpacity = Math.min(
        0.98,
        visual.baseOpacity * densityScale * focusOpacity * reveal,
      );

      const cacheKey = `${routePathCacheKey(route.id, zoom, route.mode)}|bezier`;
      const latlngs = getCachedRoutePath(cacheKey, () =>
        buildPremiumCorridorPath(
          { id: route.fromCityId, lat: from.lat, lng: from.lng },
          { id: route.toCityId, lat: to.lat, lng: to.lng },
          coordLookup,
          route.mode,
          scope,
          zoom,
        ),
      );

      const bundle = renderPremiumRoute({
        group,
        route,
        latlngs,
        color,
        visual,
        lineOpacity,
        highlighted,
        selected: isSelected,
        mode: route.mode,
      });
      bundleByRoute.set(route.id, bundle);

      if (isSelected) applyRouteSelected(bundle, true);

      bundle.mainLine.bindTooltip(buildRouteTooltipHtml(route, cityMap), {
        sticky: true,
        className: 'ebh-route-leaflet-tooltip',
        opacity: 1,
      });

      bundle.mainLine.on('mouseover', () => applyHover(route.id));
      bundle.mainLine.on('mouseout', () => applyHover(null));
      bundle.mainLine.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current?.(route);
      });

      const pCount = particleCountForRoute(route, zoom, particleGlobal);
      if (pCount > 0) {
        const baseSpeed = animationSpeedForRoute(route, from, to);
        addRouteParticles(
          particleEngine,
          group,
          latlngs,
          color,
          route.mode,
          pCount,
          baseSpeed,
          bundle.level,
          route.id,
          (idx * 0.07 + 0.1) % 1,
          !!route.aiRecommended,
        );
        particleGlobal += pCount;
      }
    });

    startParticleAnimation(particleEngine);

    return () => {
      stopParticleAnimation(particleEngine);
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map, routes, cityMap, themeRev, zoom, selectedCountryCode, selectedCityId, selectedRouteId]);

  return null;
});
