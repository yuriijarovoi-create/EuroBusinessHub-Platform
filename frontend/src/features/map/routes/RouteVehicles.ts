import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import type { TransportMode } from '../types/mapTypes';
import { interpolateAlongPath, particleSpeedMultiplierAt } from '../utils/routeAnimation';
import { particleClassForMode, particleRadiusForMode, particleSpeedForMode } from '../utils/mapRouteStyles';
import type { RouteRenderLevel } from './routeLevels';

const MAX_GLOBAL_PARTICLES = 72;
const TRAIL_LENGTH = 5;

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
  active: boolean;
}

/** Exactly one RAF loop may run at a time across the app. */
let activeParticleEngine: ParticleEngine | null = null;

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 9973;
  }
  return h;
}

function isMarkerOnMap(marker: L.CircleMarker): boolean {
  return !!(marker as unknown as { _map?: L.Map })._map;
}

function safeSetLatLng(marker: L.CircleMarker, latlng: L.LatLngExpression): void {
  try {
    if (!isMarkerOnMap(marker)) return;
    marker.setLatLng(latlng);
  } catch {
    // Layer detached or map destroyed
  }
}

function detachParticleSlots(engine: ParticleEngine): void {
  for (const slot of engine.slots) {
    try {
      slot.head.off();
      if (isMarkerOnMap(slot.head)) slot.head.remove();
      for (const trail of slot.trail) {
        trail.off();
        if (isMarkerOnMap(trail)) trail.remove();
      }
    } catch {
      // ignore destroyed layers
    }
  }
}

export function createParticleEngine(): ParticleEngine {
  return {
    slots: [],
    animId: 0,
    focus: { hoveredRouteId: null, selectedRouteId: null },
    active: false,
  };
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
  if (engine.slots.length >= MAX_GLOBAL_PARTICLES || count <= 0) return;

  const baseRadius = particleRadiusForMode(mode, level);
  const particleClass = particleClassForMode(mode, isAi);
  const modeSpeed = particleSpeedForMode(mode);
  const bidirectional = level <= 2 && count >= 2;
  const routeSeed = hashSeed(routeId);

  for (let p = 0; p < count; p++) {
    if (engine.slots.length >= MAX_GLOBAL_PARTICLES) break;

    const particleSeed = hashSeed(`${routeId}:${p}`);
    const direction: 1 | -1 = bidirectional && p % 2 === 1 ? -1 : 1;
    const spacing = 0.11 + ((particleSeed % 47) / 100) * 0.38;
    const phase = ((routeSeed % 100) / 100 + startOffset + p * 0.13) % 1;
    const progress =
      direction === 1
        ? (phase + p * spacing) % 1
        : 1 - ((phase + p * spacing * 0.82) % 0.92);

    const sizeMult = 0.62 + ((particleSeed % 73) / 100) * 0.78;
    const headRadius = baseRadius * sizeMult;

    const pos = interpolateAlongPath(points, progress);
    const trail: L.CircleMarker[] = [];

    for (let t = 0; t < TRAIL_LENGTH; t++) {
      trail.push(
        L.circleMarker(pos, {
          radius: Math.max(0.35, headRadius * (1 - t * 0.16)),
          fillColor: color,
          fillOpacity: 0.05 * (TRAIL_LENGTH - t),
          color: 'transparent',
          weight: 0,
          className: `ebh-route-particle-trail ${particleClass}`,
          interactive: false,
        }).addTo(group),
      );
    }

    const head = L.circleMarker(pos, {
      radius: headRadius,
      fillColor: color,
      fillOpacity: level === 1 ? 0.94 : level === 2 ? 0.82 : 0.68,
      color: 'rgba(255,255,255,0.55)',
      weight: 0.35,
      opacity: 0.88,
      className: `ebh-route-particle-head ${particleClass}`,
      interactive: false,
    }).addTo(group);

    const speedJitter = 0.72 + ((particleSeed % 61) / 100) * 0.76;
    const levelBoost = level === 1 ? 1.08 : level === 2 ? 0.95 : 0.82;

    engine.slots.push({
      head,
      trail,
      progress,
      speed: speed * modeSpeed * speedJitter * levelBoost,
      direction,
      points,
      mode,
      color,
      routeId,
    });
  }
}

export function stopParticleAnimation(engine: ParticleEngine): void {
  engine.active = false;
  if (engine.animId) {
    cancelAnimationFrame(engine.animId);
    engine.animId = 0;
  }
  detachParticleSlots(engine);
  engine.slots = [];
  if (activeParticleEngine === engine) {
    activeParticleEngine = null;
  }
}

/** Stops any orphaned route particle loop (e.g. after map destroy). */
export function stopAllParticleAnimation(): void {
  if (activeParticleEngine) {
    stopParticleAnimation(activeParticleEngine);
  }
}

export function startParticleAnimation(engine: ParticleEngine): void {
  if (engine.slots.length === 0) return;

  if (activeParticleEngine && activeParticleEngine !== engine) {
    stopParticleAnimation(activeParticleEngine);
  }
  if (engine.active) {
    stopParticleAnimation(engine);
  }

  activeParticleEngine = engine;
  engine.active = true;

  const tick = () => {
    if (!engine.active || activeParticleEngine !== engine) return;

    const { hoveredRouteId, selectedRouteId } = engine.focus;
    const trailLag = 0.0036;

    for (const slot of engine.slots) {
      if (!engine.active) break;

      const hubMult = particleSpeedMultiplierAt(
        slot.direction === 1 ? slot.progress : 1 - slot.progress,
      );
      let focusMult = 1;
      if (slot.routeId === selectedRouteId) focusMult = 1.42;
      else if (slot.routeId === hoveredRouteId) focusMult = 1.22;

      const delta = slot.speed * hubMult * focusMult * slot.direction;
      slot.progress = ((slot.progress + delta) % 1 + 1) % 1;

      for (let t = TRAIL_LENGTH - 1; t > 0; t--) {
        const lag = t * trailLag * slot.direction;
        safeSetLatLng(
          slot.trail[t],
          interpolateAlongPath(slot.points, ((slot.progress - lag) % 1 + 1) % 1),
        );
      }

      const headPos = interpolateAlongPath(slot.points, slot.progress);
      safeSetLatLng(slot.head, headPos);
      safeSetLatLng(
        slot.trail[0],
        interpolateAlongPath(slot.points, ((slot.progress - trailLag * slot.direction) % 1 + 1) % 1),
      );
    }

    if (engine.active && activeParticleEngine === engine) {
      engine.animId = requestAnimationFrame(tick);
    }
  };

  engine.animId = requestAnimationFrame(tick);
}

/** Aliases for vehicle-based imports */
export const createVehicleEngine = createParticleEngine;
export const setVehicleRouteFocus = setParticleRouteFocus;
export const addRouteVehicles = addRouteParticles;
export const startVehicleAnimation = startParticleAnimation;
export const stopVehicleAnimation = stopParticleAnimation;
