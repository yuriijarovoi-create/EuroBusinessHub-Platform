import type { MapCountry } from '@shared/types';
import { cities } from '@/data/cities';
import { createCityMetrics } from '@/data/cityMetrics';
import { applyFranceHubMetrics } from './franceHubData';
import { applyCityHubProfile } from './cityHubEnrichment';
import { baselineCountryMetrics, economySeedForCountry } from './countryEconomySeeds';

export interface CountryBusinessStats {
  code: string;
  companies: number;
  jobs: number;
  warehouses: number;
  transport: number;
  marketplace: number;
  partners: number;
  aiScore: number;
  cityCount: number;
  activeRoutes: number;
}

function aggregateCityMetrics(countryCode: string) {
  const countryCities = cities.filter((c) => c.countryCode === countryCode);
  return countryCities.reduce(
    (acc, city) => {
      let m = createCityMetrics(city.businesses);
      m = applyCityHubProfile(city.id, m);
      if (countryCode === 'FR') m = applyFranceHubMetrics(city.id, m);
      return {
        companies: acc.companies + m.companies,
        jobs: acc.jobs + m.jobs,
        warehouses: acc.warehouses + m.warehouses,
        transport: acc.transport + m.transport,
        marketplace: acc.marketplace + m.marketplace,
        partners: acc.partners + m.partners,
        aiScore: acc.aiScore + m.aiScore,
        count: acc.count + 1,
      };
    },
    { companies: 0, jobs: 0, warehouses: 0, transport: 0, marketplace: 0, partners: 0, aiScore: 0, count: 0 },
  );
}

/** Data-driven country statistics — baseline economy seed + city aggregates */
export function getCountryBusinessStats(countryCode: string): CountryBusinessStats {
  const seed = economySeedForCountry(countryCode);
  const baseline = baselineCountryMetrics(seed);
  const cityAgg = aggregateCityMetrics(countryCode);

  const companies = Math.max(baseline.companies, cityAgg.companies);
  const jobs = Math.max(baseline.jobs, cityAgg.jobs);
  const warehouses = Math.max(baseline.warehouses, cityAgg.warehouses);
  const transport = Math.max(baseline.transport, cityAgg.transport);
  const marketplace = Math.max(baseline.marketplace, cityAgg.marketplace);
  const partners = Math.max(baseline.partners, cityAgg.partners);
  const aiScore = cityAgg.count
    ? Math.round((cityAgg.aiScore / cityAgg.count + baseline.aiScore) / 2)
    : baseline.aiScore;

  const cityCount = cityAgg.count;

  return {
    code: countryCode,
    companies,
    jobs,
    warehouses,
    transport,
    marketplace,
    partners,
    aiScore: Math.min(99, aiScore),
    cityCount,
    activeRoutes: Math.max(cityCount * 3, Math.round(12 * seed + 6)),
  };
}

export function getCountryStatsForMap(country: MapCountry | null): CountryBusinessStats | null {
  if (!country) return null;
  return getCountryBusinessStats(country.code);
}
