/** Shared domain types — source of truth for frontend & backend contracts */

export type ModuleId =
  | 'dashboard'
  | 'marketplace'
  | 'transport'
  | 'logistik'
  | 'unternehmen'
  | 'jobs'
  | 'lager'
  | 'partner'
  | 'services'
  | 'digitale-produkte'
  | 'akademie'
  | 'ki'
  | 'analytics'
  | 'payments'
  | 'admin';

export interface BusinessModule {
  id: ModuleId;
  icon: string;
  route: string;
  status: 'active' | 'coming-soon' | 'beta';
}

export interface PlatformModule extends BusinessModule {
  showOnHomepage?: boolean;
  sidebarOrder: number;
}

export interface PlatformStat {
  id: string;
  labelKey: string;
  value: number;
  trend?: number;
}

export interface DashboardMetric {
  id: string;
  labelKey: string;
  value: string | number;
  change: number;
  icon: string;
  route: string;
  module: ModuleId;
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
  /** Strategic map visibility tier — 1 = major hub … 4 = local node */
  mapTier?: 1 | 2 | 3 | 4;
  isMajorHub?: boolean;
  population?: number;
}

export interface SearchResult {
  id: string;
  type:
    | 'city'
    | 'module'
    | 'business'
    | 'product'
    | 'job'
    | 'transport'
    | 'warehouse'
    | 'service'
    | 'ai';
  title: string;
  subtitle: string;
  route: string;
  /** Module id when type is 'module' */
  module?: ModuleId;
  /** Relevance score 0–1 for ranked search results */
  score?: number;
}

export interface WorkspaceStats {
  activeUsers: number;
  openOrders: number;
  listings: number;
}

export * from './map';
export * from './ai';
export * from './payments';
export * from './commissions';
export * from './companies';
