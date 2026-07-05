import type { LatLngTuple } from 'leaflet';
import type { TransportMode } from '../types/mapTypes';

/** Build lat/lng path between cities — air routes use visible arc */
export function buildRouteLatLngs(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: TransportMode,
): LatLngTuple[] {
  const steps = mode === 'air' ? 24 : mode === 'sea' || mode === 'river' ? 16 : 12;
  const bulge =
    mode === 'air'
      ? 0.35 * Math.abs(lng2 - lng1)
      : mode === 'sea'
        ? 0.12
        : mode === 'river'
          ? 0.04
          : 0.06;

  const points: LatLngTuple[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lng1 + (lng2 - lng1) * t;
    const arc = Math.sin(Math.PI * t) * bulge;
    points.push([lat + arc, lng]);
  }
  return points;
}
