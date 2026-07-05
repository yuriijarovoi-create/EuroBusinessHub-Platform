import type { MapCityMetrics } from '@shared/types';

/** Generate structured mock metrics — mirrors future API response shape */
export function createCityMetrics(seed: number): MapCityMetrics {
  const base = seed * 137;
  const companies = 120 + (base % 2000);
  const aiRequests = 8 + (base % 200);
  return {
    population: 200_000 + (base % 2_000_000),
    companies,
    jobs: 40 + (base % 800),
    transport: 15 + (base % 350),
    warehouses: 3 + (base % 45),
    marketplace: 80 + (base % 1200),
    services: 25 + (base % 400),
    partners: 10 + (base % 150),
    digitalProducts: 5 + (base % 120),
    subscriptions: 20 + (base % 300),
    aiRequests,
    aiScore: Math.min(99, Math.round(42 + (aiRequests / 200) * 38 + (companies / 2000) * 20)),
  };
}

export function getMetricsTotal(m: MapCityMetrics): number {
  return m.companies + m.jobs + m.transport + m.marketplace;
}
