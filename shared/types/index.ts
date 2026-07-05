/** Shared domain types — source of truth for frontend & backend contracts */

export type ModuleId =
  | 'marketplace'
  | 'transport'
  | 'logistik'
  | 'unternehmen'
  | 'jobs'
  | 'lager'
  | 'partner'
  | 'digitale-produkte'
  | 'akademie'
  | 'ki';

export interface BusinessModule {
  id: ModuleId;
  icon: string;
  route: string;
  status: 'active' | 'coming-soon' | 'beta';
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  businesses: number;
  activeModules: ModuleId[];
}

export interface SearchResult {
  id: string;
  type: 'city' | 'module' | 'business' | 'product' | 'job';
  title: string;
  subtitle: string;
  route: string;
}

export interface WorkspaceStats {
  activeUsers: number;
  openOrders: number;
  listings: number;
}
