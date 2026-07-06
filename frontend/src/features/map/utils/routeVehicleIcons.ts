import L from 'leaflet';
import type { BusinessRouteDef, RouteVehicleIcon, TransportMode } from '../types/mapTypes';
import type { RouteRenderLevel } from '../routes/routeLevels';
import { PORT_ENDPOINTS, AIRPORT_ENDPOINTS } from '../data/logisticsHubNetwork';

/** Animated port anchor icons — display only */
export const PORT_CITY_IDS = new Set([
  'rotterdam',
  'hamburg',
  'antwerp',
  'marseille',
  'barcelona',
  'valencia',
  'genoa',
  'naples',
  'athens',
  'odesa',
  'istanbul',
]);

/** Airport hub icons — display only */
export const AIRPORT_CITY_IDS = new Set([
  'berlin',
  'frankfurt',
  'amsterdam',
  'paris',
  'madrid',
  'rome',
  'warsaw',
  'vienna',
  'istanbul',
]);

const VEHICLE_SVG: Record<RouteVehicleIcon, string> = {
  truck: `<svg viewBox="0 0 24 16" width="14" height="10" aria-hidden="true"><path fill="currentColor" d="M1.5 4.5h12.5v5.5H1.5V4.5zm12.5 1.5h4.2l2.8 2.2v4.3H14V6z"/><circle cx="5.5" cy="12.5" r="1.8" fill="#fff" stroke="currentColor" stroke-width=".45"/><circle cx="17.5" cy="12.5" r="1.8" fill="#fff" stroke="currentColor" stroke-width=".45"/></svg>`,
  train: `<svg viewBox="0 0 24 14" width="14" height="9" aria-hidden="true"><rect x="1.5" y="2.5" width="21" height="6.5" rx="1.8" fill="currentColor"/><rect x="4.5" y="4.5" width="3.5" height="2.2" rx=".35" fill="#fff" opacity=".8"/><rect x="11" y="4.5" width="3.5" height="2.2" rx=".35" fill="#fff" opacity=".8"/><circle cx="6.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="11.5" r="1.5" fill="currentColor"/></svg>`,
  plane: `<svg viewBox="0 0 24 14" width="13" height="9" aria-hidden="true"><path fill="currentColor" d="m12 .5-1.8 5H4.5l2 1.8 4.5-.9L8.5 12.5h2.5l1-3.2 1 3.2H15l-2.2-6.8 4.5.9L20 5.5h-6.2L12 .5z"/></svg>`,
  ship: `<svg viewBox="0 0 24 14" width="14" height="10" aria-hidden="true"><path fill="currentColor" d="M1.5 8.5h21l-2.8-5H4.2L1.5 8.5zm0 2.8 2.8 2.2h15l2.8-2.2H1.5z"/><rect x="10.5" y="1.8" width="2.2" height="4" rx=".35" fill="currentColor"/></svg>`,
  barge: `<svg viewBox="0 0 24 10" width="12" height="6" aria-hidden="true"><path fill="currentColor" d="M1 5.5h22v2.5H1V5.5zm2-3.5h17l-1.5 3.5H4.5L3 2z"/></svg>`,
};

const ANCHOR_SVG = `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 1.5v4.5M6.5 6h7M10 6v7.5m-4.5 4c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/></svg>`;

const AIRPORT_SVG = `<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M10 2 8 7H3l2.5 2 4-.8L7.5 15h2.2l.8-3 .8 3H13l-1.8-6 4 .8L18 7h-5.5L10 2z" opacity=".95"/></svg>`;

const PORT_COLORS: Record<string, string> = {
  rotterdam: '#f59e0b',
  hamburg: '#fb923c',
  antwerp: '#fbbf24',
  lehavre: '#ea580c',
  marseille: '#ea580c',
  barcelona: '#f97316',
  valencia: '#fb923c',
  genoa: '#fdba74',
  naples: '#f59e0b',
  athens: '#f59e0b',
  istanbul: '#fb923c',
  constanta: '#ea580c',
  odesa: '#fbbf24',
};

/** Fade port anchors at close zoom */
export function transportAnchorOpacityForZoom(zoom: number): number {
  if (zoom >= 10.5) return 0;
  if (zoom >= 9.5) return 0.35;
  if (zoom >= 8) return 0.72;
  return 1;
}

/** Airport icons hidden after zoom > 6 */
export function airportAnchorVisibleAtZoom(zoom: number): boolean {
  return zoom >= 4.5 && zoom <= 6;
}

/** Particles hidden at close zoom */
export function routeMotionVisibleAtZoom(zoom: number): boolean {
  return zoom < 10.5;
}

export function vehicleIconForMode(mode: TransportMode): RouteVehicleIcon {
  switch (mode) {
    case 'road':
      return 'truck';
    case 'rail':
      return 'train';
    case 'air':
      return 'plane';
    case 'sea':
      return 'ship';
    case 'river':
      return 'barge';
    default:
      return 'truck';
  }
}

export function vehicleScaleForLevel(level: RouteRenderLevel): number {
  return level === 1 ? 1.12 : level === 2 ? 0.95 : level === 3 ? 0.82 : 0.72;
}

export function isPortCity(cityId: string): boolean {
  return PORT_CITY_IDS.has(cityId);
}

export function isAirportCity(cityId: string): boolean {
  return AIRPORT_CITY_IDS.has(cityId);
}

export function resolveVehicleIcon(route: BusinessRouteDef): RouteVehicleIcon {
  if (route.vehicleIcon) return route.vehicleIcon;
  return vehicleIconForMode(route.mode);
}

export function canRenderSeaRoute(fromCityId: string, toCityId: string): boolean {
  return PORT_ENDPOINTS.has(fromCityId) && PORT_ENDPOINTS.has(toCityId);
}

export function canRenderAirRoute(fromCityId: string, toCityId: string): boolean {
  return AIRPORT_ENDPOINTS.has(fromCityId) && AIRPORT_ENDPOINTS.has(toCityId);
}

export function createVehicleDivIcon(
  kind: RouteVehicleIcon,
  color: string,
  scale = 1,
): L.DivIcon {
  const size = Math.round(16 * scale);
  return L.divIcon({
    className: `ebh-vehicle-wrap ebh-vehicle-${kind} ebh-freight-marker`,
    html: `<span class="ebh-vehicle-icon" style="color:${color}">${VEHICLE_SVG[kind]}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createPortAnchorIcon(cityId: string): L.DivIcon {
  const color = PORT_COLORS[cityId] ?? '#f59e0b';
  return L.divIcon({
    className: 'ebh-port-anchor-wrap ebh-transport-anchor',
    html: `<span class="ebh-port-anchor" style="color:${color}">${ANCHOR_SVG}</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function createAirportAnchorIcon(color = '#a855f7'): L.DivIcon {
  return L.divIcon({
    className: 'ebh-airport-anchor-wrap ebh-transport-anchor',
    html: `<span class="ebh-airport-anchor" style="color:${color}">${AIRPORT_SVG}</span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

/** @deprecated Use canRenderSeaRoute */
export function canAnimateSeaVehicle(
  route: BusinessRouteDef,
  fromCityId: string,
  toCityId: string,
): boolean {
  if (route.mode !== 'sea') return true;
  return canRenderSeaRoute(fromCityId, toCityId);
}
