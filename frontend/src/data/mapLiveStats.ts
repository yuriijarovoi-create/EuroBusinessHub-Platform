import type { MapLiveStat } from '@shared/types';
import { cities } from './cities';
import { createCityMetrics } from './cityMetrics';

const totals = cities.reduce(
  (acc, city, i) => {
    const m = createCityMetrics(city.businesses + i);
    acc.companies += m.companies;
    acc.jobs += m.jobs;
    acc.transport += m.transport;
    acc.marketplace += m.marketplace;
    acc.warehouses += m.warehouses;
    acc.partners += m.partners;
    acc.digitalProducts += m.digitalProducts;
    acc.subscriptions += m.subscriptions;
    acc.aiRequests += m.aiRequests;
    return acc;
  },
  {
    companies: 0,
    jobs: 0,
    transport: 0,
    marketplace: 0,
    warehouses: 0,
    partners: 0,
    digitalProducts: 0,
    subscriptions: 0,
    aiRequests: 0,
  },
);

export const mapLiveStats: MapLiveStat[] = [
  { id: 'companies', labelKey: 'live.companies', value: totals.companies, trend: 12.4 },
  { id: 'jobs', labelKey: 'live.jobs', value: totals.jobs, trend: 5.8 },
  { id: 'transport', labelKey: 'live.transport', value: totals.transport, trend: 9.2 },
  { id: 'marketplace', labelKey: 'live.marketplace', value: totals.marketplace, trend: 14.1 },
  { id: 'warehouses', labelKey: 'live.warehouses', value: totals.warehouses, trend: 3.6 },
  { id: 'partners', labelKey: 'live.partners', value: totals.partners, trend: 6.4 },
  { id: 'digitalProducts', labelKey: 'live.digitalProducts', value: totals.digitalProducts, trend: 11.2 },
  { id: 'subscriptions', labelKey: 'live.subscriptions', value: totals.subscriptions, trend: 8.7 },
  { id: 'aiRequests', labelKey: 'live.aiRequests', value: totals.aiRequests, trend: 22.5 },
];
