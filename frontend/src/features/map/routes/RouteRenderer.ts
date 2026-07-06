import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import type { BusinessRouteDef, TransportMode } from '../types/mapTypes';
import type { RouteVisualStyle } from '../utils/routeVisualStyles';
import { offsetPathPerpendicular } from '../utils/routeGeometry';
import { basePathColor, innerCoreColor } from '../utils/mapRouteStyles';
import { getRouteRenderLevel, LEVEL_STYLE, tierToLevelClass, type RouteRenderLevel } from './routeLevels';
import { addRouteDirectionMarkers } from './routeDirectionMarkers';

export interface RouteGlowBundle {
  basePath: L.Polyline;
  mainLine: L.Polyline;
  innerCore?: L.Polyline;
  outerGlow: L.Polyline;
  atmoGlow: L.Polyline;
  railBg?: L.Polyline;
  directionMarkers: L.CircleMarker[];
  baseWeight: number;
  baseOpacity: number;
  color: string;
  routeId: string;
  level: RouteRenderLevel;
  isSelected: boolean;
}

export interface RenderRouteOptions {
  group: L.LayerGroup;
  route: BusinessRouteDef;
  latlngs: LatLngTuple[];
  color: string;
  visual: RouteVisualStyle;
  lineOpacity: number;
  highlighted: boolean;
  selected: boolean;
  mode: TransportMode;
}

export function renderPremiumRoute(opts: RenderRouteOptions): RouteGlowBundle {
  const { group, route, latlngs, color, visual, lineOpacity, highlighted, selected, mode } = opts;
  const level = getRouteRenderLevel(route);
  const levelCfg = LEVEL_STYLE[level];
  const isPartnership = route.businessPurpose === 'trade' && !route.aiRecommended;
  const isAi = !!route.aiRecommended;

  let weight = visual.weight * levelCfg.weightScale;
  if (highlighted) weight *= 1.08;
  if (selected) weight *= 1.14;

  const opacity = Math.min(0.98, lineOpacity * levelCfg.opacityScale * (selected ? 1.12 : 1));
  const levelClass = tierToLevelClass(visual.tier);
  const typeClass = isAi
    ? 'ebh-route-ai'
    : isPartnership
      ? 'ebh-route-partnership'
      : `ebh-route-${mode}`;

  const stateClass = `${highlighted ? ' ebh-route-active' : ''}${selected ? ' ebh-route-selected' : ''}`;
  const classBase = `ebh-route ${typeClass} ${levelClass} ebh-route-tier-${visual.tier}${stateClass}`;

  const shared: L.PolylineOptions = {
    color,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: 1.5,
    interactive: false,
  };

  const basePath = L.polyline(latlngs, {
    ...shared,
    color: basePathColor(mode),
    weight: weight + levelCfg.glowAtmo + 1.2,
    opacity: opacity * 0.14,
    className: `${classBase} ebh-route-base`,
  }).addTo(group);

  const atmoGlow = L.polyline(latlngs, {
    ...shared,
    weight: weight + levelCfg.glowAtmo,
    opacity: opacity * 0.14,
    className: `${classBase} ebh-route-glow-atmo`,
  }).addTo(group);

  const outerGlow = L.polyline(latlngs, {
    ...shared,
    weight: weight + levelCfg.glowOuter,
    opacity: opacity * 0.32,
    className: `${classBase} ebh-route-glow-outer`,
  }).addTo(group);

  let mainLine: L.Polyline;
  let innerCore: L.Polyline | undefined;
  let railBg: L.Polyline | undefined;

  if (visual.railDoubleTrack && !isPartnership) {
    const trackWeight = Math.max(1.1, weight * 0.42);
    const off = visual.railTrackOffset;
    railBg = L.polyline(offsetPathPerpendicular(latlngs, off), {
      ...shared,
      weight: trackWeight,
      opacity: opacity * 0.75,
      className: `${classBase} ebh-route-rail-track-bg`,
    }).addTo(group);

    mainLine = L.polyline(offsetPathPerpendicular(latlngs, -off), {
      color,
      weight: trackWeight,
      opacity,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.5,
      className: `${classBase} ebh-route-rail-track ebh-route-core`,
      interactive: true,
    }).addTo(group);

    innerCore = L.polyline(offsetPathPerpendicular(latlngs, -off * 0.5), {
      color: innerCoreColor(mode, color, isAi),
      weight: Math.max(0.6, trackWeight * 0.35),
      opacity: Math.min(0.95, opacity * 1.1),
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.5,
      className: `${classBase} ebh-route-inner-core`,
      interactive: false,
    }).addTo(group);
  } else {
    mainLine = L.polyline(latlngs, {
      color: isPartnership ? '#e8eef4' : color,
      weight: isPartnership ? Math.max(0.8, weight * 0.55) : weight,
      opacity: isPartnership ? opacity * 0.72 : opacity,
      dashArray: visual.dashArray,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.5,
      className: `${classBase} ebh-route-core`,
      interactive: true,
    }).addTo(group);

    if (!isPartnership) {
      innerCore = L.polyline(latlngs, {
        color: innerCoreColor(mode, color, isAi),
        weight: Math.max(0.5, weight * 0.28),
        opacity: Math.min(0.92, opacity * 1.05),
        dashArray: visual.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        smoothFactor: 1.5,
        className: `${classBase} ebh-route-inner-core`,
        interactive: false,
      }).addTo(group);
    }
  }

  const directionMarkers = addRouteDirectionMarkers(group, latlngs, color, level);

  return {
    basePath,
    mainLine,
    innerCore,
    outerGlow,
    atmoGlow,
    railBg,
    directionMarkers,
    baseWeight: weight,
    baseOpacity: opacity,
    color,
    routeId: route.id,
    level,
    isSelected: selected,
  };
}

function applyRouteFocus(bundle: RouteGlowBundle, hovered: boolean, selected: boolean): void {
  const w = bundle.baseWeight;
  const o = bundle.baseOpacity;
  const levelCfg = LEVEL_STYLE[bundle.level];

  if (selected) {
    const sw = w + 0.65;
    const so = Math.min(0.99, o * 1.28);
    bundle.mainLine.setStyle({ weight: sw, opacity: so });
    bundle.innerCore?.setStyle({ opacity: Math.min(0.98, so * 1.08) });
    bundle.outerGlow.setStyle({ weight: sw + levelCfg.glowOuter + 1.4, opacity: so * 0.48 });
    bundle.atmoGlow.setStyle({ weight: sw + levelCfg.glowAtmo + 2, opacity: so * 0.22 });
    bundle.basePath.setStyle({ opacity: so * 0.2 });
    bundle.mainLine.getElement()?.classList.add('ebh-route-selected');
    bundle.mainLine.getElement()?.classList.remove('ebh-route-hovered');
    return;
  }

  if (hovered) {
    const hw = w + 0.45;
    const ho = Math.min(0.99, o * 1.18);
    bundle.mainLine.setStyle({ weight: hw, opacity: ho });
    bundle.innerCore?.setStyle({ opacity: Math.min(0.95, ho * 1.05) });
    bundle.outerGlow.setStyle({ weight: hw + levelCfg.glowOuter + 0.8, opacity: ho * 0.42 });
    bundle.atmoGlow.setStyle({ weight: hw + levelCfg.glowAtmo + 1.2, opacity: ho * 0.18 });
    bundle.basePath.setStyle({ opacity: ho * 0.17 });
    bundle.mainLine.getElement()?.classList.add('ebh-route-hovered');
    bundle.mainLine.getElement()?.classList.remove('ebh-route-selected');
    return;
  }

  bundle.mainLine.setStyle({ weight: w, opacity: o });
  bundle.innerCore?.setStyle({ opacity: Math.min(0.92, o * 1.05) });
  bundle.outerGlow.setStyle({ weight: w + levelCfg.glowOuter, opacity: o * 0.32 });
  bundle.atmoGlow.setStyle({ weight: w + levelCfg.glowAtmo, opacity: o * 0.14 });
  bundle.basePath.setStyle({ opacity: o * 0.14 });
  bundle.mainLine.getElement()?.classList.remove('ebh-route-hovered', 'ebh-route-selected');
}

export function applyRouteHover(bundle: RouteGlowBundle, hovered: boolean): void {
  applyRouteFocus(bundle, hovered, bundle.isSelected);
}

export function applyRouteSelected(bundle: RouteGlowBundle, selected: boolean): void {
  bundle.isSelected = selected;
  applyRouteFocus(bundle, false, selected);
}
