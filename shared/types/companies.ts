/** City-scoped company records — demo catalog today, API-backed later */

export type CompanyIndustryId =
  | 'manufacturing'
  | 'logistics'
  | 'technology'
  | 'construction'
  | 'agriculture'
  | 'medical'
  | 'finance'
  | 'tourism'
  | 'retail'
  | 'professional-services';

export type CompanySize = 'micro' | 'small' | 'medium' | 'large';

export type CompanyStatus = 'active' | 'inactive' | 'pending';

export interface CompanyCoordinates {
  lat: number;
  lng: number;
}

export interface CompanyRecord {
  id: string;
  name: string;
  cityId: string;
  citySlug: string;
  countryCode: string;
  coordinates?: CompanyCoordinates;
  industry: CompanyIndustryId;
  companySize: CompanySize;
  employees?: number;
  description: string;
  website?: string;
  verified: boolean;
  status: CompanyStatus;
  tags: string[];
  opportunities?: string[];
  /** Internal flag — demo catalog entries only */
  isDemo: boolean;
}

export interface CityCompanyStats {
  totalCompanies: number;
  verifiedProfiles: number;
  industries: number;
  openOpportunities: number;
}
