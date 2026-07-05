import type { SearchResult } from '@shared/types';
import { cities } from './cities';
import { platformModules } from './modules';

export const SEARCHABLE_MODULES = [
  'companies', 'transport', 'marketplace', 'jobs', 'warehouses', 'services', 'ai',
] as const;

export const searchIndex: SearchResult[] = [
  ...cities.map((city) => ({
    id: `city-${city.id}`,
    type: 'city' as const,
    title: city.name,
    subtitle: `${city.country} · ${city.businesses} Unternehmen`,
    route: `/map?city=${city.id}`,
  })),
  ...platformModules.map((mod) => ({
    id: `module-${mod.id}`,
    type: 'module' as const,
    title: mod.id,
    subtitle: mod.status,
    route: mod.route,
    module: mod.id,
  })),
  {
    id: 'biz-1',
    type: 'business',
    title: 'EuroLog GmbH',
    subtitle: 'Logistik · Berlin',
    route: '/workspace/berlin',
    module: 'unternehmen',
  },
  {
    id: 'biz-2',
    type: 'business',
    title: 'NordTrans AG',
    subtitle: 'Transport · Hamburg',
    route: '/workspace/hamburg',
    module: 'transport',
  },
  {
    id: 'transport-1',
    type: 'transport',
    title: 'Fracht Frankfurt → Paris',
    subtitle: '24t · Kühltransport',
    route: '/module/transport',
    module: 'transport',
    score: 0.92,
  },
  {
    id: 'warehouse-1',
    type: 'warehouse',
    title: 'Lager Hamburg Hafen',
    subtitle: '12.000 m² · verfügbar',
    route: '/module/lager',
    module: 'lager',
  },
  {
    id: 'service-1',
    type: 'service',
    title: 'Buchhaltung & Compliance',
    subtitle: 'Business Services · München',
    route: '/module/services',
    module: 'services',
  },
  {
    id: 'job-1',
    type: 'job',
    title: 'Logistikkoordinator (m/w/d)',
    subtitle: 'München · Vollzeit',
    route: '/module/jobs',
    module: 'jobs',
  },
  {
    id: 'prod-1',
    type: 'product',
    title: 'KI-Automatisierung Starter',
    subtitle: 'Digitale Produkte',
    route: '/module/digitale-produkte',
    module: 'digitale-produkte',
  },
  {
    id: 'ai-1',
    type: 'ai',
    title: 'Transport-Matching Vorschläge',
    subtitle: 'KI · 5 neue Matches',
    route: '/module/ki',
    module: 'ki',
    score: 0.88,
  },
];

export function searchMock(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.includes(q),
  );
}
