import type { MapRoute, BusinessRouteType } from '@shared/types';
import { cities } from './cities';
import { HUB } from '@/features/map/data/europeGeo';

const ROUTE_TYPES: BusinessRouteType[] = [
  'logistics',
  'cargo',
  'truck',
  'railway',
  'shipping',
  'air_cargo',
];

function buildPath(fromX: number, fromY: number, toX: number, toY: number): string {
  const midX = (fromX + toX) / 2;
  const midY = Math.min(fromY, toY) - 3 - Math.random() * 2;
  return `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
}

/** Mock business network routes radiating from DE hub */
export function buildBusinessRoutes(): MapRoute[] {
  const hub = cities.find((c) => c.id === HUB.id);
  if (!hub) return [];

  return cities
    .filter((c) => c.id !== HUB.id)
    .flatMap((city, i) => {
      const type = ROUTE_TYPES[i % ROUTE_TYPES.length];
      return [{
        id: `${type}-${hub.id}-${city.id}`,
        path: buildPath(hub.mapX, hub.mapY, city.mapX, city.mapY),
        delay: (i * 0.35) % 3,
        fromCityId: hub.id,
        toCityId: city.id,
        type,
        active: true,
      }];
    });
}

/** Inter-city connection routes (secondary network) */
export function buildConnectionRoutes(): MapRoute[] {
  const major = cities.filter((c) => c.isMajorHub);
  const routes: MapRoute[] = [];
  for (let i = 0; i < major.length - 1; i++) {
    const a = major[i];
    const b = major[i + 1];
    if (!a || !b) continue;
    routes.push({
      id: `conn-${a.id}-${b.id}`,
      path: buildPath(a.mapX, a.mapY, b.mapX, b.mapY),
      delay: i * 0.5,
      fromCityId: a.id,
      toCityId: b.id,
      type: 'logistics',
      active: true,
    });
  }
  return routes;
}

export const businessRoutes: MapRoute[] = [
  ...buildBusinessRoutes(),
  ...buildConnectionRoutes(),
];
