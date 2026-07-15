import type { City, ModuleId } from '@shared/types';
import type { GermanyLocalServiceNode, GermanyLocalUseCase } from '../../types/germanyTypes';
import {
  GERMANY_LOCAL_NODE_DEFS,
  GERMANY_LOCAL_NODE_ENRICH_IDS,
  type RawLocalNodeDef,
} from './germanyLocalNodes.generated';
import {
  GERMANY_LOCAL_NODE_RURAL_DEFS,
  GERMANY_LOCAL_NODE_RURAL_ENRICH,
} from './germanyLocalNodesRural.generated';
import { GERMANY_RP_NODE_DEFS } from './germanyRheinlandPfalzNodes.generated';
import { GERMANY_SAARLAND_NODE_DEFS } from './germanySaarlandNodes.generated';
import { GERMANY_HESSEN_NODE_DEFS } from './germanyHessenNodes.generated';
import { GERMANY_BW_NODE_DEFS } from './germanyBadenWuerttembergNodes.generated';
import { GERMANY_BY_NODE_DEFS } from './germanyBayernNodes.generated';
import {
  dedupeSettlementDefs,
  DUPLICATE_SETTLEMENT_SLUGS,
  inferSettlementMapTier,
  type SettlementMapTier,
} from './settlementTierUtils';

const RURAL_SEED_DEFS = GERMANY_LOCAL_NODE_RURAL_DEFS.filter(
  (def) => !DUPLICATE_SETTLEMENT_SLUGS.has(def.id),
);

const GERMANY_LOCAL_NODE_SEED_DEFS = dedupeSettlementDefs([
  ...GERMANY_LOCAL_NODE_DEFS,
  ...RURAL_SEED_DEFS,
  ...GERMANY_RP_NODE_DEFS,
  ...GERMANY_SAARLAND_NODE_DEFS,
  ...GERMANY_HESSEN_NODE_DEFS,
  ...GERMANY_BW_NODE_DEFS,
  ...GERMANY_BY_NODE_DEFS,
]);

const SEED_DEF_IDS = new Set(GERMANY_LOCAL_NODE_SEED_DEFS.map((def) => def.id));

const FILTERED_RURAL_ENRICH = GERMANY_LOCAL_NODE_RURAL_ENRICH.filter(
  (def) => !SEED_DEF_IDS.has(def.id) && !DUPLICATE_SETTLEMENT_SLUGS.has(def.id),
);

type Seed = Omit<City, 'mapX' | 'mapY'> & { mapX?: number; mapY?: number; mapTier?: SettlementMapTier };

const DEFAULT_USE_CASES: GermanyLocalUseCase[] = [
  'local_transport',
  'moving_service',
  'warehouse_near_me',
  'jobs_near_me',
  'craftsmen',
  'business_services',
  'local_marketplace',
  'regional_logistics',
];

function scaleMetrics(population: number) {
  const companies = Math.max(28, Math.min(120, Math.round(population / 120)));
  const jobs = Math.max(12, Math.round(companies * 0.38));
  const warehouses = Math.max(1, Math.round(companies / 35));
  const transportOffers = Math.max(8, Math.round(companies * 0.45));
  const marketplaceOffers = Math.max(10, Math.round(companies * 0.55));
  const aiScore = Math.min(72, 42 + Math.round(population / 8000));
  return { companies, jobs, warehouses, transportOffers, marketplaceOffers, aiScore };
}

function defaultServices(name: string, region: string, tourism?: boolean): Pick<
  GermanyLocalServiceNode,
  'localServices' | 'craftServices' | 'movingServices' | 'smallTransport' | 'storageOptions' | 'nearbyHubs'
> {
  const hubs = [`${region} Verteiler`, `${name} Gewerbepark`];
  const base = {
    localServices: [
      `${name} Handwerker-Netzwerk`,
      `${region} Business Services`,
      `${name} Steuerberatung & Verwaltung`,
    ],
    craftServices: [`Maler & Bodenleger ${name}`, `Elektro & Sanitär ${region}`, `Schreiner ${name}`],
    movingServices: [`Umzug ${name} — Regional`, `${region} Möbeltransport`, `Express Umzug ${name}`],
    smallTransport: [
      `${name} Kleintransporter (3,5t)`,
      `${region} Same-Day Kurier`,
      `${name} Möbel & Paletten`,
    ],
    storageOptions: [
      `${name} Self-Storage`,
      `${region} Lagerboxen`,
      `${name} Landwirtschaftliche Lagerfläche`,
    ],
    nearbyHubs: hubs,
  };
  if (tourism) {
    base.localServices.push(`${name} Tourismus-Services`, `${region} Event-Logistik`);
  }
  return base;
}

function buildProfile(def: RawLocalNodeDef): GermanyLocalServiceNode {
  const m = scaleMetrics(def.population);
  const useCases: GermanyLocalUseCase[] = [...DEFAULT_USE_CASES];
  if (def.tourism) useCases.push('tourism_services');
  if (def.region.match(/Eifel|Mosel|Harz|Allgäu|Alpen|Ostsee|Vorpommern|Ahr|Maifeld/i)) {
    useCases.push('agricultural_services');
  }

  const logisticsScore = Math.min(72, 38 + Math.round(def.population / 6000));
  const tourismScore = def.tourism
    ? Math.min(88, 55 + Math.round(def.population / 2500))
    : undefined;

  const services = defaultServices(def.name, def.region, def.tourism);
  services.nearbyHubs = [
    def.nearestMajorCity,
    ...services.nearbyHubs,
  ].slice(0, 4);

  return {
    federalState: def.federalState,
    region: def.region,
    population: def.population,
    companies: m.companies,
    jobs: m.jobs,
    warehouses: m.warehouses,
    transportOffers: m.transportOffers,
    marketplaceOffers: m.marketplaceOffers,
    ...services,
    nearestMajorCity: def.nearestMajorCity,
    nearestMajorCityId: def.nearestMajorCityId,
    aiScore: m.aiScore,
    logisticsScore,
    tourismScore,
    mainUseCases: useCases,
    recommendedHubRoute: `${def.name} → ${def.nearestMajorCity} (Bahn / A-Route)`,
  };
}

function toCitySeed(def: RawLocalNodeDef, profile: GermanyLocalServiceNode): Seed {
  const modules: ModuleId[] = ['marketplace', 'transport', 'logistik', 'jobs', 'partner'];
  const mapTier = inferSettlementMapTier(def);
  return {
    id: def.id,
    name: def.name,
    country: 'Deutschland',
    countryCode: 'DE',
    lat: def.lat,
    lng: def.lng,
    businesses: profile.companies,
    activeModules: modules,
    mapTier,
    population: def.population,
  };
}

const ALL_DEFS = dedupeSettlementDefs([
  ...GERMANY_LOCAL_NODE_SEED_DEFS,
  ...GERMANY_LOCAL_NODE_ENRICH_IDS,
  ...FILTERED_RURAL_ENRICH,
]);

export const GERMANY_LOCAL_NODE_PROFILES: Record<string, GermanyLocalServiceNode> = Object.fromEntries(
  ALL_DEFS.map((def) => [def.id, buildProfile(def)]),
);

/** Tier-4 city seeds — appended to global cities list */
export const germanyLocalNodeCities: Seed[] = GERMANY_LOCAL_NODE_SEED_DEFS.map((def) =>
  toCitySeed(def, GERMANY_LOCAL_NODE_PROFILES[def.id]!),
);

export function getGermanyLocalServiceNode(cityId: string): GermanyLocalServiceNode | undefined {
  return GERMANY_LOCAL_NODE_PROFILES[cityId];
}

export function isGermanyLocalServiceNode(cityId: string): boolean {
  return cityId in GERMANY_LOCAL_NODE_PROFILES;
}

/** Meta entries for tier-4 local nodes (new seeds only) */
export function getGermanyLocalNodeMeta(cityId: string) {
  const def = GERMANY_LOCAL_NODE_SEED_DEFS.find((d) => d.id === cityId);
  if (!def) return undefined;
  const industry =
    def.tourism ? 'Tourismus & Handwerk' : `${def.region} — Dienstleistung & Logistik`;
  return {
    tier: inferSettlementMapTier(def),
    population: def.population,
    mainIndustry: industry,
    transportRole: `Regional — Anbindung ${def.nearestMajorCity}`,
  };
}

export const GERMANY_LOCAL_NODE_BUNDESLAND_MAP: Record<string, string> = Object.fromEntries(
  ALL_DEFS.map((d) => [d.id, d.bundeslandId]),
);
