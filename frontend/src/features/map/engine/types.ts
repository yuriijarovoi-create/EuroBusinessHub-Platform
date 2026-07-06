import type { MapNavigationPhase, MapProviderId } from '@shared/types';
import type { BusinessRouteDef, MapCityRecord, MapLayerState } from '../types/mapTypes';
import type { MapCountry } from '@shared/types';

/** Extended hierarchy — Europe → Country → Region → City → Workspace */
export type MapViewLevel = MapNavigationPhase | 'region' | 'workspace';

export interface MapEngineViewport {
  center: { lat: number; lng: number };
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapEngineNavigation {
  level: MapViewLevel;
  countryCode: string | null;
  regionId: string | null;
  cityId: string | null;
  transitioning: boolean;
}

export interface BusinessFilterState extends MapLayerState {
  marketplace: boolean;
  transport: boolean;
  partners: boolean;
  academy: boolean;
  digitalProducts: boolean;
  ai: boolean;
  events: boolean;
  investments: boolean;
  startups: boolean;
  manufacturing: boolean;
  agriculture: boolean;
  construction: boolean;
  medical: boolean;
  tourism: boolean;
  technology: boolean;
  finance: boolean;
  legal: boolean;
  education: boolean;
  businessServices: boolean;
}

export interface MapEngineState {
  provider: MapProviderId;
  viewport: MapEngineViewport;
  navigation: MapEngineNavigation;
  layers: MapLayerState;
  businessFilters: BusinessFilterState;
  selectedCity: MapCityRecord | null;
  selectedCountry: MapCountry | null;
  selectedRoute: BusinessRouteDef | null;
  flyTargetCityId: string | null;
  routes: BusinessRouteDef[];
  cities: MapCityRecord[];
  liveStats: {
    activeUsers: number;
    openJobs: number;
    marketplaceOffers: number;
    transportOffers: number;
    warehouses: number;
  };
}

export type MapEngineAction =
  | { type: 'SET_PROVIDER'; provider: MapProviderId }
  | { type: 'SET_VIEWPORT'; viewport: Partial<MapEngineViewport> }
  | { type: 'NAVIGATE'; navigation: Partial<MapEngineNavigation> }
  | { type: 'SET_LAYERS'; layers: MapLayerState }
  | { type: 'SET_BUSINESS_FILTERS'; filters: Partial<BusinessFilterState> }
  | { type: 'SELECT_CITY'; city: MapCityRecord | null; fly?: boolean }
  | { type: 'SELECT_COUNTRY'; country: MapCountry | null }
  | { type: 'SELECT_ROUTE'; route: BusinessRouteDef | null }
  | { type: 'SET_ROUTES'; routes: BusinessRouteDef[] }
  | { type: 'SET_CITIES'; cities: MapCityRecord[] }
  | { type: 'CLEAR_FLY_TARGET' }
  | { type: 'RESET_EUROPE' };

export interface MapSearchTarget {
  kind: 'city' | 'company' | 'country';
  id: string;
  lat?: number;
  lng?: number;
  label: string;
}
