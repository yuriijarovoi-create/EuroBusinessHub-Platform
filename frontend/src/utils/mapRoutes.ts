import type { MapRoute } from '@shared/types';
import { HUB } from '@/features/map/data/europeGeo';

export { HUB };

export function getHubRoutes(cities: { id: string; mapX: number; mapY: number }[]): MapRoute[] {
  return cities
    .filter((c) => c.id !== HUB.id)
    .map((city, i) => ({
      id: `${HUB.id}-${city.id}`,
      path: `M ${HUB.x} ${HUB.y} Q ${(HUB.x + city.mapX) / 2} ${Math.min(HUB.y, city.mapY) - 4} ${city.mapX} ${city.mapY}`,
      delay: i * 0.4,
      fromCityId: HUB.id,
      toCityId: city.id,
      type: 'logistics' as const,
      active: true,
    }));
}
