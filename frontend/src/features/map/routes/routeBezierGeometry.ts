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
  if (mode === 'road' || mode === 'rail') {
    if (dist < 80) return span * 0.003;
    if (dist < 220) return span * 0.016;
    if (dist < 500) return span * 0.028;
    return span * 0.038;
  }
  if (mode === 'river') return dist < 100 ? span * 0.005 : span * 0.018;
  if (mode === 'sea') return dist > 180 ? span * 0.034 : span * 0.022;
  if (mode === 'air') return scope === 'europe' && dist > 350 ? span * 0.048 : span * 0.026;
  return 0;
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

/** Catmull-Rom spline — no sharp angles at hub waypoints */
function catmullRomSpline(points: LatLngTuple[], samplesPerSeg = 14): LatLngTuple[] {
  if (points.length < 2) return points;
  if (points.length === 2) return points;

  const result: LatLngTuple[] = [];
  const extended = [points[0], ...points, points[points.length - 1]];

  for (let i = 1; i < extended.length - 2; i++) {
    const p0 = extended[i - 1];
    const p1 = extended[i];
    const p2 = extended[i + 1];
    const p3 = extended[i + 2];

    for (let s = 0; s < samplesPerSeg; s++) {
      if (i > 1 && s === 0) continue;
      const t = s / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;

      const lat =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lng =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      result.push([lat, lng]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
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

  const off = perpendicularOffset(lat1, lng1, lat2, lng2, bulge + laneMag * span * 0.0038);
  const p0: LatLngTuple = [lat1, lng1];
  const p3: LatLngTuple = [lat2, lng2];
  const p1: LatLngTuple = [
    lat1 + (lat2 - lat1) * 0.33 + off.lat * 0.85,
    lng1 + (lng2 - lng1) * 0.33 + off.lng * 0.85,
  ];
  const p2: LatLngTuple = [
    lat1 + (lat2 - lat1) * 0.67 + off.lat * 0.85,
    lng1 + (lng2 - lng1) * 0.67 + off.lng * 0.85,
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

  const anchors: LatLngTuple[] = nodes.map((n) => [n.lat, n.lng]);
  const samples = scope === 'europe' ? 16 : 12;
  return catmullRomSpline(anchors, samples);
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
