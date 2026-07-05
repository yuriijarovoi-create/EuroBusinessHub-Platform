/** Germany digital twin — Bundesländer + enriched city business profiles (mock → API) */

export interface BundeslandDef {
  id: string;
  name: string;
  nameEn: string;
  /** Bounding box polygon [lat, lng][] closed ring */
  ring: [lat: number, lng: number][];
  capitalCityId: string;
}

export interface GermanyInfrastructure {
  airports: string[];
  railwayCargoTerminal: string;
  inlandPort?: string;
  motorwayConnections: string[];
  industrialZones: string[];
  logisticsHubs: string[];
}

export interface GermanyTradePartner {
  partner: string;
  countryCode: string;
  volumeMillionEur: number;
}

export interface GermanyActivityItem {
  id: string;
  type: 'transport' | 'marketplace' | 'jobs' | 'warehouse' | 'ai';
  label: string;
  timestamp: string;
}

export interface GermanyCityProfile {
  bundeslandId: string;
  bundeslandName: string;
  mapTier: 1 | 2 | 3;
  population: number;
  mainIndustry: string;
  transportRole: string;
  gdpEstimateBillionEur: number;
  financeScore?: number;
  techScore?: number;
  logisticsScore?: number;
  innovationScore?: number;
  infrastructure: GermanyInfrastructure;
  topTradePartners: GermanyTradePartner[];
  recentActivity: GermanyActivityItem[];
}

export interface GermanyMapCityRecord {
  germanyProfile: GermanyCityProfile;
}
