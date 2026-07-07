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
  isRouteHoverHighlighted,
  type RouteVisualContext,
} from '../../utils/routeVisualState';
import { getCachedRoutePath, routePathCacheKey } from '../../utils/routePathCache';
import { zoomRevealMultiplier } from '../../utils/routeZoomReveal';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import { isMobileViewport } from '../../utils/cityVisibilityUtils';
import {
  useMapMobileInteractionSelector,
} from '../../store/mapMobileInteractionStore';
import { getResolvedMapTheme, useMapThemeRevision } from '../../utils/mapThemeUtils';
import {
  acquireRouteCanvasRenderer,
  isMapAlive,
  purgeOrphanedRouteDom,
  releaseRouteCanvasRenderer,
  safeClearGroup,
} from '../../utils/mapLayerLifecycle';
import {
  canRenderAirRoute,
  canRenderSeaRoute,
  routeMotionVisibleAtZoom,
} from '../../utils/routeVehicleIcons';
import {
  applyRouteHover,
  applyRouteSelected,
  buildPremiumCorridorPath,
  createParticleEngine,
  addRouteParticles,
  startParticleAnimation,
  stopParticleAnimation,
  pauseParticleAnimation,
  resumeParticleAnimation,
  stopAllParticleAnimation,
  setParticleRouteFocus,
  particleCountForRoute,
} from '../../routes';
import {
  renderPremiumRoute,
  refineVisibleRoutePath,
  resolveVisibleRouteColor,
  type RouteGlowBundle,
} from '../../routes/RouteRenderer';
import {
  DEFAULT_ACTIVE_MAP_CONTEXT,
  type ActiveMapContext,
} from '../../utils/mapLayerContext';
import { resolveRouteEmphasis } from '../../utils/mapVisualModes';

function dedupeVisibleRoutes(routes: BusinessRouteDef[]): BusinessRouteDef[] {
  const seen = new Set<string>();
  const out: BusinessRouteDef[] = [];
  for (const route of routes) {
    const key = `${route.fromCityId}|${route.toCityId}|${route.mode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(route);
  }
  return out;
}

interface LeafletRouteLayerProps {
  routes: BusinessRouteDef[];
  cityMap: Map<string, MapCityRecord>;
  selectedCountryCode?: string;
  selectedCityId?: string;
  hoveredCityId?: string;
  hoveredCountryCode?: string;
  selectedRouteId?: string;
  onRouteSelect?: (route: BusinessRouteDef) => void;
  activeMapContext?: ActiveMapContext;
}

function cityCoordLookup(
  cityMap: Map<string, MapCityRecord>,
): Map<string, { lat: number; lng: number }> {
  const lookup = new Map<string, { lat: number; lng: number }>();
  cityMap.forEach((c, id) => lookup.set(id, { lat: c.lat, lng: c.lng }));
  return lookup;
}

function isRenderableCorridor(route: BusinessRouteDef): boolean {
  if (route.mode === 'sea') {
    return canRenderSeaRoute(route.fromCityId, route.toCityId);
  }
  if (route.mode === 'air') {
    return canRenderAirRoute(route.fromCityId, route.toCityId);
  }
  return true;
}

function detachRouteBundles(bundles: Iterable<RouteGlowBundle>): void {
  for (const bundle of bundles) {
    try {
      bundle.mainLine.off();
      bundle.mainLine.unbindTooltip();
    } catch {
      // layer already removed
    }
  }
}

export const LeafletRouteLayer = memo(function LeafletRouteLayer({
  routes,
  cityMap,
  selectedCountryCode,
  selectedCityId,
  hoveredCityId,
  hoveredCountryCode,
  selectedRouteId,
  onRouteSelect,
  activeMapContext = DEFAULT_ACTIVE_MAP_CONTEXT,
}: LeafletRouteLayerProps) {
  const map = useMap();
  const { zoom } = useLeafletMapViewport();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const themeRev = useMapThemeRevision();
  const onSelectRef = useRef(onRouteSelect);
  onSelectRef.current = onRouteSelect;
  const hoveredRef = useRef<string | null>(null);
  const particleEngineRef = useRef<ReturnType<typeof createParticleEngine> | null>(null);
  const mobileInteracting = useMapMobileInteractionSelector((s) => s.interacting);

  useEffect(() => {
    const engine = particleEngineRef.current;
    if (!engine || !isMobileViewport()) return;
    if (mobileInteracting) {
      pauseParticleAnimation(engine);
    } else {
      resumeParticleAnimation(engine);
    }
  }, [mobileInteracting]);

  useEffect(() => {
    if (!isMapAlive(map)) return;

    let effectActive = true;
    purgeOrphanedRouteDom(map);

    if (groupRef.current) {
      safeClearGroup(map, groupRef.current);
      groupRef.current = null;
    }

    const canvasRenderer = acquireRouteCanvasRenderer(map);
    if (!canvasRenderer) return;

    const group = L.layerGroup().addTo(map);
    groupRef.current = group;

    const isLight = getResolvedMapTheme() === 'light';
    const coordLookup = cityCoordLookup(cityMap);
    const particleEngine = createParticleEngine();
    particleEngineRef.current = particleEngine;
    setParticleRouteFocus(particleEngine, {
      selectedRouteId: selectedRouteId ?? null,
      hoveredRouteId: null,
    });

    const visualCtx: RouteVisualContext = {
      selectedCountryCode,
      selectedCityId,
      selectedRouteId,
      hoveredCityId,
      hoveredCountryCode,
    };
    const bundleByRoute = new Map<string, RouteGlowBundle>();
    let particleGlobal = 0;
    const showMotion = routeMotionVisibleAtZoom(zoom);

    const corridorRoutes = routes.filter(isRenderableCorridor);
    let visible = dedupeVisibleRoutes(
      filterRoutesByZoom(corridorRoutes, cityMap, zoom, selectedCountryCode, selectedCityId),
    );
    const densityScale = routeDensityOpacity(visible.length);

    visible = [...visible].sort((a, b) => {
      const tierDiff = routeVisualTierSortKey(a) - routeVisualTierSortKey(b);
      if (tierDiff !== 0) return tierDiff;
      return getRouteLineOpacity(a, visualCtx) - getRouteLineOpacity(b, visualCtx);
    });

    const applyHover = (routeId: string | null) => {
      if (!effectActive) return;
      hoveredRef.current = routeId;
      setParticleRouteFocus(particleEngine, { hoveredRouteId: routeId });
      bundleByRoute.forEach((bundle, id) => {
        applyRouteHover(bundle, id === routeId);
      });
    };

    for (const [idx, route] of visible.entries()) {
      if (!effectActive || !isMapAlive(map)) break;

      const from = cityMap.get(route.fromCityId);
      const to = cityMap.get(route.toCityId);
      if (!from || !to) continue;

      const scope = getRouteScope(route);
      const isSelected = route.id === selectedRouteId;
      const highlighted = isRouteHoverHighlighted(route, visualCtx);

      const focusOpacity = getRouteLineOpacity(route, visualCtx);
      const visual = getRouteVisualStyle(route.mode, route, highlighted, isLight);
      const baseColor = corridorStrokeColor(route.mode, route);
      const color = resolveVisibleRouteColor(route.mode, route, isLight, baseColor);
      const reveal = zoomRevealMultiplier(route, zoom);
      let lineOpacity = Math.min(
        0.98,
        visual.baseOpacity * densityScale * focusOpacity * reveal,
      );
      lineOpacity = Math.min(
        0.98,
        lineOpacity * resolveRouteEmphasis(route, activeMapContext, visible),
      );
      if (isLight) {
        lineOpacity = Math.max(0.74, Math.min(0.98, lineOpacity * 1.18));
      }

      const cacheKey = `${routePathCacheKey(route.id, zoom, route.mode)}|corridor-v5`;
      const latlngs = getCachedRoutePath(cacheKey, () => {
        const corridor = buildPremiumCorridorPath(
          { id: route.fromCityId, lat: from.lat, lng: from.lng },
          { id: route.toCityId, lat: to.lat, lng: to.lng },
          coordLookup,
          route.mode,
          scope,
          zoom,
        );
        return refineVisibleRoutePath(corridor, route, route.mode, scope, zoom);
      });

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
        themeIsLight: isLight,
        renderer: canvasRenderer,
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

      const pCount = showMotion ? particleCountForRoute(route, zoom, particleGlobal) : 0;
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
          (idx * 0.09 + 0.12) % 1,
          !!route.aiRecommended,
        );
        particleGlobal += pCount;
      }
    }

    if (effectActive && isMapAlive(map)) {
      startParticleAnimation(particleEngine);
    } else {
      stopParticleAnimation(particleEngine);
    }

    return () => {
      effectActive = false;
      if (particleEngineRef.current === particleEngine) {
        particleEngineRef.current = null;
      }
      stopParticleAnimation(particleEngine);
      detachRouteBundles(bundleByRoute.values());
      safeClearGroup(map, group);
      if (groupRef.current === group) {
        groupRef.current = null;
      }
    };
  }, [
    map,
    routes,
    cityMap,
    themeRev,
    zoom,
    selectedCountryCode,
    selectedCityId,
    hoveredCityId,
    hoveredCountryCode,
    selectedRouteId,
    activeMapContext,
  ]);

  useEffect(() => {
    return () => {
      stopAllParticleAnimation();
      if (groupRef.current) {
        safeClearGroup(map, groupRef.current);
        groupRef.current = null;
      }
      releaseRouteCanvasRenderer(map);
      purgeOrphanedRouteDom(map);
    };
  }, [map]);

  return null;
});
