import { BUSINESS_ROUTES } from '../data/routeData';

let connectionCache: Map<string, number> | null = null;

function buildConnectionCache(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const route of BUSINESS_ROUTES) {
    if (!route.active) continue;
    counts.set(route.fromCityId, (counts.get(route.fromCityId) ?? 0) + 1);
    counts.set(route.toCityId, (counts.get(route.toCityId) ?? 0) + 1);
  }
  return counts;
}

/** Active corridor count touching a city — cached for tooltip performance */
export function countCityNetworkConnections(cityId: string): number {
  if (!connectionCache) connectionCache = buildConnectionCache();
  return connectionCache.get(cityId) ?? 0;
}

/** Composite business vitality score derived from city metrics */
export function computeBusinessScore(metrics: {
  companies: number;
  jobs: number;
  transport: number;
  warehouses: number;
  aiScore: number;
}): number {
  const raw =
    metrics.companies * 0.35 +
    metrics.jobs * 0.2 +
    metrics.transport * 0.25 +
    metrics.warehouses * 0.1 +
    metrics.aiScore * 4;
  return Math.min(99, Math.round(raw / 28));
}
