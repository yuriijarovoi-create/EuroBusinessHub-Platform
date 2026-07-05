import type { MapCountry } from '@shared/types';
import { cities } from '@/data/cities';
import { createCityMetrics } from '@/data/cityMetrics';

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

/** Aggregate mock country statistics from city seeds — ready for API swap */
export function getCountryBusinessStats(countryCode: string): CountryBusinessStats {
  const countryCities = cities.filter((c) => c.countryCode === countryCode);
  const totals = countryCities.reduce(
    (acc, city) => {
      const m = createCityMetrics(city.businesses);
      return {
        companies: acc.companies + m.companies,
        jobs: acc.jobs + m.jobs,
        warehouses: acc.warehouses + m.warehouses,
        transport: acc.transport + m.transport,
        marketplace: acc.marketplace + m.marketplace,
        partners: acc.partners + m.partners,
        aiScore: acc.aiScore + m.aiScore,
      };
    },
    { companies: 0, jobs: 0, warehouses: 0, transport: 0, marketplace: 0, partners: 0, aiScore: 0 },
  );

  const cityCount = countryCities.length;
  return {
    code: countryCode,
    ...totals,
    aiScore: cityCount ? Math.round(totals.aiScore / cityCount) : 0,
    cityCount,
    activeRoutes: Math.max(cityCount * 3, 6),
  };
}

export function getCountryStatsForMap(country: MapCountry | null): CountryBusinessStats | null {
  if (!country) return null;
  return getCountryBusinessStats(country.code);
}
