import type { CSSProperties } from 'react';
import type { BusinessRouteDef } from '../types/mapTypes';
import type {
  ActiveMapContext,
  BusinessLayerId,
  LogisticsLayerId,
} from './mapLayerContext';
import { isEuropeOverview } from './mapLayerContext';

export interface MapVisualModeProfile {
  id: string;
  panelTitle: string;
  recommendation: string;
  tickerEyebrow: string;
  tickerMessages: string[];
  markerBrightness: number;
  markerSaturate: number;
  markerGlowColor: string;
  markerGlowStrength: number;
  hubBrightness: number;
  routeEmphasis: number;
}

export const EUROPE_OVERVIEW_PROFILE: MapVisualModeProfile = {
  id: 'europe-overview',
  panelTitle: 'Europe Overview',
  recommendation: 'Explore the full European business operating map — all corridors and hubs visible.',
  tickerEyebrow: 'AI recommendations',
  tickerMessages: [
    'High demand: Berlin → Izium reconstruction logistics',
    'Expand corridor: Warsaw → Kyiv → Izium',
    'Partner match: Istanbul → Odesa maritime logistics',
    'New opportunity: Ukraine rebuilding supply chain',
  ],
  markerBrightness: 1,
  markerSaturate: 1,
  markerGlowColor: 'transparent',
  markerGlowStrength: 0,
  hubBrightness: 1,
  routeEmphasis: 1,
};

function mode(
  id: string,
  panelTitle: string,
  recommendation: string,
  tickerEyebrow: string,
  tickerMessages: string[],
  visual: Partial<Omit<MapVisualModeProfile, 'id' | 'panelTitle' | 'recommendation' | 'tickerEyebrow' | 'tickerMessages'>>,
): MapVisualModeProfile {
  return {
    id,
    panelTitle,
    recommendation,
    tickerEyebrow,
    tickerMessages,
    markerBrightness: visual.markerBrightness ?? 1.1,
    markerSaturate: visual.markerSaturate ?? 1.08,
    markerGlowColor: visual.markerGlowColor ?? 'rgb(59 130 246 / 0.35)',
    markerGlowStrength: visual.markerGlowStrength ?? 0.45,
    hubBrightness: visual.hubBrightness ?? 1.1,
    routeEmphasis: visual.routeEmphasis ?? 1,
  };
}

export const BUSINESS_VISUAL_MODES: Record<BusinessLayerId, MapVisualModeProfile> = {
  marketplace: mode(
    'marketplace',
    'Marketplace Mode',
    'Brighter city glow highlights trading hotspots — discover B2B marketplace opportunities across Europe.',
    'Marketplace signals',
    [
      'Rotterdam → Warsaw wholesale corridor trending',
      'Berlin SME listings up 14% this week',
      'Cross-border marketplace match: Vienna ↔ Prague',
      'High buyer intent in Munich industrial supplies',
    ],
    { markerBrightness: 1.16, markerSaturate: 1.22, markerGlowColor: 'rgb(245 158 11 / 0.42)', markerGlowStrength: 0.55, hubBrightness: 1.12 },
  ),
  transport: mode(
    'transport',
    'Transport Mode',
    'Transport corridors are subtly emphasized — follow freight flows and logistics exchange activity.',
    'Logistics recommendations',
    [
      'Rail slot available: Hamburg → Warsaw corridor',
      'Sea freight demand rising on Rotterdam → Gdańsk',
      'Road capacity opening: Lyon → Milan lane',
      'Air cargo window: Frankfurt → Bucharest express',
    ],
    { markerBrightness: 1.08, markerSaturate: 1.05, markerGlowColor: 'rgb(59 142 222 / 0.38)', routeEmphasis: 1.1, hubBrightness: 1.08 },
  ),
  companies: mode(
    'companies',
    'Companies Mode',
    'Company hub glow intensifies major business centres — ideal for enterprise discovery.',
    'Company hub signals',
    [
      'Frankfurt enterprise cluster activity +11%',
      'Paris HQ relocations trending toward Lyon',
      'Warsaw tech campus expansion noted',
      'Milan fashion houses seeking EU partners',
    ],
    { markerBrightness: 1.12, markerSaturate: 1.1, markerGlowColor: 'rgb(34 211 238 / 0.45)', markerGlowStrength: 0.5, hubBrightness: 1.22 },
  ),
  jobs: mode(
    'jobs',
    'Jobs Mode',
    'Hiring hotspot glow surfaces employment demand — explore open roles by city.',
    'Employment recommendations',
    [
      'Berlin logistics roles +18% week over week',
      'Warsaw engineering hiring surge continues',
      'Remote-ready roles clustering in Dublin',
      'Izium reconstruction projects posting skilled trades',
    ],
    { markerBrightness: 1.14, markerSaturate: 1.15, markerGlowColor: 'rgb(52 199 89 / 0.4)', markerGlowStrength: 0.48, hubBrightness: 1.14 },
  ),
  warehouses: mode(
    'warehouses',
    'Warehouses Mode',
    'Warehouse network feeling — distribution nodes pulse across logistics gateways.',
    'Warehouse network signals',
    [
      'Rotterdam bonded storage at 92% utilization',
      'Warsaw cold-chain expansion corridor active',
      'Hamburg ↔ Berlin fulfillment lane optimized',
      'Prague regional hub capacity opening Q3',
    ],
    { markerBrightness: 1.1, markerSaturate: 1.12, markerGlowColor: 'rgb(255 140 66 / 0.4)', markerGlowStrength: 0.46, hubBrightness: 1.16 },
  ),
  businessServices: mode(
    'businessServices',
    'Business Services Mode',
    'Service network glow connects professional service clusters across Europe.',
    'Service network signals',
    [
      'Brussels compliance advisory demand rising',
      'Zurich fiduciary services match in Prague',
      'Barcelona creative services export growth',
      'Vienna consulting corridor expanding east',
    ],
    { markerBrightness: 1.11, markerSaturate: 1.1, markerGlowColor: 'rgb(167 139 250 / 0.38)', markerGlowStrength: 0.44, hubBrightness: 1.1 },
  ),
  partners: mode(
    'partners',
    'Partners Mode',
    'Collaboration network feeling — partnership-ready cities shine for cross-border alliances.',
    'Partnership signals',
    [
      'Nordic ↔ Baltic partner match score high',
      'Istanbul gateway seeking EU distributors',
      'Lyon manufacturing partner search active',
      'Tallinn digital partners open to DACH market',
    ],
    { markerBrightness: 1.13, markerSaturate: 1.14, markerGlowColor: 'rgb(236 72 153 / 0.38)', markerGlowStrength: 0.47, hubBrightness: 1.12 },
  ),
  academy: mode(
    'academy',
    'Academy Mode',
    'Education ecosystem feeling — learning hubs and training corridors highlighted.',
    'Academy signals',
    [
      'Heidelberg research exchange programs open',
      'Barcelona bootcamp partnerships trending',
      'Warsaw STEM academy cohort filling fast',
      'Vienna executive education cross-border intake',
    ],
    { markerBrightness: 1.12, markerSaturate: 1.16, markerGlowColor: 'rgb(139 92 246 / 0.4)', markerGlowStrength: 0.45, hubBrightness: 1.11 },
  ),
  digitalProducts: mode(
    'digitalProducts',
    'Digital Products Mode',
    'Technology ecosystem feeling — digital product hubs glow across innovation cities.',
    'Digital product signals',
    [
      'SaaS listings surge in Tallinn and Dublin',
      'Berlin product studios seeking EU resellers',
      'Amsterdam fintech APIs open for integration',
      'Prague dev tools marketplace activity +9%',
    ],
    { markerBrightness: 1.15, markerSaturate: 1.18, markerGlowColor: 'rgb(6 182 212 / 0.42)', markerGlowStrength: 0.52, hubBrightness: 1.13 },
  ),
  ai: mode(
    'ai',
    'AI Mode',
    'AI network feeling — intelligent corridors and AI-ready business nodes emphasized.',
    'AI network signals',
    [
      'Frankfurt AI logistics routing pilot live',
      'Warsaw ML talent pool match score 94%',
      'Paris generative commerce tools trending',
      'Helsinki AI compliance sandbox accepting partners',
    ],
    { markerBrightness: 1.17, markerSaturate: 1.2, markerGlowColor: 'rgb(99 102 241 / 0.48)', markerGlowStrength: 0.58, hubBrightness: 1.15 },
  ),
  events: mode(
    'events',
    'Events Mode',
    'Event hotspot feeling — conference and trade-fair cities pulse on the map.',
    'Event hotspot signals',
    [
      'Hanover Messe corridor bookings rising',
      'Barcelona mobile congress spillover demand',
      'Vienna summit week accommodation tight',
      'Milan design week supplier matchmaking open',
    ],
    { markerBrightness: 1.14, markerSaturate: 1.2, markerGlowColor: 'rgb(244 114 182 / 0.4)', markerGlowStrength: 0.5, hubBrightness: 1.12 },
  ),
  investments: mode(
    'investments',
    'Investments Mode',
    'Investment capital feeling — capital flows and funding hotspots subtly highlighted.',
    'Investment signals',
    [
      'Frankfurt VC interest in Warsaw deeptech',
      'Luxembourg fund routing via Amsterdam hub',
      'Berlin seed round activity up 12%',
      'Reconstruction capital targeting Izium corridor',
    ],
    { markerBrightness: 1.13, markerSaturate: 1.12, markerGlowColor: 'rgb(234 179 8 / 0.42)', markerGlowStrength: 0.5, hubBrightness: 1.14 },
  ),
  startups: mode(
    'startups',
    'Startups Mode',
    'Startup innovation feeling — founder ecosystems and scale-up corridors glow.',
    'Startup innovation signals',
    [
      'Berlin ↔ Tallinn founder exchange active',
      'Barcelona healthtech spinouts seeking pilots',
      'Warsaw accelerator demo day inbound interest',
      'Lisbon remote-first startup hiring surge',
    ],
    { markerBrightness: 1.16, markerSaturate: 1.22, markerGlowColor: 'rgb(16 185 129 / 0.42)', markerGlowStrength: 0.54, hubBrightness: 1.13 },
  ),
  manufacturing: mode(
    'manufacturing',
    'Manufacturing Mode',
    'Industrial network feeling — production hubs and supply corridors emphasized.',
    'Industrial network signals',
    [
      'Stuttgart automotive suppliers seeking partners',
      'Turin components corridor capacity available',
      'Wrocław electronics assembly expansion',
      'Lyon aerospace subcontractor match open',
    ],
    { markerBrightness: 1.09, markerSaturate: 1.06, markerGlowColor: 'rgb(148 163 184 / 0.38)', markerGlowStrength: 0.42, hubBrightness: 1.18, routeEmphasis: 1.06 },
  ),
  agriculture: mode(
    'agriculture',
    'Agriculture Mode',
    'Agriculture ecosystem feeling — agrifood corridors and rural trade nodes glow.',
    'Agriculture ecosystem signals',
    [
      'Danube grain corridor storage demand high',
      'Netherlands cold-chain to Poland active',
      'Valencia citrus export season ramping',
      'Kraków organic distributor seeking partners',
    ],
    { markerBrightness: 1.12, markerSaturate: 1.2, markerGlowColor: 'rgb(132 204 22 / 0.4)', markerGlowStrength: 0.46, hubBrightness: 1.1 },
  ),
  construction: mode(
    'construction',
    'Construction Mode',
    'Infrastructure feeling — rebuild and construction supply corridors highlighted.',
    'Infrastructure signals',
    [
      'Izium rebuild materials corridor prioritized',
      'Berlin housing project subcontractor search',
      'Warsaw infrastructure tender activity rising',
      'Prague rail modernization supplier match',
    ],
    { markerBrightness: 1.1, markerSaturate: 1.08, markerGlowColor: 'rgb(249 115 22 / 0.4)', markerGlowStrength: 0.44, hubBrightness: 1.12, routeEmphasis: 1.05 },
  ),
  medical: mode(
    'medical',
    'Medical Mode',
    'Healthcare ecosystem feeling — medical hubs and health logistics nodes emphasized.',
    'Healthcare ecosystem signals',
    [
      'Basel pharma distribution lane stable',
      'Warsaw medtech device listings +10%',
      'Munich hospital procurement window open',
      'Strasbourg cross-border care partnerships',
    ],
    { markerBrightness: 1.13, markerSaturate: 1.1, markerGlowColor: 'rgb(239 68 68 / 0.38)', markerGlowStrength: 0.48, hubBrightness: 1.11 },
  ),
  tourism: mode(
    'tourism',
    'Tourism Mode',
    'Tourism destination feeling — visitor economy hotspots glow across Europe.',
    'Tourism destination signals',
    [
      'Barcelona summer hospitality bookings surge',
      'Vienna cultural tourism partners wanted',
      'Athens cruise transfer corridor active',
      'Prague city-break packages trending DACH',
    ],
    { markerBrightness: 1.15, markerSaturate: 1.18, markerGlowColor: 'rgb(56 189 248 / 0.42)', markerGlowStrength: 0.5, hubBrightness: 1.1 },
  ),
  technology: mode(
    'technology',
    'Technology Mode',
    'Technology hubs feeling — innovation clusters and tech corridors subtly brightened.',
    'Technology hub signals',
    [
      'Munich deep-tech spinout interest rising',
      'Eindhoven semiconductor partners sought',
      'Tallinn cyber talent match score high',
      'Cambridge ↔ Berlin research exchange open',
    ],
    { markerBrightness: 1.16, markerSaturate: 1.15, markerGlowColor: 'rgb(14 165 233 / 0.45)', markerGlowStrength: 0.52, hubBrightness: 1.14 },
  ),
  finance: mode(
    'finance',
    'Finance Mode',
    'Finance network feeling — capital centres and banking corridors highlighted.',
    'Finance network signals',
    [
      'Frankfurt clearing activity steady',
      'Luxembourg fund administration match open',
      'Dublin fintech API partners trending',
      'Zurich wealth services cross-border intake',
    ],
    { markerBrightness: 1.11, markerSaturate: 1.08, markerGlowColor: 'rgb(252 211 77 / 0.42)', markerGlowStrength: 0.46, hubBrightness: 1.16 },
  ),
  legal: mode(
    'legal',
    'Legal Mode',
    'Legal services feeling — regulatory and legal advisory clusters emphasized.',
    'Legal services signals',
    [
      'Brussels regulatory advisory demand high',
      'London ↔ Frankfurt compliance corridor',
      'Warsaw EU law boutique expansion noted',
      'Vienna arbitration hub partner search',
    ],
    { markerBrightness: 1.08, markerSaturate: 1.04, markerGlowColor: 'rgb(100 116 139 / 0.35)', markerGlowStrength: 0.4, hubBrightness: 1.1 },
  ),
  education: mode(
    'education',
    'Education Mode',
    'Education network feeling — universities and training corridors glow softly.',
    'Education network signals',
    [
      'Erasmus corridor activity: Barcelona ↔ Bologna',
      'Warsaw language school partnerships open',
      'Heidelberg research intake cross-border',
      'Dublin edtech credential exchange trending',
    ],
    { markerBrightness: 1.12, markerSaturate: 1.14, markerGlowColor: 'rgb(124 58 237 / 0.4)', markerGlowStrength: 0.47, hubBrightness: 1.11 },
  ),
};

export const LOGISTICS_VISUAL_MODES: Record<LogisticsLayerId, MapVisualModeProfile> = {
  road: mode(
    'road',
    'Road Transport Mode',
    'Road corridors receive subtle emphasis — overland freight lanes glow on the network.',
    'Road transport signals',
    ['Antwerp → Warsaw trucking capacity open', 'Milan → Munich lane utilization 78%', 'Barcelona → Lyon express slot available'],
    { markerBrightness: 1.06, markerSaturate: 1.04, markerGlowColor: 'rgb(59 142 222 / 0.32)', routeEmphasis: 1, hubBrightness: 1.06 },
  ),
  rail: mode(
    'rail',
    'Rail Mode',
    'Rail corridors emphasized — intermodal and freight rail lanes highlighted.',
    'Rail corridor signals',
    ['Hamburg → Warsaw rail slot trending', 'Rotterdam intermodal handoff stable', 'Basel → Milan rail freight demand up'],
    { markerBrightness: 1.06, markerSaturate: 1.05, markerGlowColor: 'rgb(52 199 89 / 0.32)', routeEmphasis: 1, hubBrightness: 1.06 },
  ),
  sea: mode(
    'sea',
    'Sea Freight Mode',
    'Maritime corridors emphasized — port-to-port sea lanes glow on the map.',
    'Sea freight signals',
    ['Rotterdam → Gdańsk container lane active', 'Hamburg → Odesa maritime interest rising', 'Barcelona Mediterranean routing stable'],
    { markerBrightness: 1.06, markerSaturate: 1.04, markerGlowColor: 'rgb(255 140 66 / 0.34)', routeEmphasis: 1, hubBrightness: 1.08 },
  ),
  air: mode(
    'air',
    'Air Cargo Mode',
    'Air cargo corridors emphasized — express aviation lanes highlighted.',
    'Air cargo signals',
    ['Frankfurt → Bucharest express uplift open', 'Paris CDG ↔ Warsaw cargo window', 'Amsterdam air hub cross-dock active'],
    { markerBrightness: 1.07, markerSaturate: 1.05, markerGlowColor: 'rgb(167 139 250 / 0.34)', routeEmphasis: 1, hubBrightness: 1.06 },
  ),
  river: mode(
    'river',
    'River Mode',
    'River corridors emphasized — inland waterway freight lanes highlighted.',
    'River freight signals',
    ['Danube corridor grain movement active', 'Rhine barge capacity available', 'Elbe inland port handoffs stable'],
    { markerBrightness: 1.06, markerSaturate: 1.06, markerGlowColor: 'rgb(34 211 238 / 0.34)', routeEmphasis: 1, hubBrightness: 1.06 },
  ),
};

/** Primary mode for panel copy — business mode wins over logistics when both active. */
export function resolvePrimaryVisualMode(context: ActiveMapContext): MapVisualModeProfile {
  if (context.businessLayer) {
    return BUSINESS_VISUAL_MODES[context.businessLayer];
  }
  if (context.logisticsLayer) {
    return LOGISTICS_VISUAL_MODES[context.logisticsLayer];
  }
  return EUROPE_OVERVIEW_PROFILE;
}

/** Marker/route visual tokens — business personality with logistics as fallback. */
export function resolveMarkerVisualMode(context: ActiveMapContext): MapVisualModeProfile {
  return resolvePrimaryVisualMode(context);
}

export function resolveMapVisualPresentation(context: ActiveMapContext): {
  className: string;
  style: CSSProperties;
} {
  if (isEuropeOverview(context)) {
    return { className: '', style: {} };
  }

  const profile = resolveMarkerVisualMode(context);
  const modeClass = `ebh-map-mode-${profile.id}`;

  return {
    className: `ebh-map-has-visual-mode ${modeClass}`,
    style: {
      '--ebh-mode-marker-brightness': String(profile.markerBrightness),
      '--ebh-mode-marker-saturate': String(profile.markerSaturate),
      '--ebh-mode-glow-color': profile.markerGlowColor,
      '--ebh-mode-glow-strength': String(profile.markerGlowStrength),
      '--ebh-mode-hub-brightness': String(profile.hubBrightness),
    } as CSSProperties,
  };
}

function logisticsRouteEmphasis(
  route: BusinessRouteDef,
  context: ActiveMapContext,
  visibleRoutes: BusinessRouteDef[],
): number {
  const layer = context.logisticsLayer;
  if (!layer) return 1;

  const hasMatchingMode = visibleRoutes.some((entry) => entry.mode === layer);
  if (hasMatchingMode) {
    return route.mode === layer ? 1.26 : 1;
  }

  return 1.12;
}

/** Combined route emphasis — logistics mode matching + optional business mode boost. */
export function resolveRouteEmphasis(
  route: BusinessRouteDef,
  context: ActiveMapContext,
  visibleRoutes: BusinessRouteDef[],
): number {
  let emphasis = logisticsRouteEmphasis(route, context, visibleRoutes);

  const profile = context.businessLayer ? BUSINESS_VISUAL_MODES[context.businessLayer] : null;
  if (profile && profile.routeEmphasis > 1) {
    emphasis *= profile.routeEmphasis;
  }

  if (context.businessLayer === 'transport' && !context.logisticsLayer) {
    emphasis *= route.mode === 'road' || route.mode === 'rail' ? 1.14 : 1.06;
  }

  return emphasis;
}
