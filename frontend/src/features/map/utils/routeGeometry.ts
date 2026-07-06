import type { LatLngTuple } from 'leaflet';
import type { RouteScope, TransportMode } from '../types/mapTypes';
import { modeLaneIndex, resolveHubWaypointIds } from './routeHubWaypoints';

const EARTH_RADIUS_KM = 6371;

export function routeDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function curveBulge(
  mode: TransportMode,
  dist: number,
  span: number,
  scope: RouteScope,
): number {
  if (mode === 'road' || mode === 'rail') {
    if (dist < 100) return 0;
    if (dist < 250) return span * 0.001;
    return span * 0.0025;
  }
  if (mode === 'river') {
    return dist < 120 ? 0 : span * 0.002;
  }
  if (mode === 'sea') {
    return dist > 200 ? span * 0.01 : span * 0.006;
  }
  if (mode === 'air') {
    return scope === 'europe' && dist > 400 ? span * 0.016 : span * 0.008;
  }
  return 0;
}

function buildSegment(
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
  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  const span = Math.max(Math.abs(dLat), Math.abs(dLng), 0.01);
  const len = Math.hypot(dLng, dLat) || 1;
  const perpLat = -dLng / len;
  const perpLng = dLat / len;

  const steps =
    dist < 60 ? 5
    : dist < 150 ? 8
    : dist < 350 ? 11
    : mode === 'air' ? 16
    : 13;

  let bulge = curveBulge(mode, dist, span, scope);
  if (zoom >= 11) bulge *= 0.2;

  const laneOffset = laneMag * span * 0.0038;

  const points: LatLngTuple[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = lat1 + dLat * t;
    const lng = lng1 + dLng * t;
    const arc = Math.sin(Math.PI * t) * bulge;
    points.push([
      lat + perpLat * (arc + laneOffset),
      lng + perpLng * (arc + laneOffset),
    ]);
  }
  return points;
}

/** Offset path perpendicular for rail double-track rendering */
export function offsetPathPerpendicular(
  points: LatLngTuple[],
  offsetDeg: number,
): LatLngTuple[] {
  if (points.length < 2 || offsetDeg === 0) return points;
  const out: LatLngTuple[] = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dLng = next[1] - prev[1];
    const dLat = next[0] - prev[0];
    const len = Math.hypot(dLng, dLat) || 1;
    const nx = -dLng / len;
    const ny = dLat / len;
    out.push([points[i][0] + nx * offsetDeg, points[i][1] + ny * offsetDeg]);
  }
  return out;
}

export interface CorridorNode {
  lat: number;
  lng: number;
}

/**
 * Engineered multi-hop corridor — follows logistics hubs where defined.
 */
export function buildRouteLatLngs(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: TransportMode,
  scope: RouteScope = 'country',
  zoom = 6,
  routeId = '',
  fromCityId = '',
  toCityId = '',
  waypointNodes: CorridorNode[] = [],
): LatLngTuple[] {
  void routeId;
  const nodes: CorridorNode[] = [{ lat: lat1, lng: lng1 }];
  if (waypointNodes.length) nodes.push(...waypointNodes);
  nodes.push({ lat: lat2, lng: lng2 });

  const laneMag = modeLaneIndex(mode);
  const merged: LatLngTuple[] = [];

  for (let s = 0; s < nodes.length - 1; s++) {
    const seg = buildSegment(
      nodes[s].lat,
      nodes[s].lng,
      nodes[s + 1].lat,
      nodes[s + 1].lng,
      mode,
      scope,
      zoom,
      laneMag,
    );
    if (s > 0) seg.shift();
    merged.push(...seg);
  }

  void fromCityId;
  void toCityId;
  return merged;
}

/** Build path with hub city coordinates resolved from map */
export function buildCorridorPath(
  from: CorridorNode & { id: string },
  to: CorridorNode & { id: string },
  cityLookup: Map<string, { lat: number; lng: number }>,
  mode: TransportMode,
  scope: RouteScope,
  zoom: number,
): LatLngTuple[] {
  const dist = routeDistanceKm(from, to);
  const hubIds = resolveHubWaypointIds(from.id, to.id, scope, dist);
  const waypoints: CorridorNode[] = [];
  for (const hubId of hubIds) {
    const hub = cityLookup.get(hubId);
    if (hub) waypoints.push(hub);
  }
  return buildRouteLatLngs(
    from.lat,
    from.lng,
    to.lat,
    to.lng,
    mode,
    scope,
    zoom,
    '',
    from.id,
    to.id,
    waypoints,
  );
}
