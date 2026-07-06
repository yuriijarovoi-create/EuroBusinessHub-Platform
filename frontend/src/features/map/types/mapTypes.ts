import type { City, MapCityMetrics } from '@shared/types';
import type { GermanyCityProfile, GermanyLocalServiceNode } from './germanyTypes';

/** Transport mode for animated business routes */
export type TransportMode = 'road' | 'rail' | 'air' | 'sea' | 'river';

/** Extended corridor type for AI / business overlays */
export type RouteTransportType = TransportMode | 'business' | 'ai';

/** Geographic / zoom tier for route visibility */
export type RouteScope = 'europe' | 'country' | 'regional' | 'local';

/** @deprecated Use RouteScope — kept for backward compatibility */
export type RouteLevel = RouteScope;

/** Strategic importance tier — 1 = top corridor */
export type RoutePriorityTier = 1 | 2 | 3;

/** Corridor visibility priority */
export type RoutePriorityLevel = 'primary' | 'secondary' | 'local';

/** Animated vehicle glyph on corridor */
export type RouteVehicleIcon = 'truck' | 'train' | 'plane' | 'ship' | 'barge';

/** Business purpose tag for AI / analytics */
export type RouteBusinessPurpose =
  | 'logistics'
  | 'trade'
  | 'hub-connection'
  | 'tourism'
  | 'industry'
  | 'business';

/** Operational status of a corridor */
export type RouteStatus = 'active' | 'congested' | 'maintenance' | 'seasonal';

/** Primary freight / business category */
export type RouteBusinessCategory =
  | 'logistics'
  | 'manufacturing'
  | 'retail'
  | 'automotive'
  | 'pharma'
  | 'tech'
  | 'agriculture'
  | 'energy';

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
  /** ISO country code of origin city */
  fromCountry?: string;
  /** ISO country code of destination city */
  toCountry?: string;
  /** ISO country codes this route serves (one or two for cross-border) */
  countryScope?: string[];
  /** Countries that benefit when this corridor is highlighted */
  relatedCountries?: string[];
  /** Visibility tier — europe | country | regional | local */
  scope?: RouteScope;
  /** @deprecated Use scope */
  level?: RouteScope;
  /** Corridor transport / business type */
  type?: RouteTransportType;
  businessPurpose?: RouteBusinessPurpose;
  /** Strategic tier 1–3 (1 = highest) */
  priorityTier?: RoutePriorityTier;
  /** Corridor priority — primary | secondary | local */
  routePriority?: RoutePriorityLevel;
  /** Higher = drawn first when route cap applies */
  priority?: number;
  aiRecommended?: boolean;
  /** Show when a country is selected (cross-border hub links) */
  activeWhenCountrySelected?: boolean;
  visibleZoomMin?: number;
  visibleZoomMax?: number;
  /** Monthly freight volume index (mock) */
  volume?: number;
  /** Alias for mode in transport context */
  transportMode?: TransportMode;
  /** Distance in km */
  distance?: number;
  /** Estimated transit time in hours */
  estimatedTime?: number;
  businessCategory?: RouteBusinessCategory;
  status?: RouteStatus;
  /** Mock active marketplace / freight offers */
  activeOffers?: number;
  /** Mock companies using corridor */
  companiesCount?: number;
  /** Primary industries served */
  industries?: string[];
  /** Alias for industries in business context */
  mainIndustries?: string[];
  /** Distance in km (canonical) */
  distanceKm?: number;
  /** Monthly freight tons */
  monthlyVolumeTons?: number;
  /** Open freight orders */
  activeOrders?: number;
  /** Price index 80–140 */
  averagePriceIndex?: number;
  vehicleIcon?: RouteVehicleIcon;
  animationSpeed?: number;
  reliabilityScore?: number;
  co2Estimate?: number;
  /** ISO timestamp string — mock last activity */
  lastActivity?: string;
}

/** City enriched with projected map coordinates and metrics */
export interface MapCityRecord extends City {
  mapX: number;
  mapY: number;
  metrics: MapCityMetrics;
  /** Germany digital twin profile — present for DE cities */
  germanyProfile?: GermanyCityProfile;
  /** Tier-4 local service node data — towns & rural regions */
  localServiceNode?: GermanyLocalServiceNode;
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
