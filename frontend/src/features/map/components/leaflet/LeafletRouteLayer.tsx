import { memo, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusinessRouteDef, MapCityRecord, TransportMode } from '../../types/mapTypes';
import { buildCorridorPath, offsetPathPerpendicular } from '../../utils/routeGeometry';
import { filterRoutesByZoom, routeDensityOpacity } from '../../utils/routeVisibilityUtils';
import { getRouteScope } from '../../data/routeCityIndex';
import { buildRouteTooltipHtml } from '../../data/routeMetadata';
import {
  corridorStrokeColor,
  getRouteVisualStyle,
  routeTierZIndexOffset,
  routeVisualTierSortKey,
} from '../../utils/routeVisualStyles';
import {
  animationSpeedForRoute,
  freightPulseCount,
  getRouteLineOpacity,
  shouldShowVehicle,
  type RouteVisualContext,
} from '../../utils/routeVisualState';
import {
  canAnimateSeaVehicle,
  createVehicleDivIcon,
  isPortCity,
  resolveVehicleIcon,
} from '../../utils/routeVehicleIcons';
import { getCachedRoutePath, routePathCacheKey } from '../../utils/routePathCache';
import { interpolateAlongPath, speedMultiplierAt } from '../../utils/routeAnimation';
import { zoomRevealMultiplier } from '../../utils/routeZoomReveal';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import { getResolvedMapTheme, useMapThemeRevision } from '../../utils/mapThemeUtils';

interface LeafletRouteLayerProps {
  routes: BusinessRouteDef[];
  cityMap: Map<string, MapCityRecord>;
  selectedCountryCode?: string;
  selectedCityId?: string;
  selectedRouteId?: string;
  onRouteSelect?: (route: BusinessRouteDef) => void;
}

type Animator =
  | {
      kind: 'vehicle';
      marker: L.Marker;
      points: L.LatLngTuple[];
      progress: number;
      speed: number;
      mode: TransportMode;
      routeId: string;
    }
  | {
      kind: 'freight';
      marker: L.CircleMarker;
      points: L.LatLngTuple[];
      progress: number;
      speed: number;
      mode: TransportMode;
    };

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
  const animRef = useRef<number>(0);
  const themeRev = useMapThemeRevision();
  const onSelectRef = useRef(onRouteSelect);
  onSelectRef.current = onRouteSelect;

  useEffect(() => {
    const isLight = getResolvedMapTheme() === 'light';
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;
    const coordLookup = cityCoordLookup(cityMap);

    const visualCtx: RouteVisualContext = { selectedCountryCode, selectedCityId, selectedRouteId };
    const animators: Animator[] = [];
    const lineByRoute = new Map<string, L.Polyline>();
    const vehicleByRoute = new Map<string, L.Marker>();
    let hoveredRouteId: string | null = null;
    let vehicleCount = 0;
    let pulseCount = 0;

    let visible = filterRoutesByZoom(routes, cityMap, zoom, selectedCountryCode, selectedCityId);
    const densityScale = routeDensityOpacity(visible.length);

    visible = [...visible].sort((a, b) => {
      const tierDiff = routeVisualTierSortKey(a) - routeVisualTierSortKey(b);
      if (tierDiff !== 0) return tierDiff;
      return getRouteLineOpacity(a, visualCtx) - getRouteLineOpacity(b, visualCtx);
    });

    const applyHover = (routeId: string | null) => {
      hoveredRouteId = routeId;
      lineByRoute.forEach((line, id) => {
        const meta = line.options as L.PolylineOptions & { _ebhBase?: { w: number; o: number } };
        const base = meta._ebhBase;
        if (!base) return;
        if (id === routeId) {
          line.setStyle({ weight: base.w + 0.25, opacity: Math.min(0.98, base.o * 1.06) });
        } else {
          line.setStyle({ weight: base.w, opacity: base.o });
        }
      });
      vehicleByRoute.forEach((marker, id) => {
        const el = marker.getElement();
        if (!el) return;
        el.classList.toggle('ebh-vehicle-hover', id === routeId);
      });
    };

    visible.forEach((route, idx) => {
      const from = cityMap.get(route.fromCityId)!;
      const to = cityMap.get(route.toCityId)!;
      const scope = getRouteScope(route);
      const highlighted =
        route.id === selectedRouteId ||
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

      const cacheKey = routePathCacheKey(route.id, zoom, route.mode);
      const latlngs = getCachedRoutePath(cacheKey, () =>
        buildCorridorPath(
          { id: route.fromCityId, lat: from.lat, lng: from.lng },
          { id: route.toCityId, lat: to.lat, lng: to.lng },
          coordLookup,
          route.mode,
          scope,
          zoom,
        ),
      );

      const classBase = `ebh-route ebh-route-${route.mode} ebh-route-tier-${visual.tier}${highlighted ? ' ebh-route-active' : ''}${route.id === selectedRouteId ? ' ebh-route-locked' : ''}`;
      const zBase = routeTierZIndexOffset(visual.tier);

      const sharedOpts: L.PolylineOptions = {
        color,
        lineCap: 'round',
        lineJoin: 'round',
        smoothFactor: 0,
      };

      let mainLine: L.Polyline;

      if (visual.railDoubleTrack) {
        const trackWeight = Math.max(1.05, visual.weight * 0.4);
        const off = visual.railTrackOffset;

        L.polyline(offsetPathPerpendicular(latlngs, off), {
          ...sharedOpts,
          weight: trackWeight,
          opacity: lineOpacity * 0.85,
          className: `${classBase} ebh-route-rail-track-bg`,
          interactive: false,
        }).addTo(group);

        mainLine = L.polyline(offsetPathPerpendicular(latlngs, -off), {
          ...sharedOpts,
          weight: trackWeight,
          opacity: lineOpacity,
          className: `${classBase} ebh-route-rail-track`,
          interactive: true,
        }).addTo(group);
      } else {
        mainLine = L.polyline(latlngs, {
          ...sharedOpts,
          weight: visual.weight,
          opacity: lineOpacity,
          dashArray: visual.dashArray,
          className: classBase,
          interactive: true,
        }).addTo(group);
      }

      (mainLine.options as L.PolylineOptions & { _ebhBase?: { w: number; o: number } })._ebhBase = {
        w: visual.weight,
        o: lineOpacity,
      };
      lineByRoute.set(route.id, mainLine);

      mainLine.bindTooltip(buildRouteTooltipHtml(route, cityMap), {
        sticky: true,
        className: 'ebh-route-leaflet-tooltip',
        opacity: 1,
      });

      mainLine.on('mouseover', () => applyHover(route.id));
      mainLine.on('mouseout', () => applyHover(null));
      mainLine.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current?.(route);
      });

      const pulses = freightPulseCount(route, zoom, pulseCount);
      pulseCount += pulses;
      const baseSpeed = animationSpeedForRoute(route, from, to);
      for (let p = 0; p < pulses; p++) {
        const pulse = L.circleMarker(latlngs[0], {
          radius: visual.tier === 'trunk' ? 2 : 1.5,
          fillColor: color,
          fillOpacity: visual.tier === 'trunk' ? 0.45 : 0.32,
          color: 'transparent',
          weight: 0,
          className: 'ebh-freight-marker',
          interactive: false,
        }).addTo(group);
        animators.push({
          kind: 'freight',
          marker: pulse,
          points: latlngs,
          progress: (0.3 + idx * 0.05) % 1,
          speed: baseSpeed * 0.9,
          mode: route.mode,
        });
      }

      if (
        shouldShowVehicle(route, { ...visualCtx, hoveredRouteId }, zoom, vehicleCount) &&
        canAnimateSeaVehicle(route, route.fromCityId, route.toCityId)
      ) {
        const vehicleKind = resolveVehicleIcon(route);
        const startIdx =
          route.mode === 'sea' && isPortCity(route.fromCityId) ? 0
          : route.mode === 'sea' && isPortCity(route.toCityId) ? latlngs.length - 1
          : 0;
        const start = latlngs[startIdx];
        const vehicle = L.marker(start, {
          icon: createVehicleDivIcon(vehicleKind, color, highlighted ? 1.04 : 1),
          interactive: false,
          zIndexOffset: zBase + 120,
        }).addTo(group);
        vehicleByRoute.set(route.id, vehicle);
        vehicleCount += 1;

        animators.push({
          kind: 'vehicle',
          marker: vehicle,
          points: latlngs,
          progress: ((idx * 0.09 + 0.14) % 1),
          speed: baseSpeed,
          mode: route.mode,
          routeId: route.id,
        });
      }
    });

    const tick = () => {
      animators.forEach((a) => {
        const mult = speedMultiplierAt(a.mode, a.progress);
        a.progress = (a.progress + a.speed * mult) % 1;
        a.marker.setLatLng(interpolateAlongPath(a.points, a.progress));
      });
      animRef.current = requestAnimationFrame(tick);
    };
    if (animators.length > 0) animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map, routes, cityMap, themeRev, zoom, selectedCountryCode, selectedCityId, selectedRouteId]);

  return null;
});
