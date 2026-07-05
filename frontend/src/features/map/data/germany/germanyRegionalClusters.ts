import type { City, ModuleId } from '@shared/types';
import type { BusinessRouteDef } from '../../types/mapTypes';
import type {
  GermanyInfrastructure,
  GermanyLocalServiceNode,
  GermanyLocalUseCase,
} from '../../types/germanyTypes';
import {
  GERMANY_REGIONAL_CLUSTER_DEFS,
  GERMANY_REGIONAL_CLUSTER_ROUTES_RAW,
  type RawRegionalClusterDef,
} from './germanyRegionalClusters.generated';

type Seed = Omit<City, 'mapX' | 'mapY'> & { mapX?: number; mapY?: number; mapTier?: 4 };

export interface GermanyRegionalClusterData {
  hubCityId: string;
  hubCityName: string;
  region: string;
  federalState: string;
  population: number;
  companies: number;
  jobs: number;
  warehouses: number;
  transportOffers: number;
  marketplaceOffers: number;
  aiScore: number;
  transportScore: number;
  innovationScore: number;
  sustainabilityScore: number;
  industrialZones: string[];
  localServices: string[];
  infrastructure: GermanyInfrastructure;
  localServiceNode: GermanyLocalServiceNode;
}

const METRO_USE_CASES: GermanyLocalUseCase[] = [
  'local_transport',
  'moving_service',
  'warehouse_near_me',
  'jobs_near_me',
  'craftsmen',
  'business_services',
  'local_marketplace',
  'regional_logistics',
];

function scaleMetroMetrics(population: number) {
  const companies = Math.max(38, Math.min(145, Math.round(population / 95)));
  const jobs = Math.max(18, Math.round(companies * 0.42));
  const warehouses = Math.max(2, Math.round(companies / 28));
  const transportOffers = Math.max(14, Math.round(companies * 0.52));
  const marketplaceOffers = Math.max(16, Math.round(companies * 0.58));
  const aiScore = Math.min(78, 48 + Math.round(population / 6500));
  const transportScore = Math.min(88, 55 + Math.round(companies / 4));
  const innovationScore = Math.min(82, 50 + Math.round(companies / 5));
  const sustainabilityScore = Math.min(85, 52 + Math.round(population / 9000));
  return {
    companies,
    jobs,
    warehouses,
    transportOffers,
    marketplaceOffers,
    aiScore,
    transportScore,
    innovationScore,
    sustainabilityScore,
  };
}

function buildInfrastructure(def: RawRegionalClusterDef, name: string): GermanyInfrastructure {
  return {
    airports: [`${def.hubCityName} Metro Airport — ${Math.round(def.population / 1000)} km`],
    railwayCargoTerminal: `${name} S-Bahn / Regional Güteranbindung`,
    motorwayConnections: ['A-Schnellweg Regional', 'B-Kreisverkehr'],
    industrialZones: [
      `${name} Gewerbepark`,
      `${def.region} Logistikfläche`,
      `${def.hubCityName} Metro Supply Chain`,
    ],
    logisticsHubs: [
      `${def.region} Verteiler`,
      `${def.hubCityName} — ${name} Korridor`,
    ],
  };
}

function buildCluster(def: RawRegionalClusterDef): GermanyRegionalClusterData {
  const m = scaleMetroMetrics(def.population);
  const infra = buildInfrastructure(def, def.name);
  const localServiceNode: GermanyLocalServiceNode = {
    federalState: def.federalState,
    region: def.region,
    population: def.population,
    companies: m.companies,
    jobs: m.jobs,
    warehouses: m.warehouses,
    transportOffers: m.transportOffers,
    marketplaceOffers: m.marketplaceOffers,
    localServices: [
      `${def.name} Business Center`,
      `${def.region} IT & Services`,
      `${def.hubCityName} Metro Partnernetz`,
    ],
    craftServices: [
      `Handwerk ${def.name}`,
      `${def.region} Elektro & Bau`,
      `${def.name} Facility Services`,
    ],
    movingServices: [
      `${def.name} → ${def.hubCityName} Umzug`,
      `${def.region} Express Möbeltransport`,
    ],
    smallTransport: [
      `${def.name} Last-Mile (3,5t)`,
      `${def.region} Same-Day`,
      `${def.hubCityName} Metro Shuttle`,
    ],
    storageOptions: [
      `${def.name} Lagerbox`,
      `${def.region} Mini-Warehouse`,
      `${def.hubCityName} Hub Overflow`,
    ],
    nearbyHubs: [def.hubCityName, def.region, ...infra.logisticsHubs].slice(0, 4),
    nearestMajorCity: def.hubCityName,
    nearestMajorCityId: def.hubCityId,
    aiScore: m.aiScore,
    mainUseCases: METRO_USE_CASES,
    recommendedHubRoute: `${def.name} → ${def.hubCityName} (S-Bahn / Regionalbahn / A-Ring)`,
  };

  return {
    hubCityId: def.hubCityId,
    hubCityName: def.hubCityName,
    region: def.region,
    federalState: def.federalState,
    population: def.population,
    ...m,
    industrialZones: infra.industrialZones,
    localServices: localServiceNode.localServices,
    infrastructure: infra,
    localServiceNode,
  };
}

export const GERMANY_REGIONAL_CLUSTER_DATA: Record<string, GermanyRegionalClusterData> =
  Object.fromEntries(GERMANY_REGIONAL_CLUSTER_DEFS.map((d) => [d.id, buildCluster(d)]));

export const germanyRegionalClusterCities: Seed[] = GERMANY_REGIONAL_CLUSTER_DEFS.map((def) => {
  const cluster = GERMANY_REGIONAL_CLUSTER_DATA[def.id]!;
  const modules: ModuleId[] = ['marketplace', 'transport', 'logistik', 'jobs', 'partner', 'unternehmen'];
  return {
    id: def.id,
    name: def.name,
    country: 'Deutschland',
    countryCode: 'DE',
    lat: def.lat,
    lng: def.lng,
    businesses: cluster.companies,
    activeModules: modules,
    mapTier: 4,
  };
});

export const GERMANY_REGIONAL_CLUSTER_BUNDESLAND_MAP: Record<string, string> = Object.fromEntries(
  GERMANY_REGIONAL_CLUSTER_DEFS.map((d) => [d.id, d.bundeslandId]),
);

export function getGermanyRegionalCluster(cityId: string): GermanyRegionalClusterData | undefined {
  return GERMANY_REGIONAL_CLUSTER_DATA[cityId];
}

export function getGermanyRegionalClusterMeta(cityId: string) {
  const def = GERMANY_REGIONAL_CLUSTER_DEFS.find((d) => d.id === cityId);
  if (!def) return undefined;
  return {
    tier: 4 as const,
    population: def.population,
    mainIndustry: `${def.region} — Metro Business`,
    transportRole: `Satellit ${def.hubCityName}`,
  };
}

export const GERMANY_REGIONAL_CLUSTER_ROUTES: BusinessRouteDef[] =
  GERMANY_REGIONAL_CLUSTER_ROUTES_RAW.map(([from, to, mode, intensity], i) => ({
    id: `de-cluster-${mode}-${from}-${to}`,
    fromCityId: from,
    toCityId: to,
    mode,
    active: true,
    delay: (i * 0.04) % 0.8,
    intensity,
  }));

export function isGermanyRegionalClusterCity(cityId: string): boolean {
  return cityId in GERMANY_REGIONAL_CLUSTER_DATA;
}
