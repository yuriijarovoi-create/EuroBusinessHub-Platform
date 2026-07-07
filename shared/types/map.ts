/** Map navigation hierarchy — Europe → Country → City → Workspace → Modules */

export interface MapCountry {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  /** SVG path for map region (viewBox 0 0 100 70) */
  mapPath: string;
  /** Projection center for zoom-to-country */
  centerX: number;
  centerY: number;
  /** Target scale when country is selected */
  zoomLevel: number;
  /** Geographic center — used for map flyTo when no cities are registered */
  lat?: number;
  lng?: number;
  hubCityId?: string;
  cityIds: string[];
  isHub?: boolean;
}

export interface MapCityMetrics {
  population: number;
  companies: number;
  jobs: number;
  transport: number;
  warehouses: number;
  marketplace: number;
  services: number;
  partners: number;
  digitalProducts: number;
  subscriptions: number;
  aiRequests: number;
  /** 0–100 AI readiness / platform adoption score */
  aiScore: number;
}

/** Full city record for map API (mock → future backend) */
export interface MapCityData {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  metrics: MapCityMetrics;
  activeModules: string[];
  isMajorHub?: boolean;
}

export interface CityWorkspace {
  cityId: string;
  countryCode: string;
  stats: {
    activeUsers: number;
    openOrders: number;
    listings: number;
  };
  metrics: MapCityMetrics;
  modules: WorkspaceModuleAccess[];
}

export interface WorkspaceModuleAccess {
  moduleId: string;
  enabled: boolean;
  route: string;
  labelKey?: string;
}

export type BusinessRouteType =
  | 'logistics'
  | 'cargo'
  | 'truck'
  | 'railway'
  | 'shipping'
  | 'air_cargo';

export interface MapRoute {
  id: string;
  path: string;
  delay: number;
  fromCityId: string;
  toCityId: string;
  type: BusinessRouteType;
  active: boolean;
}

export interface MapViewportState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface MapLiveStat {
  id: string;
  labelKey: string;
  value: number;
  trend?: number;
}

export type MapProviderId =
  | 'svg'
  | 'leaflet'
  | 'maplibre'
  | 'mapbox'
  | 'openstreetmap'
  | 'google';

/** Adapter contract — swap SVG for Leaflet/MapLibre without changing UI */
export interface MapProviderAdapter {
  id: MapProviderId;
  initialize(container: HTMLElement, options: MapAdapterOptions): Promise<void>;
  destroy(): void;
  setViewport(viewport: MapViewportState): void;
  flyTo(center: { lat: number; lng: number }, zoom: number): Promise<void>;
  on(event: 'click' | 'move' | 'zoom', handler: (payload: unknown) => void): void;
}

export interface MapAdapterOptions {
  darkMode?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  style?: string;
}

export type EuropeMapVariant = 'hero' | 'section' | 'fullscreen' | 'interactive';

export type MapNavigationPhase = 'europe' | 'country' | 'city';

export interface MapNavigationState {
  phase: MapNavigationPhase;
  selectedCountryCode: string | null;
  selectedCityId: string | null;
}
