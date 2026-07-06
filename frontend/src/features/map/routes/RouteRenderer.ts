import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import type { BusinessRouteDef, TransportMode } from '../types/mapTypes';
import type { RouteVisualStyle } from '../utils/routeVisualStyles';
import { offsetPathPerpendicular } from '../utils/routeGeometry';
import { basePathColor, innerCoreColor, glowBloomColor } from '../utils/mapRouteStyles';
import { getRouteRenderLevel, LEVEL_STYLE, tierToLevelClass, type RouteRenderLevel } from './routeLevels';
import { addRouteDirectionMarkers } from './routeDirectionMarkers';

const MAX_CORE_WEIGHT: Record<RouteRenderLevel, number> = { 1: 3, 2: 2, 3: 1 };

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

  let weight = Math.min(visual.weight * levelCfg.weightScale, MAX_CORE_WEIGHT[level]);
  if (highlighted) weight = Math.min(MAX_CORE_WEIGHT[level] + 0.2, weight + 0.12);
  if (selected) weight = Math.min(MAX_CORE_WEIGHT[level] + 0.35, weight + 0.22);

  const opacity = Math.min(0.92, lineOpacity * levelCfg.opacityScale * (selected ? 1.08 : 1));
  const levelClass = tierToLevelClass(visual.tier);
  const typeClass = isAi
    ? 'ebh-route-ai'
    : isPartnership
      ? 'ebh-route-partnership'
      : `ebh-route-${mode}`;

  const stateClass = `${highlighted ? ' ebh-route-active' : ''}${selected ? ' ebh-route-selected' : ''}`;
  const classBase = `ebh-route ${typeClass} ${levelClass} ebh-route-tier-${visual.tier}${stateClass}`;

  const bloomColor = glowBloomColor(mode, color, isAi);
  const shared: L.PolylineOptions = {
    color: bloomColor,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: 2.2,
    interactive: false,
  };

  const basePath = L.polyline(latlngs, {
    ...shared,
    color: basePathColor(mode),
    weight: weight + levelCfg.glowAtmo + 0.5,
    opacity: opacity * 0.05,
    className: `${classBase} ebh-route-base`,
  }).addTo(group);

  const atmoGlow = L.polyline(latlngs, {
    ...shared,
    color: bloomColor,
    weight: weight + levelCfg.glowAtmo,
    opacity: opacity * (level === 1 ? 0.09 : 0.06),
    className: `${classBase} ebh-route-glow-atmo`,
  }).addTo(group);

  const outerGlow = L.polyline(latlngs, {
    ...shared,
    color: bloomColor,
    weight: weight + levelCfg.glowOuter,
    opacity: opacity * (level === 1 ? 0.16 : 0.11),
    className: `${classBase} ebh-route-glow-outer`,
  }).addTo(group);

  let mainLine: L.Polyline;
  let innerCore: L.Polyline | undefined;
  let railBg: L.Polyline | undefined;

  if (visual.railDoubleTrack && !isPartnership) {
    const trackWeight = Math.max(0.8, weight * 0.38);
    const off = visual.railTrackOffset;
    railBg = L.polyline(offsetPathPerpendicular(latlngs, off), {
      ...shared,
      weight: trackWeight,
      opacity: opacity * 0.45,
      className: `${classBase} ebh-route-rail-track-bg`,
    }).addTo(group);

    mainLine = L.polyline(offsetPathPerpendicular(latlngs, -off), {
      color,
      weight: trackWeight,
      opacity,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 2.2,
      className: `${classBase} ebh-route-rail-track ebh-route-core`,
      interactive: true,
    }).addTo(group);

    innerCore = L.polyline(offsetPathPerpendicular(latlngs, -off * 0.5), {
      color: innerCoreColor(mode, color, isAi),
      weight: Math.max(0.35, trackWeight * 0.32),
      opacity: Math.min(0.88, opacity * 1.05),
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.5,
      className: `${classBase} ebh-route-inner-core`,
      interactive: false,
    }).addTo(group);
  } else {
    mainLine = L.polyline(latlngs, {
      color: isPartnership ? 'rgba(255,255,255,0.65)' : color,
      weight: isPartnership ? Math.max(0.65, weight * 0.5) : weight,
      opacity: isPartnership ? opacity * 0.58 : opacity,
      dashArray: visual.dashArray,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 2.2,
      className: `${classBase} ebh-route-core`,
      interactive: true,
    }).addTo(group);

    if (!isPartnership) {
      innerCore = L.polyline(latlngs, {
        color: innerCoreColor(mode, color, isAi),
        weight: Math.max(0.35, weight * 0.22),
        opacity: Math.min(0.85, opacity * 0.95),
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
    const sw = Math.min(MAX_CORE_WEIGHT[bundle.level] + 0.35, w + 0.22);
    const so = Math.min(0.94, o * 1.14);
    bundle.mainLine.setStyle({ weight: sw, opacity: so });
    bundle.innerCore?.setStyle({ opacity: Math.min(0.9, so * 1.04) });
    bundle.outerGlow.setStyle({ weight: sw + levelCfg.glowOuter + 0.6, opacity: so * 0.22 });
    bundle.atmoGlow.setStyle({ weight: sw + levelCfg.glowAtmo + 0.8, opacity: so * 0.1 });
    bundle.basePath.setStyle({ opacity: so * 0.08 });
    bundle.mainLine.getElement()?.classList.add('ebh-route-selected');
    bundle.mainLine.getElement()?.classList.remove('ebh-route-hovered');
    return;
  }

  if (hovered) {
    const hw = Math.min(MAX_CORE_WEIGHT[bundle.level] + 0.2, w + 0.12);
    const ho = Math.min(0.9, o * 1.1);
    bundle.mainLine.setStyle({ weight: hw, opacity: ho });
    bundle.innerCore?.setStyle({ opacity: Math.min(0.88, ho * 1.02) });
    bundle.outerGlow.setStyle({ weight: hw + levelCfg.glowOuter + 0.4, opacity: ho * 0.18 });
    bundle.atmoGlow.setStyle({ weight: hw + levelCfg.glowAtmo + 0.5, opacity: ho * 0.09 });
    bundle.basePath.setStyle({ opacity: ho * 0.07 });
    bundle.mainLine.getElement()?.classList.add('ebh-route-hovered');
    bundle.mainLine.getElement()?.classList.remove('ebh-route-selected');
    return;
  }

  bundle.mainLine.setStyle({ weight: w, opacity: o });
  bundle.innerCore?.setStyle({ opacity: Math.min(0.85, o * 0.95) });
  bundle.outerGlow.setStyle({ weight: w + levelCfg.glowOuter, opacity: o * 0.14 });
  bundle.atmoGlow.setStyle({ weight: w + levelCfg.glowAtmo, opacity: o * 0.07 });
  bundle.basePath.setStyle({ opacity: o * 0.06 });
  bundle.mainLine.getElement()?.classList.remove('ebh-route-hovered', 'ebh-route-selected');
}

export function applyRouteHover(bundle: RouteGlowBundle, hovered: boolean): void {
  applyRouteFocus(bundle, hovered, bundle.isSelected);
}

export function applyRouteSelected(bundle: RouteGlowBundle, selected: boolean): void {
  bundle.isSelected = selected;
  applyRouteFocus(bundle, false, selected);
}
