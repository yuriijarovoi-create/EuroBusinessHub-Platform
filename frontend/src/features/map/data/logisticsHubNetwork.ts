import type { BusinessRouteDef, RouteScope, TransportMode } from '../types/mapTypes';
import { buildRoute } from './routeBuilder';

/** Primary European logistics command centers */
export const PRIMARY_LOGISTICS_HUBS = [
  'berlin', 'frankfurt', 'hamburg', 'munich', 'amsterdam', 'rotterdam', 'brussels', 'paris',
  'vienna', 'warsaw', 'prague', 'zurich', 'milan', 'rome', 'barcelona', 'madrid', 'budapest',
  'bucharest', 'athens', 'belgrade', 'sofia', 'istanbul', 'kyiv', 'lviv', 'odesa', 'copenhagen',
  'stockholm', 'oslo', 'helsinki', 'tallinn', 'riga', 'vilnius',
] as const;

export const SECONDARY_LOGISTICS_HUBS = [
  'cologne', 'leipzig', 'stuttgart', 'nuremberg', 'lyon', 'marseille', 'lille', 'strasbourg',
  'genoa', 'naples', 'venice', 'bologna', 'florence', 'ljubljana', 'antwerp', 'lehavre',
  'valencia', 'porto', 'lisbon', 'london', 'dublin', 'constanta', 'ankara', 'izmir',
  'zagreb', 'thessaloniki', 'krakow', 'gdansk', 'gothenburg', 'malmo', 'brno', 'hanover',
] as const;

export const ALL_LOGISTICS_HUBS = new Set<string>([
  ...PRIMARY_LOGISTICS_HUBS,
  ...SECONDARY_LOGISTICS_HUBS,
]);

export type NetworkTier = 1 | 2 | 3 | 4;

export interface TransportCorridor {
  id: string;
  name: string;
  mode: TransportMode;
  tier: NetworkTier;
  nodes: string[];
}

const TIER_SCOPE: Record<NetworkTier, RouteScope> = {
  1: 'europe',
  2: 'country',
  3: 'regional',
  4: 'local',
};

const TIER_ZOOM: Record<NetworkTier, { min: number; max: number }> = {
  1: { min: 3, max: 5.99 },
  2: { min: 6, max: 8.99 },
  3: { min: 9, max: 10.99 },
  4: { min: 11, max: 14 },
};

const COUNTRY: Record<string, string> = {
  berlin: 'DE', frankfurt: 'DE', hamburg: 'DE', munich: 'DE', cologne: 'DE', leipzig: 'DE',
  stuttgart: 'DE', nuremberg: 'DE', hanover: 'DE', amsterdam: 'NL', rotterdam: 'NL',
  paris: 'FR', lyon: 'FR', marseille: 'FR', lille: 'FR', strasbourg: 'FR', lehavre: 'FR',
  vienna: 'AT', prague: 'CZ', brno: 'CZ', zurich: 'CH', warsaw: 'PL', krakow: 'PL', gdansk: 'PL',
  kyiv: 'UA', lviv: 'UA', odesa: 'UA', istanbul: 'TR', ankara: 'TR', izmir: 'TR',
  milan: 'IT', rome: 'IT', bologna: 'IT', florence: 'IT', naples: 'IT', venice: 'IT', genoa: 'IT',
  barcelona: 'ES', madrid: 'ES', valencia: 'ES', porto: 'PT', lisbon: 'PT',
  brussels: 'BE', antwerp: 'BE', luxembourg: 'LU', copenhagen: 'DK', stockholm: 'SE', oslo: 'NO',
  helsinki: 'FI', tallinn: 'EE', riga: 'LV', vilnius: 'LT', bucharest: 'RO', constanta: 'RO',
  budapest: 'HU', belgrade: 'RS', sofia: 'BG', athens: 'GR', thessaloniki: 'GR',
  london: 'GB', dublin: 'IE', ljubljana: 'SI', zagreb: 'HR', gothenburg: 'SE', malmo: 'SE',
};

function countriesFor(from: string, to: string): string[] {
  const a = COUNTRY[from];
  const b = COUNTRY[to];
  if (!a) return b ? [b] : [];
  if (!b || a === b) return [a];
  return [a, b];
}

/** LEVEL 1 — European backbone corridors (engineered chains) */
const BACKBONE_CORRIDORS: TransportCorridor[] = [
  { id: 'north-sea', name: 'North Sea Corridor', mode: 'rail', tier: 1, nodes: ['rotterdam', 'amsterdam', 'brussels', 'cologne', 'frankfurt', 'munich', 'vienna'] },
  { id: 'scandinavian', name: 'Scandinavian Corridor', mode: 'rail', tier: 1, nodes: ['oslo', 'stockholm', 'copenhagen', 'hamburg', 'berlin'] },
  { id: 'baltic', name: 'Baltic Corridor', mode: 'rail', tier: 1, nodes: ['helsinki', 'tallinn', 'riga', 'vilnius', 'warsaw'] },
  { id: 'eastern', name: 'Eastern Corridor', mode: 'rail', tier: 1, nodes: ['berlin', 'warsaw', 'lviv', 'kyiv', 'odesa'] },
  { id: 'mediterranean', name: 'Mediterranean Corridor', mode: 'rail', tier: 1, nodes: ['barcelona', 'marseille', 'genoa', 'milan', 'venice', 'ljubljana'] },
  { id: 'italian', name: 'Italian Corridor', mode: 'rail', tier: 1, nodes: ['milan', 'bologna', 'florence', 'rome', 'naples'] },
  { id: 'balkan', name: 'Balkan Corridor', mode: 'rail', tier: 1, nodes: ['vienna', 'budapest', 'belgrade', 'sofia', 'istanbul'] },
  { id: 'atlantic', name: 'Atlantic Corridor', mode: 'rail', tier: 1, nodes: ['madrid', 'barcelona', 'lyon', 'paris', 'brussels', 'amsterdam'] },
  { id: 'france', name: 'France Corridor', mode: 'rail', tier: 1, nodes: ['paris', 'lille', 'strasbourg', 'lyon', 'marseille'] },
  { id: 'germany-internal', name: 'Germany Internal', mode: 'rail', tier: 1, nodes: ['hamburg', 'berlin', 'leipzig', 'frankfurt', 'cologne', 'munich', 'stuttgart', 'nuremberg'] },
  { id: 'rhine-road', name: 'Rhine Road Belt', mode: 'road', tier: 1, nodes: ['rotterdam', 'cologne', 'frankfurt', 'stuttgart', 'munich'] },
  { id: 'alpine-link', name: 'Alpine Link', mode: 'rail', tier: 1, nodes: ['zurich', 'milan', 'vienna'] },
  { id: 'iberia-portugal', name: 'Iberia Spine', mode: 'rail', tier: 1, nodes: ['lisbon', 'porto', 'madrid', 'barcelona'] },
  { id: 'uk-rhine', name: 'UK–Rhine', mode: 'rail', tier: 1, nodes: ['london', 'brussels', 'amsterdam', 'rotterdam'] },
  { id: 'danube', name: 'Danube Axis', mode: 'rail', tier: 1, nodes: ['bucharest', 'budapest', 'vienna', 'prague', 'berlin'] },
  { id: 'north-sea-maritime', name: 'North Sea Maritime', mode: 'sea', tier: 1, nodes: ['rotterdam', 'hamburg', 'antwerp'] },
  { id: 'med-maritime-west', name: 'Med Maritime West', mode: 'sea', tier: 1, nodes: ['lehavre', 'barcelona', 'valencia', 'genoa'] },
  { id: 'med-maritime-east', name: 'Med Maritime East', mode: 'sea', tier: 1, nodes: ['marseille', 'genoa', 'naples', 'athens', 'istanbul'] },
  { id: 'black-sea', name: 'Black Sea Lane', mode: 'sea', tier: 1, nodes: ['constanta', 'odesa', 'istanbul'] },
  { id: 'baltic-sea', name: 'Baltic Sea Lane', mode: 'sea', tier: 1, nodes: ['stockholm', 'copenhagen', 'hamburg'] },
];

const AIR_BACKBONE: Array<[string, string]> = [
  ['berlin', 'frankfurt'],
  ['frankfurt', 'paris'],
  ['amsterdam', 'berlin'],
  ['paris', 'madrid'],
  ['madrid', 'rome'],
  ['warsaw', 'kyiv'],
  ['vienna', 'istanbul'],
  ['rome', 'athens'],
];

/** LEVEL 2 — National corridors */
const NATIONAL_CORRIDORS: TransportCorridor[] = [
  { id: 'nl-feeder', name: 'Netherlands Feeder', mode: 'road', tier: 2, nodes: ['antwerp', 'rotterdam', 'amsterdam'] },
  { id: 'swiss-gate', name: 'Swiss Gateway', mode: 'rail', tier: 2, nodes: ['zurich', 'frankfurt', 'milan'] },
  { id: 'czech-bridge', name: 'Czech Bridge', mode: 'rail', tier: 2, nodes: ['prague', 'vienna', 'berlin'] },
  { id: 'poland-spine', name: 'Poland Spine', mode: 'rail', tier: 2, nodes: ['gdansk', 'warsaw', 'krakow'] },
  { id: 'greece-link', name: 'Greece Link', mode: 'sea', tier: 2, nodes: ['athens', 'istanbul'] },
  { id: 'ireland-sea', name: 'Irish Sea', mode: 'sea', tier: 2, nodes: ['dublin', 'london'] },
  { id: 'adriatic', name: 'Adriatic Feeder', mode: 'sea', tier: 2, nodes: ['venice', 'genoa', 'naples'] },
  { id: 'uk-air', name: 'UK Air Bridge', mode: 'air', tier: 2, nodes: ['london', 'amsterdam'] },
  { id: 'romania-sea', name: 'Romania Maritime', mode: 'sea', tier: 2, nodes: ['constanta', 'bucharest'] },
  { id: 'turkey-feeder', name: 'Turkey Feeder', mode: 'rail', tier: 2, nodes: ['ankara', 'istanbul', 'izmir'] },
];

/** LEVEL 3 — Regional corridors */
const REGIONAL_CORRIDORS: TransportCorridor[] = [
  { id: 'de-north', name: 'DE North Regional', mode: 'road', tier: 3, nodes: ['hanover', 'hamburg', 'berlin'] },
  { id: 'de-south', name: 'DE South Regional', mode: 'road', tier: 3, nodes: ['nuremberg', 'munich', 'stuttgart'] },
  { id: 'fr-rhone', name: 'Rhone Regional', mode: 'rail', tier: 3, nodes: ['lyon', 'marseille'] },
  { id: 'it-north', name: 'North Italy Regional', mode: 'road', tier: 3, nodes: ['genoa', 'milan', 'venice'] },
  { id: 'es-levante', name: 'Levante Regional', mode: 'road', tier: 3, nodes: ['valencia', 'barcelona', 'madrid'] },
  { id: 'balkans-reg', name: 'Balkans Regional', mode: 'road', tier: 3, nodes: ['zagreb', 'ljubljana', 'vienna'] },
  { id: 'nordic-reg', name: 'Nordic Regional', mode: 'rail', tier: 3, nodes: ['gothenburg', 'stockholm', 'malmo', 'copenhagen'] },
  { id: 'greece-reg', name: 'Greece Regional', mode: 'road', tier: 3, nodes: ['thessaloniki', 'athens'] },
];

/** LEVEL 4 — Local hub connections */
const LOCAL_CORRIDORS: TransportCorridor[] = [
  { id: 'cologne-local', name: 'Cologne Local', mode: 'road', tier: 4, nodes: ['cologne', 'frankfurt'] },
  { id: 'leipzig-local', name: 'Leipzig Local', mode: 'rail', tier: 4, nodes: ['leipzig', 'berlin'] },
  { id: 'brno-local', name: 'Brno Local', mode: 'road', tier: 4, nodes: ['brno', 'prague'] },
  { id: 'krakow-local', name: 'Krakow Local', mode: 'rail', tier: 4, nodes: ['krakow', 'warsaw'] },
  { id: 'lille-local', name: 'Lille Local', mode: 'rail', tier: 4, nodes: ['lille', 'paris'] },
  { id: 'porto-local', name: 'Porto Local', mode: 'rail', tier: 4, nodes: ['porto', 'lisbon'] },
];

export const EUROPEAN_TRANSPORT_CORRIDORS: TransportCorridor[] = [
  ...BACKBONE_CORRIDORS,
  ...NATIONAL_CORRIDORS,
  ...REGIONAL_CORRIDORS,
  ...LOCAL_CORRIDORS,
];

export const PORT_ENDPOINTS = new Set([
  'rotterdam', 'hamburg', 'antwerp', 'lehavre', 'marseille', 'barcelona', 'valencia',
  'genoa', 'naples', 'athens', 'odesa', 'istanbul', 'constanta', 'dublin', 'london',
]);

export const AIRPORT_ENDPOINTS = new Set([
  'berlin', 'frankfurt', 'amsterdam', 'paris', 'madrid', 'rome', 'warsaw', 'vienna', 'istanbul',
]);

function corridorSegments(corridor: TransportCorridor): BusinessRouteDef[] {
  const zoom = TIER_ZOOM[corridor.tier];
  const scope = TIER_SCOPE[corridor.tier];
  const routes: BusinessRouteDef[] = [];

  for (let i = 0; i < corridor.nodes.length - 1; i++) {
    const from = corridor.nodes[i];
    const to = corridor.nodes[i + 1];
    routes.push(
      buildRoute({
        id: `corridor-${corridor.id}-${corridor.mode}-${from}-${to}`,
        from,
        to,
        mode: corridor.mode,
        scope,
        relatedCountries: countriesFor(from, to),
        priorityTier: corridor.tier,
        visibleZoomMin: zoom.min,
        visibleZoomMax: zoom.max,
        intensity: corridor.tier === 1 ? 5 : corridor.tier === 2 ? 4 : corridor.tier === 3 ? 3 : 2,
        businessPurpose: corridor.tier === 1 ? 'hub-connection' : 'logistics',
        activeWhenCountrySelected: corridor.tier <= 2,
      }),
    );
  }
  return routes;
}

function airRoutes(): BusinessRouteDef[] {
  const zoom = TIER_ZOOM[1];
  return AIR_BACKBONE.map(([from, to]) =>
    buildRoute({
      id: `corridor-air-backbone-${from}-${to}`,
      from,
      to,
      mode: 'air',
      scope: 'europe',
      relatedCountries: countriesFor(from, to),
      priorityTier: 1,
      visibleZoomMin: zoom.min,
      visibleZoomMax: zoom.max,
      intensity: 5,
      businessPurpose: 'hub-connection',
    }),
  );
}

function isValidTransportRoute(route: BusinessRouteDef): boolean {
  if (route.mode === 'sea') {
    return PORT_ENDPOINTS.has(route.fromCityId) && PORT_ENDPOINTS.has(route.toCityId);
  }
  if (route.mode === 'air') {
    return AIRPORT_ENDPOINTS.has(route.fromCityId) && AIRPORT_ENDPOINTS.has(route.toCityId);
  }
  return true;
}

function dedupeRoutes(routes: BusinessRouteDef[]): BusinessRouteDef[] {
  const seen = new Set<string>();
  const out: BusinessRouteDef[] = [];
  for (const route of routes) {
    const key = `${route.fromCityId}|${route.toCityId}|${route.mode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(route);
  }
  return out;
}

export const LOGISTICS_NETWORK_ROUTES: BusinessRouteDef[] = dedupeRoutes([
  ...BACKBONE_CORRIDORS.flatMap(corridorSegments),
  ...NATIONAL_CORRIDORS.flatMap(corridorSegments),
  ...REGIONAL_CORRIDORS.flatMap(corridorSegments),
  ...LOCAL_CORRIDORS.flatMap(corridorSegments),
  ...airRoutes(),
]).filter(isValidTransportRoute);

export function isPrimaryLogisticsHub(cityId: string): boolean {
  return (PRIMARY_LOGISTICS_HUBS as readonly string[]).includes(cityId);
}

export function isSecondaryLogisticsHub(cityId: string): boolean {
  return (SECONDARY_LOGISTICS_HUBS as readonly string[]).includes(cityId);
}

export function isLogisticsHub(cityId: string): boolean {
  return ALL_LOGISTICS_HUBS.has(cityId);
}

export function backbonePairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export const BACKBONE_PAIR_KEYS = new Set(
  LOGISTICS_NETWORK_ROUTES.filter((r) => r.priorityTier === 1).map((r) =>
    backbonePairKey(r.fromCityId, r.toCityId),
  ),
);

export function corridorWaypointChain(fromCityId: string, toCityId: string): string[] | undefined {
  const key = backbonePairKey(fromCityId, toCityId);
  for (const corridor of EUROPEAN_TRANSPORT_CORRIDORS) {
    const { nodes } = corridor;
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (backbonePairKey(nodes[i], nodes[j]) === key) {
          return nodes.slice(i + 1, j);
        }
      }
    }
  }
  return undefined;
}
