import type { MapRoute } from '@shared/types';
import { HUB } from '@/features/map/data/europeGeo';

export { HUB };

export function getHubRoutes(_cities: { id: string; mapX: number; mapY: number }[]): MapRoute[] {
  return [];
}
