import type { LatLngTuple } from 'leaflet';
import type { TransportMode } from '../types/mapTypes';
import type { RouteVisualTier } from './routeVisualStyles';

/** Smooth position along a dense path — no segment kinks */
export function interpolateAlongPath(points: LatLngTuple[], t: number): LatLngTuple {
  if (points.length < 2) return points[0] ?? [0, 0];
  const clamped = ((t % 1) + 1) % 1;
  const seg = clamped * (points.length - 1);
  const i = Math.min(Math.floor(seg), points.length - 2);
  const f = seg - i;
  const smooth = f * f * (3 - 2 * f);
  const a = points[i];
  const b = points[i + 1];
  return [a[0] + (b[0] - a[0]) * smooth, a[1] + (b[1] - a[1]) * smooth];
}

/** Mode-specific cruise speed (progress units per frame @ ~60fps) */
export function baseSpeedPerFrame(
  mode: TransportMode,
  distanceKm: number,
): number {
  const distNorm = Math.min(1.4, Math.max(0.65, distanceKm / 450));
  switch (mode) {
    case 'sea':
      return (0.00014 / distNorm);
    case 'air':
      return (0.00042 / distNorm);
    case 'rail':
      return (0.00024 / distNorm);
    case 'river':
      return (0.00016 / distNorm);
    case 'road':
    default:
      return (0.00022 / distNorm);
  }
}

/** Particles accelerate near hub endpoints — opposite of freight vehicle easing */
export function particleSpeedMultiplierAt(progress: number): number {
  const nearHub = progress < 0.07 || progress > 0.93;
  const midHub = progress < 0.14 || progress > 0.86;
  if (nearHub) return 1.48;
  if (midHub) return 1.2;
  return 1;
}

/**
 * Trucks ease near hubs; trains stay constant; ships stay slow; air stays fast.
 * Returns multiplier applied to base speed.
 */
export function speedMultiplierAt(
  mode: TransportMode,
  progress: number,
): number {
  const nearHub = progress < 0.1 || progress > 0.9;
  const midHub = progress < 0.18 || progress > 0.82;

  switch (mode) {
    case 'road':
      if (nearHub) return 0.42;
      if (midHub) return 0.72;
      return 1;
    case 'rail':
      return 1;
    case 'sea':
      return 0.88;
    case 'air':
      return 1.05;
    case 'river':
      return nearHub ? 0.55 : 0.85;
    default:
      return 1;
  }
}

/** Backbone = continuous flow; local = slow */
export function tierMotionMultiplier(tier: RouteVisualTier): number {
  switch (tier) {
    case 'trunk':
      return 1.35;
    case 'international':
      return 1;
    case 'national':
      return 0.72;
    default:
      return 0.45;
  }
}
