import L from 'leaflet';
import type { BusinessRouteDef, RouteVehicleIcon, TransportMode } from '../types/mapTypes';

/** Official seaport cities — anchor + ship terminals only */
export const PORT_CITY_IDS = new Set([
  'hamburg',
  'bremerhaven',
  'rotterdam',
  'antwerp',
  'amsterdam',
  'gdansk',
  'marseille',
  'barcelona',
  'genoa',
]);

const VEHICLE_SVG: Record<RouteVehicleIcon, string> = {
  truck: `<svg viewBox="0 0 24 16" width="13" height="9" aria-hidden="true"><path fill="currentColor" d="M2 5h12v5H2V5zm12 1.5h4l2.5 2v3.5h-6.5V6.5z"/><circle cx="6" cy="12.5" r="1.6" fill="#fff" stroke="currentColor" stroke-width=".4"/><circle cx="17" cy="12.5" r="1.6" fill="#fff" stroke="currentColor" stroke-width=".4"/></svg>`,
  train: `<svg viewBox="0 0 24 14" width="13" height="8" aria-hidden="true"><rect x="2" y="3" width="20" height="6" rx="1.5" fill="currentColor"/><rect x="5" y="5" width="3" height="2" rx=".3" fill="#fff" opacity=".75"/><rect x="11" y="5" width="3" height="2" rx=".3" fill="#fff" opacity=".75"/><circle cx="7" cy="11" r="1.3" fill="currentColor"/><circle cx="17" cy="11" r="1.3" fill="currentColor"/></svg>`,
  plane: `<svg viewBox="0 0 24 14" width="12" height="8" aria-hidden="true"><path fill="currentColor" d="m12 1-1.5 4.5H5l1.8 1.5 4.2-.8L9 12h2.2l.8-2.8.8 2.8H15l-1.8-5.8 4.2.8L19 5.5h-5.5L12 1z"/></svg>`,
  ship: `<svg viewBox="0 0 24 14" width="13" height="9" aria-hidden="true"><path fill="currentColor" d="M2 9h20l-2.5-4.5H4.5L2 9zm0 2.5 2.5 2h15l2.5-2H2z"/><rect x="11" y="2.5" width="2" height="3.5" rx=".3" fill="currentColor"/></svg>`,
  barge: `<svg viewBox="0 0 24 10" width="12" height="6" aria-hidden="true"><path fill="currentColor" d="M1 6h22v2H1V6zm2.5-3.5h17l-1.2 3.5H4.7L3.5 2.5z"/></svg>`,
};

const ANCHOR_SVG = `<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M10 2v4M7 6h6M10 6v8m-4 4c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>`;

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

export function isPortCity(cityId: string): boolean {
  return PORT_CITY_IDS.has(cityId);
}

export function resolveVehicleIcon(route: BusinessRouteDef): RouteVehicleIcon {
  if (route.vehicleIcon) return route.vehicleIcon;
  return vehicleIconForMode(route.mode);
}

/** Sea vessels only when route connects port cities */
export function canAnimateSeaVehicle(
  route: BusinessRouteDef,
  fromCityId: string,
  toCityId: string,
): boolean {
  if (route.mode !== 'sea') return true;
  return isPortCity(fromCityId) || isPortCity(toCityId);
}

export function createVehicleDivIcon(
  kind: RouteVehicleIcon,
  color: string,
  scale = 1,
): L.DivIcon {
  const size = Math.round(14 * scale);
  return L.divIcon({
    className: `ebh-vehicle-wrap ebh-vehicle-${kind}`,
    html: `<span class="ebh-vehicle-icon" style="color:${color};transform:scale(${scale})">${VEHICLE_SVG[kind]}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createPortAnchorIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'ebh-port-anchor-wrap',
    html: `<span class="ebh-port-anchor" style="color:${color}">${ANCHOR_SVG}</span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
