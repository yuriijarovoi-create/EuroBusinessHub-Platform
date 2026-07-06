import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import type { TransportMode } from '../types/mapTypes';
import { interpolateAlongPath, particleSpeedMultiplierAt } from '../utils/routeAnimation';
import {
  particleClassForMode,
  particleRadiusForMode,
  particleSpeedForMode,
} from '../utils/mapRouteStyles';
import type { RouteRenderLevel } from './routeLevels';

const TRAIL_LENGTH = 5;
const MAX_GLOBAL_PARTICLES = 40;

export interface RouteFocusRef {
  hoveredRouteId: string | null;
  selectedRouteId: string | null;
}

export interface RouteParticleSlot {
  head: L.CircleMarker;
  trail: L.CircleMarker[];
  progress: number;
  speed: number;
  direction: 1 | -1;
  points: LatLngTuple[];
  mode: TransportMode;
  color: string;
  routeId: string;
}

export interface ParticleEngine {
  slots: RouteParticleSlot[];
  animId: number;
  focus: RouteFocusRef;
}

export function createParticleEngine(): ParticleEngine {
  return { slots: [], animId: 0, focus: { hoveredRouteId: null, selectedRouteId: null } };
}

export function setParticleRouteFocus(engine: ParticleEngine, focus: Partial<RouteFocusRef>): void {
  Object.assign(engine.focus, focus);
}

export function addRouteParticles(
  engine: ParticleEngine,
  group: L.LayerGroup,
  points: LatLngTuple[],
  color: string,
  mode: TransportMode,
  count: number,
  speed: number,
  level: RouteRenderLevel,
  routeId: string,
  startOffset = 0,
  isAi = false,
): void {
  if (engine.slots.length >= MAX_GLOBAL_PARTICLES) return;

  const headRadius = particleRadiusForMode(mode, level);
  const particleClass = particleClassForMode(mode, isAi);
  const modeSpeed = particleSpeedForMode(mode);
  const bidirectional = level === 1 && count >= 2;

  for (let p = 0; p < count; p++) {
    if (engine.slots.length >= MAX_GLOBAL_PARTICLES) break;

    const direction: 1 | -1 = bidirectional && p % 2 === 1 ? -1 : 1;
    const progress =
      direction === 1
        ? (startOffset + p * (1 / Math.max(count, 1))) % 1
        : 1 - ((startOffset + p * 0.17) % 0.85);

    const pos = interpolateAlongPath(points, progress);

    const speedJitter = 0.78 + ((p * 17 + startOffset * 31) % 50) / 100;
    const trail: L.CircleMarker[] = [];
    for (let t = 0; t < TRAIL_LENGTH; t++) {
      const trailMarker = L.circleMarker(pos, {
        radius: Math.max(0.45, headRadius * (1 - t * 0.18)),
        fillColor: color,
        fillOpacity: 0.045 * (TRAIL_LENGTH - t),
        color: 'transparent',
        weight: 0,
        className: `ebh-route-particle-trail ${particleClass}`,
        interactive: false,
      }).addTo(group);
      trail.push(trailMarker);
    }

    const head = L.circleMarker(pos, {
      radius: headRadius,
      fillColor: color,
      fillOpacity: level === 1 ? 0.78 : 0.55,
      color: 'rgba(255,255,255,0.55)',
      weight: 0.2,
      opacity: 0.22,
      className: `ebh-route-particle-head ${particleClass}`,
      interactive: false,
    }).addTo(group);

    engine.slots.push({
      head,
      trail,
      progress,
      speed: speed * modeSpeed * speedJitter * (0.9 + p * 0.04),
      direction,
      points,
      mode,
      color,
      routeId,
    });
  }
}

export function startParticleAnimation(engine: ParticleEngine): void {
  if (engine.slots.length === 0) return;

  const tick = () => {
    const { hoveredRouteId, selectedRouteId } = engine.focus;

    for (const slot of engine.slots) {
      const hubMult = particleSpeedMultiplierAt(
        slot.direction === 1 ? slot.progress : 1 - slot.progress,
      );
      let focusMult = 1;
      if (slot.routeId === selectedRouteId) focusMult = 1.42;
      else if (slot.routeId === hoveredRouteId) focusMult = 1.22;

      const delta = slot.speed * hubMult * focusMult * slot.direction;
      slot.progress = ((slot.progress + delta) % 1 + 1) % 1;

      const trailLag = 0.0032;
      for (let t = TRAIL_LENGTH - 1; t > 0; t--) {
        const lag = t * trailLag * slot.direction;
        const trailPos = interpolateAlongPath(slot.points, ((slot.progress - lag) % 1 + 1) % 1);
        slot.trail[t].setLatLng(trailPos);
      }

      const headPos = interpolateAlongPath(slot.points, slot.progress);
      slot.head.setLatLng(headPos);
      if (slot.trail[0]) {
        slot.trail[0].setLatLng(
          interpolateAlongPath(slot.points, ((slot.progress - trailLag * slot.direction) % 1 + 1) % 1),
        );
      }
    }
    engine.animId = requestAnimationFrame(tick);
  };
  engine.animId = requestAnimationFrame(tick);
}

export function stopParticleAnimation(engine: ParticleEngine): void {
  cancelAnimationFrame(engine.animId);
  engine.slots = [];
}
