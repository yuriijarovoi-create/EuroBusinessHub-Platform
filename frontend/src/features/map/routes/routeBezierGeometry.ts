import type { LatLngTuple } from 'leaflet';
import type { RouteScope, TransportMode } from '../types/mapTypes';
import { modeLaneIndex, resolveHubWaypointIds } from '../utils/routeHubWaypoints';
import { routeDistanceKm } from '../utils/routeGeometry';

export type { LatLngTuple };

function perpendicularOffset(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  magnitude: number,
): { lat: number; lng: number } {
  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  const len = Math.hypot(dLng, dLat) || 1;
  return { lat: (-dLng / len) * magnitude, lng: (dLat / len) * magnitude };
}

function curveMagnitude(
  mode: TransportMode,
  dist: number,
  span: number,
  scope: RouteScope,
): number {
  const maxDev = span * 0.08;
  let ratio: number;
  if (mode === 'air') {
    ratio = scope === 'europe' && dist > 400 ? 0.14 : 0.1;
  } else if (mode === 'sea') {
    ratio = dist > 300 ? 0.06 : 0.04;
  } else {
    ratio = dist < 120 ? 0.03 : dist < 350 ? 0.05 : 0.07;
  }
  return Math.min(maxDev, span * ratio);
}

/** Cubic Bézier sample — smooth elegant arcs */
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
    const lat =
      u * u * u * p0[0] +
      3 * u * u * t * p1[0] +
      3 * u * t * t * p2[0] +
      t * t * t * p3[0];
    const lng =
      u * u * u * p0[1] +
      3 * u * u * t * p1[1] +
      3 * u * t * t * p2[1] +
      t * t * t * p3[1];
    out.push([lat, lng]);
  }
  return out;
}

function buildBezierSegment(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: TransportMode,
  scope: RouteScope,
  zoom: number,
  laneMag: number,
): LatLngTuple[] {
  const dist = routeDistanceKm({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
  const span = Math.max(Math.abs(lat2 - lat1), Math.abs(lng2 - lng1), 0.01);
  let bulge = curveMagnitude(mode, dist, span, scope);
  if (zoom >= 11) bulge *= 0.35;

  const off = perpendicularOffset(lat1, lng1, lat2, lng2, bulge + laneMag * span * 0.0012);
  const p0: LatLngTuple = [lat1, lng1];
  const p3: LatLngTuple = [lat2, lng2];
  const p1: LatLngTuple = [
    lat1 + (lat2 - lat1) * 0.33 + off.lat * 0.55,
    lng1 + (lng2 - lng1) * 0.33 + off.lng * 0.55,
  ];
  const p2: LatLngTuple = [
    lat1 + (lat2 - lat1) * 0.67 + off.lat * 0.55,
    lng1 + (lng2 - lng1) * 0.67 + off.lng * 0.55,
  ];

  const steps =
    dist < 80 ? 12
    : dist < 200 ? 18
    : dist < 450 ? 24
    : mode === 'air' ? 32
    : 26;

  return sampleCubicBezier(p0, p1, p2, p3, steps);
}

export interface CorridorNode {
  lat: number;
  lng: number;
}

export function buildSmoothCorridorPath(
  nodes: CorridorNode[],
  mode: TransportMode,
  scope: RouteScope,
  zoom: number,
  laneMag: number,
): LatLngTuple[] {
  if (nodes.length < 2) return [];
  if (nodes.length === 2) {
    return buildBezierSegment(nodes[0].lat, nodes[0].lng, nodes[1].lat, nodes[1].lng, mode, scope, zoom, laneMag);
  }

  const merged: LatLngTuple[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const seg = buildBezierSegment(
      nodes[i].lat,
      nodes[i].lng,
      nodes[i + 1].lat,
      nodes[i + 1].lng,
      mode,
      scope,
      zoom,
      laneMag,
    );
    if (i > 0) seg.shift();
    merged.push(...seg);
  }
  return merged.length >= 2 ? merged : [];
}

export function buildPremiumCorridorPath(
  from: CorridorNode & { id: string },
  to: CorridorNode & { id: string },
  cityLookup: Map<string, { lat: number; lng: number }>,
  mode: TransportMode,
  scope: RouteScope,
  zoom: number,
): LatLngTuple[] {
  const dist = routeDistanceKm(from, to);
  const hubIds = resolveHubWaypointIds(from.id, to.id, scope, dist);
  const nodes: CorridorNode[] = [{ lat: from.lat, lng: from.lng }];
  for (const hubId of hubIds) {
    const hub = cityLookup.get(hubId);
    if (hub) nodes.push(hub);
  }
  nodes.push({ lat: to.lat, lng: to.lng });
  return buildSmoothCorridorPath(nodes, mode, scope, zoom, modeLaneIndex(mode));
}
