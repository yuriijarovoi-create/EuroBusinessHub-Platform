import type { SearchResult } from '@shared/types';
import { cities } from './cities';
import { businessModules } from './modules';

export const searchIndex: SearchResult[] = [
  // cities and modules get localized titles at render time via routes
  ...cities.map((city) => ({
    id: `city-${city.id}`,
    type: 'city' as const,
    title: city.name,
    subtitle: `${city.country} · ${city.businesses} Unternehmen`,
    route: `/workspace/${city.id}`,
  })),
  ...businessModules.map((mod) => ({
    id: `module-${mod.id}`,
    type: 'module' as const,
    title: mod.id,
    subtitle: mod.status,
    route: mod.route,
  })),
  {
    id: 'biz-1',
    type: 'business',
    title: 'EuroLog GmbH',
    subtitle: 'Logistik · Berlin',
    route: '/workspace/berlin',
  },
  {
    id: 'biz-2',
    type: 'business',
    title: 'NordTrans AG',
    subtitle: 'Transport · Hamburg',
    route: '/workspace/hamburg',
  },
  {
    id: 'job-1',
    type: 'job',
    title: 'Logistikkoordinator (m/w/d)',
    subtitle: 'München · Vollzeit',
    route: '/module/jobs',
  },
  {
    id: 'prod-1',
    type: 'product',
    title: 'KI-Automatisierung Starter',
    subtitle: 'Digitale Produkte',
    route: '/module/digitale-produkte',
  },
];

export function searchMock(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q),
  );
}
