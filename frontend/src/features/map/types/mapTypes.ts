import type { City, MapCityMetrics } from '@shared/types';

/** Transport mode for animated business routes */
export type TransportMode = 'road' | 'rail' | 'air' | 'sea' | 'river';

/** City enriched with projected map coordinates and metrics */
import type { GermanyCityProfile } from './germanyTypes';

export interface MapCityRecord extends City {
  mapX: number;
  mapY: number;
  metrics: MapCityMetrics;
  /** Germany digital twin profile — present for DE cities */
  germanyProfile?: GermanyCityProfile;
}

/** Route definition — path computed at render from city coordinates */
export interface BusinessRouteDef {
  id: string;
  fromCityId: string;
  toCityId: string;
  mode: TransportMode;
  active: boolean;
  delay?: number;
  /** Traffic intensity 1–5 — controls particle count & glow */
  intensity?: number;
}

export interface CityTooltipData {
  city: MapCityRecord;
  mapX: number;
  mapY: number;
}

/** Map layer visibility toggles */
export interface MapLayerState {
  routes: boolean;
  road: boolean;
  rail: boolean;
  air: boolean;
  sea: boolean;
  river: boolean;
  companies: boolean;
  jobs: boolean;
  warehouses: boolean;
  nightLights: boolean;
}

export const DEFAULT_LAYER_STATE: MapLayerState = {
  routes: true,
  road: true,
  rail: true,
  air: true,
  sea: true,
  river: true,
  companies: true,
  jobs: true,
  warehouses: true,
  nightLights: true,
};

export type CityPanelTab =
  | 'overview'
  | 'companies'
  | 'jobs'
  | 'warehouses'
  | 'routes'
  | 'transport'
  | 'marketplace'
  | 'services'
  | 'analytics'
  | 'partners'
  | 'activity';

export interface ActivityStats {
  liveActivity: number;
  freightVolume24h: number;
  openTransportOffers: number;
  avgDeliveryHours: number;
  co2SavingTons: number;
}

export interface ResolvedRoute {
  def: BusinessRouteDef;
  path: string;
  fromName: string;
  toName: string;
}
