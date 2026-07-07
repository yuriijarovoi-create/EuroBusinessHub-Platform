import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import type { BusinessRouteDef, RouteScope, TransportMode } from '../types/mapTypes';
import type { RouteVisualStyle } from '../utils/routeVisualStyles';
import { offsetPathPerpendicular, routeDistanceKm } from '../utils/routeGeometry';
import { innerCoreColor, glowBloomColor } from '../utils/mapRouteStyles';
import { getRouteRenderLevel, LEVEL_STYLE, type RouteRenderLevel } from './routeLevels';
import { addRouteDirectionMarkers } from './routeDirectionMarkers';

const LIGHT_ROUTE_COLORS: Partial<Record<TransportMode, string>> & { ai: string; business: string } = {
  road: '#0284c7',
  rail: '#16a34a',
  air: '#7c3aed',
  sea: '#ea580c',
  river: '#0891b2',
  ai: '#0891b2',
  business: '#334155',
};

const DARK_ROUTE_COLORS: Partial<Record<TransportMode, string>> & { ai: string; business: string } = {
  road: '#00c8ff',
  rail: '#22c55e',
  air: '#a855f7',
  sea: '#f59e0b',
  river: '#06b6d4',
  ai: '#06b6d4',
  business: '#f8fafc',
};

interface ThemeRenderProfile {
  atmoOpacityMult: number;
  outerOpacityMult: number;
  baseOpacityMult: number;
  coreOpacityMin: number;
  coreOpacityMult: number;
}

interface LevelMetrics {
  coreWeight: number;
  innerGlowWeight: number;
  outerGlowWeight: number;
  atmoGlowWeight: number;
}

const LEVEL_METRICS: Record<RouteRenderLevel, LevelMetrics> = {
  1: { coreWeight: 7, innerGlowWeight: 8, outerGlowWeight: 14, atmoGlowWeight: 18 },
  2: { coreWeight: 5, innerGlowWeight: 5, outerGlowWeight: 9, atmoGlowWeight: 12 },
  3: { coreWeight: 3, innerGlowWeight: 3, outerGlowWeight: 6, atmoGlowWeight: 8 },
  4: { coreWeight: 2, innerGlowWeight: 2, outerGlowWeight: 4, atmoGlowWeight: 5 },
};

const THEME_RENDER: Record<'light' | 'dark', Record<RouteRenderLevel, ThemeRenderProfile>> = {
  dark: {
    1: { atmoOpacityMult: 1, outerOpacityMult: 1, baseOpacityMult: 0.05, coreOpacityMin: 0.58, coreOpacityMult: 1 },
    2: { atmoOpacityMult: 1, outerOpacityMult: 1, baseOpacityMult: 0.05, coreOpacityMin: 0.5, coreOpacityMult: 1 },
    3: { atmoOpacityMult: 1, outerOpacityMult: 1, baseOpacityMult: 0.04, coreOpacityMin: 0.42, coreOpacityMult: 1 },
    4: { atmoOpacityMult: 1, outerOpacityMult: 1, baseOpacityMult: 0.04, coreOpacityMin: 0.36, coreOpacityMult: 1 },
  },
  light: {
    1: { atmoOpacityMult: 0.32, outerOpacityMult: 0.42, baseOpacityMult: 0.18, coreOpacityMin: 0.86, coreOpacityMult: 1.28 },
    2: { atmoOpacityMult: 0.28, outerOpacityMult: 0.36, baseOpacityMult: 0.14, coreOpacityMin: 0.8, coreOpacityMult: 1.2 },
    3: { atmoOpacityMult: 0.22, outerOpacityMult: 0.3, baseOpacityMult: 0.11, coreOpacityMin: 0.74, coreOpacityMult: 1.12 },
    4: { atmoOpacityMult: 0.18, outerOpacityMult: 0.26, baseOpacityMult: 0.09, coreOpacityMin: 0.68, coreOpacityMult: 1.06 },
  },
};

export function resolveVisibleRouteColor(
  mode: TransportMode,
  route: BusinessRouteDef,
  themeIsLight: boolean,
  fallbackColor: string,
): string {
  const isAi = !!route.aiRecommended;
  const isPartnership = route.businessPurpose === 'trade' && !isAi;
  const palette = themeIsLight ? LIGHT_ROUTE_COLORS : DARK_ROUTE_COLORS;
  if (isAi) return palette.ai;
  if (isPartnership) return palette.business;
  return palette[mode] ?? fallbackColor;
}

function themeInnerCoreColor(
  mode: TransportMode,
  baseColor: string,
  isAi: boolean,
  themeIsLight: boolean,
): string {
  if (!themeIsLight) return innerCoreColor(mode, baseColor, isAi);
  if (isAi) return '#67e8f9';
  switch (mode) {
    case 'road':
      return '#38bdf8';
    case 'rail':
      return '#4ade80';
    case 'air':
      return '#a78bfa';
    case 'sea':
      return '#fb923c';
    case 'river':
      return '#22d3ee';
    default:
      return baseColor;
  }
}

function themeGlowBloomColor(
  mode: TransportMode,
  baseColor: string,
  isAi: boolean,
  themeIsLight: boolean,
): string {
  if (!themeIsLight) return glowBloomColor(mode, baseColor, isAi);
  if (isAi) return LIGHT_ROUTE_COLORS.ai;
  return baseColor;
}

function themeBasePathColor(themeIsLight: boolean): string {
  return themeIsLight ? '#1e293b' : '#0a1628';
}

function perpendicularOffset(
  p0: LatLngTuple,
  p1: LatLngTuple,
  magnitude: number,
): { lat: number; lng: number } {
  const dLng = p1[1] - p0[1];
  const dLat = p1[0] - p0[0];
  const len = Math.hypot(dLng, dLat) || 1;
  return { lat: (-dLng / len) * magnitude, lng: (dLat / len) * magnitude };
}

function arcBulge(
  mode: TransportMode,
  scope: RouteScope,
  distKm: number,
  span: number,
  zoom: number,
): number {
  const maxDev = span * 0.08;
  let ratio: number;
  if (mode === 'air') {
    ratio = scope === 'europe' && distKm > 400 ? 0.14 : 0.1;
  } else if (mode === 'sea') {
    ratio = distKm > 300 ? 0.08 : 0.055;
  } else if (mode === 'river') {
    ratio = 0.04;
  } else {
    ratio = distKm < 120 ? 0.03 : distKm < 350 ? 0.05 : 0.07;
  }
  let bulge = Math.min(maxDev, span * ratio);
  if (zoom >= 11) bulge *= 0.45;
  if (scope === 'local' || scope === 'regional') bulge *= 0.65;
  return bulge;
}

function sampleCubicBezier(
  p0: LatLngTuple,
  p1: LatLngTuple,
  p2: LatLngTuple,
  p3: LatLngTuple,
  steps: number,
): LatLngTuple[] {
  const out: LatLngTuple[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

function dedupeAnchors(points: LatLngTuple[]): LatLngTuple[] {
  const out: LatLngTuple[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 0.015) out.push(p);
  }
  return out;
}

function extractCorridorAnchors(points: LatLngTuple[]): LatLngTuple[] {
  if (points.length <= 2) return points;
  const anchors: LatLngTuple[] = [points[0]];
  const stride = Math.max(1, Math.floor(points.length / 7));
  for (let i = stride; i < points.length - 1; i += stride) {
    anchors.push(points[i]);
  }
  anchors.push(points[points.length - 1]);
  return dedupeAnchors(anchors);
}

function routeLaneOffset(routeId: string, mode: TransportMode): number {
  let hash = 0;
  for (let i = 0; i < routeId.length; i++) hash = (hash + routeId.charCodeAt(i) * (i + 3)) % 101;
  const spread = ((hash % 7) - 3) * 0.000025;
  if (mode === 'air') return spread * 1.35;
  if (mode === 'sea') return spread * 1.15;
  return spread;
}

function bezierStepsForDistance(distKm: number, mode: TransportMode): number {
  if (distKm < 80) return 14;
  if (distKm < 200) return 20;
  if (distKm < 450) return 28;
  return mode === 'air' ? 36 : 30;
}

function buildCubicArcSegment(
  p0: LatLngTuple,
  p3: LatLngTuple,
  mode: TransportMode,
  scope: RouteScope,
  zoom: number,
  lane: number,
): LatLngTuple[] {
  const dist = routeDistanceKm({ lat: p0[0], lng: p0[1] }, { lat: p3[0], lng: p3[1] });
  const span = Math.max(Math.abs(p3[0] - p0[0]), Math.abs(p3[1] - p0[1]), 0.01);
  const off = perpendicularOffset(p0, p3, arcBulge(mode, scope, dist, span, zoom) + lane);
  const p1: LatLngTuple = [
    p0[0] + (p3[0] - p0[0]) * 0.33 + off.lat * 0.55,
    p0[1] + (p3[1] - p0[1]) * 0.33 + off.lng * 0.55,
  ];
  const p2: LatLngTuple = [
    p0[0] + (p3[0] - p0[0]) * 0.67 + off.lat * 0.55,
    p0[1] + (p3[1] - p0[1]) * 0.67 + off.lng * 0.55,
  ];
  return sampleCubicBezier(p0, p1, p2, p3, bezierStepsForDistance(dist, mode));
}

/** Engineering corridor geometry — near-straight arcs, max ~8% deviation */
export function refineVisibleRoutePath(
  points: LatLngTuple[],
  route: BusinessRouteDef,
  mode: TransportMode,
  scope: RouteScope,
  zoom: number,
): LatLngTuple[] {
  if (points.length < 2) return points;

  const lane = routeLaneOffset(route.id, mode) * 0.4;
  const endpoints: LatLngTuple[] = [points[0], points[points.length - 1]];

  if (points.length <= 3) {
    return buildCubicArcSegment(endpoints[0], endpoints[1], mode, scope, zoom, lane);
  }

  const anchors = extractCorridorAnchors(points);
  const merged: LatLngTuple[] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const seg = buildCubicArcSegment(anchors[i], anchors[i + 1], mode, scope, zoom, lane);
    if (i > 0) seg.shift();
    merged.push(...seg);
  }

  return merged.length >= 2 ? merged : buildCubicArcSegment(endpoints[0], endpoints[1], mode, scope, zoom, lane);
}

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
  themeIsLight: boolean;
  glowAtmoSpread: number;
  glowOuterSpread: number;
  themeProfile: ThemeRenderProfile;
  levelMetrics: LevelMetrics;
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
  themeIsLight: boolean;
  renderer?: L.Renderer;
}

export function renderPremiumRoute(opts: RenderRouteOptions): RouteGlowBundle {
  const {
    group,
    route,
    latlngs,
    color,
    visual,
    lineOpacity,
    highlighted,
    selected,
    mode,
    themeIsLight,
    renderer,
  } = opts;
  const path = latlngs;
  const level = getRouteRenderLevel(route);
  const levelCfg = LEVEL_STYLE[level];
  const levelMetrics = LEVEL_METRICS[level];
  const themeProfile = THEME_RENDER[themeIsLight ? 'light' : 'dark'][level];
  const isPartnership = route.businessPurpose === 'trade' && !route.aiRecommended;
  const isAi = !!route.aiRecommended;

  let weight = levelMetrics.coreWeight;
  if (highlighted) weight += 0.5;
  if (selected) weight += 1;

  const opacityCap = themeIsLight ? 0.98 : 0.94;
  let opacity = Math.min(
    opacityCap,
    lineOpacity * levelCfg.opacityScale * themeProfile.coreOpacityMult * (selected ? 1.08 : 1),
  );
  opacity = Math.max(opacity, themeProfile.coreOpacityMin * (selected ? 1.02 : 1));

  const levelClass = `ebh-route-level-${level}`;
  const typeClass = isAi
    ? 'ebh-route-ai'
    : isPartnership
      ? 'ebh-route-partnership'
      : `ebh-route-${mode}`;

  const themeClass = themeIsLight ? 'ebh-route-theme-light' : 'ebh-route-theme-dark';
  const stateClass = `${highlighted ? ' ebh-route-active' : ''}${selected ? ' ebh-route-selected' : ''}`;
  const classBase = `ebh-route ${themeClass} ${typeClass} ${levelClass} ebh-route-tier-${visual.tier}${stateClass}`;

  const bloomColor = themeGlowBloomColor(mode, color, isAi, themeIsLight);
  const glowAtmoSpread = levelMetrics.atmoGlowWeight;
  const glowOuterSpread = levelMetrics.outerGlowWeight;
  const shared: L.PolylineOptions = {
    color: bloomColor,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: themeIsLight ? 1.6 : 2.2,
    interactive: false,
    renderer,
  };

  const basePath = L.polyline(path, {
    ...shared,
    color: themeBasePathColor(themeIsLight),
    weight: glowAtmoSpread + (themeIsLight ? 1.2 : 0.5),
    opacity: opacity * themeProfile.baseOpacityMult,
    className: `${classBase} ebh-route-base`,
  }).addTo(group);

  const atmoBaseOpacity = level === 1 ? 0.11 : level === 2 ? 0.08 : level === 3 ? 0.06 : 0.045;
  const atmoGlow = L.polyline(path, {
    ...shared,
    color: bloomColor,
    weight: glowAtmoSpread,
    opacity: opacity * atmoBaseOpacity * themeProfile.atmoOpacityMult,
    className: `${classBase} ebh-route-glow-atmo`,
  }).addTo(group);

  const outerBaseOpacity = level === 1 ? 0.2 : level === 2 ? 0.14 : level === 3 ? 0.1 : 0.075;
  const outerGlow = L.polyline(path, {
    ...shared,
    color: bloomColor,
    weight: glowOuterSpread,
    opacity: opacity * outerBaseOpacity * themeProfile.outerOpacityMult,
    className: `${classBase} ebh-route-glow-outer`,
  }).addTo(group);

  let mainLine: L.Polyline;
  let innerCore: L.Polyline | undefined;
  let railBg: L.Polyline | undefined;

  if (visual.railDoubleTrack && !isPartnership) {
    const trackWeight = Math.max(2, weight * 0.55);
    const off = visual.railTrackOffset;
    railBg = L.polyline(offsetPathPerpendicular(path, off), {
      ...shared,
      weight: trackWeight,
      opacity: opacity * 0.45,
      className: `${classBase} ebh-route-rail-track-bg`,
    }).addTo(group);

    mainLine = L.polyline(offsetPathPerpendicular(path, -off), {
      color,
      weight: trackWeight,
      opacity,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 2.2,
      className: `${classBase} ebh-route-rail-track ebh-route-core`,
      interactive: true,
      renderer,
    }).addTo(group);

    innerCore = L.polyline(offsetPathPerpendicular(path, -off * 0.5), {
      color: themeInnerCoreColor(mode, color, isAi, themeIsLight),
      weight: levelMetrics.innerGlowWeight * 0.45,
      opacity: Math.min(0.9, opacity * 1.05),
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.5,
      className: `${classBase} ebh-route-inner-core`,
      interactive: false,
      renderer,
    }).addTo(group);
  } else {
    mainLine = L.polyline(path, {
      color:
        isPartnership
          ? themeIsLight
            ? LIGHT_ROUTE_COLORS.business
            : 'rgba(255,255,255,0.65)'
          : color,
      weight: isPartnership ? Math.max(themeIsLight ? 2.2 : 1.2, weight * 0.72) : weight,
      opacity: isPartnership ? (themeIsLight ? Math.max(0.78, opacity * 0.94) : opacity * 0.58) : opacity,
      dashArray: visual.dashArray,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 2.2,
      className: `${classBase} ebh-route-core`,
      interactive: true,
      renderer,
    }).addTo(group);

    if (!isPartnership) {
      innerCore = L.polyline(path, {
        color: themeInnerCoreColor(mode, color, isAi, themeIsLight),
        weight: levelMetrics.innerGlowWeight,
        opacity: Math.min(0.88, opacity * 0.92),
        dashArray: visual.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        smoothFactor: 1.5,
        className: `${classBase} ebh-route-inner-core`,
        interactive: false,
        renderer,
      }).addTo(group);
    }
  }

  const directionMarkers = addRouteDirectionMarkers(group, path, color, level);

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
    themeIsLight: themeIsLight,
    glowAtmoSpread,
    glowOuterSpread,
    themeProfile,
    levelMetrics,
  };
}

function applyRouteFocus(bundle: RouteGlowBundle, hovered: boolean, selected: boolean): void {
  const w = bundle.baseWeight;
  const o = bundle.baseOpacity;
  const { themeProfile, glowAtmoSpread, glowOuterSpread, levelMetrics } = bundle;
  const level = bundle.level;
  const atmoBase = level === 1 ? 0.11 : level === 2 ? 0.08 : level === 3 ? 0.06 : 0.045;
  const outerBase = level === 1 ? 0.2 : level === 2 ? 0.14 : level === 3 ? 0.1 : 0.075;
  const maxW = levelMetrics.coreWeight + 1.2;

  if (selected) {
    const sw = Math.min(maxW, w + 1);
    const so = Math.min(bundle.themeIsLight ? 0.98 : 0.94, o * 1.14);
    bundle.mainLine.setStyle({ weight: sw, opacity: so });
    bundle.innerCore?.setStyle({
      weight: levelMetrics.innerGlowWeight + 0.6,
      opacity: Math.min(bundle.themeIsLight ? 0.96 : 0.9, so * 1.04),
    });
    bundle.outerGlow.setStyle({
      weight: glowOuterSpread + 1.2,
      opacity: so * outerBase * themeProfile.outerOpacityMult * 1.35,
    });
    bundle.atmoGlow.setStyle({
      weight: glowAtmoSpread + 1.5,
      opacity: so * atmoBase * themeProfile.atmoOpacityMult * 1.25,
    });
    bundle.basePath.setStyle({ opacity: so * themeProfile.baseOpacityMult * 1.35 });
    bundle.mainLine.getElement()?.classList.add('ebh-route-selected');
    bundle.mainLine.getElement()?.classList.remove('ebh-route-hovered');
    return;
  }

  if (hovered) {
    const hw = Math.min(maxW, w + 0.5);
    const ho = Math.min(bundle.themeIsLight ? 0.96 : 0.9, o * 1.1);
    bundle.mainLine.setStyle({ weight: hw, opacity: ho });
    bundle.innerCore?.setStyle({
      weight: levelMetrics.innerGlowWeight + 0.3,
      opacity: Math.min(bundle.themeIsLight ? 0.94 : 0.88, ho * 1.02),
    });
    bundle.outerGlow.setStyle({
      weight: glowOuterSpread + 0.8,
      opacity: ho * outerBase * themeProfile.outerOpacityMult * 1.15,
    });
    bundle.atmoGlow.setStyle({
      weight: glowAtmoSpread + 1,
      opacity: ho * atmoBase * themeProfile.atmoOpacityMult * 1.1,
    });
    bundle.basePath.setStyle({ opacity: ho * themeProfile.baseOpacityMult * 1.2 });
    bundle.mainLine.getElement()?.classList.add('ebh-route-hovered');
    bundle.mainLine.getElement()?.classList.remove('ebh-route-selected');
    return;
  }

  bundle.mainLine.setStyle({ weight: w, opacity: o });
  bundle.innerCore?.setStyle({
    weight: levelMetrics.innerGlowWeight,
    opacity: Math.min(bundle.themeIsLight ? 0.92 : 0.85, o * 0.95),
  });
  bundle.outerGlow.setStyle({
    weight: glowOuterSpread,
    opacity: o * outerBase * themeProfile.outerOpacityMult,
  });
  bundle.atmoGlow.setStyle({
    weight: glowAtmoSpread,
    opacity: o * atmoBase * themeProfile.atmoOpacityMult,
  });
  bundle.basePath.setStyle({ opacity: o * themeProfile.baseOpacityMult });
  bundle.mainLine.getElement()?.classList.remove('ebh-route-hovered', 'ebh-route-selected');
}

export function applyRouteHover(bundle: RouteGlowBundle, hovered: boolean): void {
  applyRouteFocus(bundle, hovered, bundle.isSelected);
}

export function applyRouteSelected(bundle: RouteGlowBundle, selected: boolean): void {
  bundle.isSelected = selected;
  applyRouteFocus(bundle, false, selected);
}
