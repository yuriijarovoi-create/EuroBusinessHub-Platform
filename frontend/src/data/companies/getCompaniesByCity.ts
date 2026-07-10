import type { CityCompanyStats, CompanyRecord } from '@shared/types';
import { DEMO_COMPANY_CATALOG } from './demoCompanyCatalog';

/** Data-access boundary — swap demo catalog for API later */
export function getCompaniesByCity(cityId: string): CompanyRecord[] {
  return DEMO_COMPANY_CATALOG.filter((company) => company.cityId === cityId);
}

export function getCompanyById(companyId: string): CompanyRecord | undefined {
  return DEMO_COMPANY_CATALOG.find((company) => company.id === companyId);
}

export function getCityCompanyStats(cityId: string): CityCompanyStats {
  const companies = getCompaniesByCity(cityId);
  const industries = new Set(companies.map((company) => company.industry));
  const openOpportunities = companies.reduce(
    (sum, company) => sum + (company.opportunities?.length ?? 0),
    0,
  );

  return {
    totalCompanies: companies.length,
    verifiedProfiles: companies.filter((company) => company.verified).length,
    industries: industries.size,
    openOpportunities,
  };
}
