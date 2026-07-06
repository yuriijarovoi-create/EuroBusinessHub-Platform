import type { MapCityMetrics } from '@shared/types';
import { FRANCE_HUB_CATEGORIES } from './franceHubData';

export interface CityHubProfile {
  businessCategory: string;
  specialTags?: string[];
  metrics?: Partial<MapCityMetrics>;
  topRoutePairs?: Array<[string, string]>;
}

/** Curated hub profiles — overrides mock metrics for strategic cities */
export const CITY_HUB_PROFILES: Record<string, CityHubProfile> = {
  paris: {
    businessCategory: 'European capital & logistics command hub',
    specialTags: ['Finance', 'Air Cargo', 'Rail Freight', 'EU Institutions'],
    topRoutePairs: [
      ['paris', 'brussels'],
      ['paris', 'lyon'],
      ['paris', 'rotterdam'],
      ['paris', 'london'],
      ['paris', 'frankfurt'],
      ['paris', 'milan'],
    ],
  },
  izium: {
    businessCategory: 'Regional logistics and rebuilding hub',
    specialTags: ['Reconstruction', 'Logistics', 'Manufacturing', 'Ukraine-Europe Corridor'],
    metrics: {
      companies: 214,
      jobs: 1672,
      warehouses: 6,
      transport: 37,
      aiScore: 91,
      marketplace: 142,
      partners: 28,
    },
    topRoutePairs: [
      ['berlin', 'izium'],
      ['frankfurt', 'izium'],
      ['kyiv', 'izium'],
      ['dnipro', 'izium'],
      ['istanbul', 'odesa'],
      ['odesa', 'izium'],
    ],
  },
};

export function getCityHubProfile(cityId: string): CityHubProfile | undefined {
  const profile = CITY_HUB_PROFILES[cityId];
  if (profile) return profile;
  const frCategory = FRANCE_HUB_CATEGORIES[cityId];
  if (frCategory) return { businessCategory: frCategory };
  return undefined;
}

export function applyCityHubProfile(
  cityId: string,
  metrics: MapCityMetrics,
): MapCityMetrics {
  const profile = CITY_HUB_PROFILES[cityId];
  if (!profile?.metrics) return metrics;
  return { ...metrics, ...profile.metrics };
}
