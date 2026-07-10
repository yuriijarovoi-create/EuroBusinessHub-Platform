import type { CompanyIndustryId, CompanyRecord, CompanySize, CompanyStatus } from '@shared/types';

export type CompanySortOption = 'relevance' | 'name' | 'size';

export interface CompanyFilterState {
  query: string;
  industry: CompanyIndustryId | 'all';
  companySize: CompanySize | 'all';
  verifiedOnly: boolean;
  status: CompanyStatus | 'all';
  sort: CompanySortOption;
}

export const DEFAULT_COMPANY_FILTERS: CompanyFilterState = {
  query: '',
  industry: 'all',
  companySize: 'all',
  verifiedOnly: false,
  status: 'all',
  sort: 'relevance',
};

const SIZE_ORDER: Record<CompanySize, number> = {
  micro: 0,
  small: 1,
  medium: 2,
  large: 3,
};

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function filterCompanies(
  companies: CompanyRecord[],
  filters: CompanyFilterState,
): CompanyRecord[] {
  const query = normalizeQuery(filters.query);

  let results = companies.filter((company) => {
    if (filters.industry !== 'all' && company.industry !== filters.industry) return false;
    if (filters.companySize !== 'all' && company.companySize !== filters.companySize) return false;
    if (filters.verifiedOnly && !company.verified) return false;
    if (filters.status !== 'all' && company.status !== filters.status) return false;

    if (!query) return true;

    const haystack = [
      company.name,
      company.industry,
      company.description,
      ...company.tags,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

  if (filters.sort === 'name') {
    results = [...results].sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sort === 'size') {
    results = [...results].sort(
      (a, b) => SIZE_ORDER[b.companySize] - SIZE_ORDER[a.companySize],
    );
  }

  return results;
}

export function hasActiveCompanyFilters(filters: CompanyFilterState): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.industry !== 'all' ||
    filters.companySize !== 'all' ||
    filters.verifiedOnly ||
    filters.status !== 'all' ||
    filters.sort !== 'relevance'
  );
}
