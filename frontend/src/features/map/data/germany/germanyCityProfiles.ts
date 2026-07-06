import type {
  GermanyActivityItem,
  GermanyCityProfile,
  GermanyInfrastructure,
  GermanyTradePartner,
} from '../../types/germanyTypes';
import { BUNDESLAENDER, CITY_BUNDESLAND_MAP } from './bundeslandData';
import { getGermanyCityMeta } from './germanyCityMeta';
import { getGermanyCityEnrichment } from './germanyCityEnrichment';

const CITY_TRAITS: Record<
  string,
  Partial<
    Pick<
      GermanyCityProfile,
      'financeScore' | 'techScore' | 'logisticsScore' | 'innovationScore' | 'gdpEstimateBillionEur'
    > & { infra?: Partial<GermanyInfrastructure> }
  >
> = {
  frankfurt: {
    financeScore: 98,
    logisticsScore: 92,
    gdpEstimateBillionEur: 78,
    infra: {
      airports: ['Frankfurt Airport (FRA)', 'Frankfurt-Hahn Cargo'],
      railwayCargoTerminal: 'Frankfurt Main Cargo Terminal',
      inlandPort: 'Main River Port',
      motorwayConnections: ['A3', 'A5', 'A66'],
      industrialZones: ['Frankfurt Gateway Gardens', 'Cargo City Süd'],
      logisticsHubs: ['FRA Air Cargo Hub', 'Rhine-Main Logistics Cluster'],
    },
  },
  hamburg: {
    logisticsScore: 99,
    gdpEstimateBillionEur: 62,
    infra: {
      airports: ['Hamburg Airport (HAM)'],
      railwayCargoTerminal: 'HHLA Rail Terminal',
      inlandPort: 'Port of Hamburg — Europas drittgrößter Seehafen',
      motorwayConnections: ['A1', 'A7', 'A24'],
      industrialZones: ['Wilhelmsburg Logistics Park', 'Veddel Cargo'],
      logisticsHubs: ['Container Terminal Altenwerder', 'HHLA CTA'],
    },
  },
  munich: {
    techScore: 94,
    logisticsScore: 85,
    gdpEstimateBillionEur: 71,
    infra: {
      airports: ['Munich Airport (MUC)'],
      railwayCargoTerminal: 'Munich East Freight Yard',
      motorwayConnections: ['A8', 'A9', 'A99'],
      industrialZones: ['Freimann Industrial', 'Automotive Cluster'],
      logisticsHubs: ['MUC Cargo City', 'Bavaria Tech Logistics'],
    },
  },
  berlin: {
    innovationScore: 96,
    techScore: 91,
    gdpEstimateBillionEur: 68,
    infra: {
      airports: ['Berlin Brandenburg (BER)'],
      railwayCargoTerminal: 'Südkreuz / Westhafen Cargo',
      inlandPort: 'Westhafen Inland Port',
      motorwayConnections: ['A10', 'A100', 'A113'],
      industrialZones: ['Adlershof Science Park', 'TXL Innovation Hub'],
      logisticsHubs: ['Berlin Hub — EuroBusinessHub HQ', 'Spree Logistics Belt'],
    },
  },
  cologne: {
    logisticsScore: 88,
    gdpEstimateBillionEur: 48,
    infra: {
      airports: ['Cologne Bonn Airport (CGN)'],
      railwayCargoTerminal: 'Köln Eifeltor Freight',
      inlandPort: 'Rhine Port Cologne',
      motorwayConnections: ['A1', 'A3', 'A4'],
      industrialZones: ['MediaPark', 'Porz Industrial'],
      logisticsHubs: ['Rhine Logistics Cologne', 'CGN Cargo'],
    },
  },
  leipzig: {
    logisticsScore: 90,
    gdpEstimateBillionEur: 32,
    infra: {
      airports: ['Leipzig Halle Airport (LEJ) — DHL Hub'],
      railwayCargoTerminal: 'Leipzig Messe Cargo Terminal',
      motorwayConnections: ['A9', 'A14', 'A38'],
      industrialZones: ['Leipzig West Industrial', 'Distribution Park'],
      logisticsHubs: ['DHL Hub LEJ', 'Amazon Fulfilment Leipzig'],
    },
  },
  stuttgart: {
    techScore: 88,
    logisticsScore: 82,
    gdpEstimateBillionEur: 52,
    infra: {
      airports: ['Stuttgart Airport (STR)'],
      railwayCargoTerminal: 'Kornwestheim Freight',
      motorwayConnections: ['A8', 'A81', 'A831'],
      industrialZones: ['Automotive Valley', 'Neckar Industrial'],
      logisticsHubs: ['Mercedes-Benz Logistics', 'Porsche Supply Chain'],
    },
  },
  duesseldorf: { financeScore: 85, logisticsScore: 86, gdpEstimateBillionEur: 44 },
  dortmund: {
    logisticsScore: 84,
    gdpEstimateBillionEur: 28,
    infra: {
      railwayCargoTerminal: 'Dortmund Hbf Freight',
      motorwayConnections: ['A1', 'A2', 'A40', 'A45'],
      logisticsHubs: ['Ruhr Logistics Corridor'],
    },
  },
  essen: { logisticsScore: 83, gdpEstimateBillionEur: 26 },
  bremen: {
    logisticsScore: 87,
    infra: {
      inlandPort: 'Bremen / Bremerhaven Port Complex',
      logisticsHubs: ['Auto Terminal Bremerhaven'],
    },
  },
  rostock: { logisticsScore: 78, infra: { inlandPort: 'Rostock Overseas Port' } },
  kiel: { logisticsScore: 72, infra: { inlandPort: 'Kiel Canal Logistics' } },
};

const DEFAULT_PARTNERS: GermanyTradePartner[] = [
  { partner: 'Niederlande', countryCode: 'NL', volumeMillionEur: 42 },
  { partner: 'Frankreich', countryCode: 'FR', volumeMillionEur: 38 },
  { partner: 'Polen', countryCode: 'PL', volumeMillionEur: 35 },
  { partner: 'China', countryCode: 'CN', volumeMillionEur: 31 },
  { partner: 'USA', countryCode: 'US', volumeMillionEur: 28 },
];

function defaultInfra(cityName: string): GermanyInfrastructure {
  return {
    airports: [`${cityName} Regional Airport`],
    railwayCargoTerminal: `${cityName} Güterbahnhof`,
    motorwayConnections: ['A3', 'A7'],
    industrialZones: [`${cityName} Gewerbepark`],
    logisticsHubs: [`${cityName} Logistikzentrum`],
  };
}

function buildActivity(cityName: string, seed: number): GermanyActivityItem[] {
  const types: GermanyActivityItem['type'][] = ['transport', 'marketplace', 'jobs', 'warehouse', 'ai'];
  return types.map((type, i) => ({
    id: `${type}-${i}`,
    type,
    label: `${cityName}: ${type} +${(seed % 40) + 5}`,
    timestamp: `${(i + 1) * 3} min ago`,
  }));
}

export function getGermanyCityProfile(cityId: string, cityName: string, businesses: number): GermanyCityProfile {
  const bundeslandId = CITY_BUNDESLAND_MAP[cityId] ?? 'DE-NW';
  const bl = BUNDESLAENDER.find((b) => b.id === bundeslandId)!;
  const meta = getGermanyCityMeta(cityId);
  const enrich = getGermanyCityEnrichment(cityId);
  const traits = CITY_TRAITS[cityId] ?? {};
  const base = businesses * 0.08;

  const logistics = enrich?.logisticsScore ?? traits.logisticsScore ?? Math.min(90, 38 + (businesses % 48));
  const tech = enrich?.techScore ?? traits.techScore ?? Math.min(92, 35 + (businesses % 45));
  const finance = enrich?.financeScore ?? traits.financeScore ?? Math.min(95, 40 + (businesses % 50));
  const innovation = enrich?.innovationScore ?? traits.innovationScore ?? Math.min(94, 30 + (businesses % 55));
  const businessIndex =
    enrich?.businessIndex ??
    Math.round((logistics + tech + finance + innovation) / 4);

  return {
    bundeslandId,
    bundeslandName: bl.name,
    mapTier: meta.tier,
    population: meta.population,
    mainIndustry: meta.mainIndustry,
    transportRole: meta.transportRole,
    gdpEstimateBillionEur:
      enrich?.gdpEstimateBillionEur ?? traits.gdpEstimateBillionEur ?? Math.round(base * 10) / 10,
    financeScore: finance,
    techScore: tech,
    logisticsScore: logistics,
    innovationScore: innovation,
    businessIndex,
    tourismScore: enrich?.tourismScore,
    infrastructure: { ...defaultInfra(cityName), ...traits.infra, ...enrich?.infra },
    topTradePartners: DEFAULT_PARTNERS.map((p, i) => ({
      ...p,
      volumeMillionEur: p.volumeMillionEur + (businesses % 20) - i * 2,
    })),
    recentActivity: buildActivity(cityName, businesses),
  };
}

export function getBundeslandStats(bundeslandId: string, cityIds: string[], businessesSum: number) {
  const bl = BUNDESLAENDER.find((b) => b.id === bundeslandId);
  return {
    bundeslandId,
    name: bl?.name ?? bundeslandId,
    cityCount: cityIds.length,
    totalBusinesses: businessesSum,
    gdpEstimateBillionEur: Math.round(businessesSum * 0.06 * 10) / 10,
    logisticsScore: Math.min(99, 50 + cityIds.length * 3),
  };
}
