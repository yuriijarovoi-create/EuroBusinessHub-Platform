import type {
  BusinessRouteDef,
  RouteBusinessPurpose,
  RoutePriorityTier,
  RouteScope,
  TransportMode,
} from '../types/mapTypes';

const SCOPE_ZOOM: Record<RouteScope, { min: number; max: number }> = {
  europe: { min: 3, max: 7 },
  country: { min: 6, max: 10 },
  regional: { min: 9, max: 12 },
  local: { min: 11, max: 14 },
};

const TIER_PRIORITY: Record<RoutePriorityTier, number> = {
  1: 100,
  2: 65,
  3: 35,
};

export interface BuildRouteOptions {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  scope: RouteScope;
  relatedCountries: string[];
  priorityTier?: RoutePriorityTier;
  intensity?: number;
  delay?: number;
  fromCountry?: string;
  toCountry?: string;
  businessPurpose?: RouteBusinessPurpose;
  aiRecommended?: boolean;
  activeWhenCountrySelected?: boolean;
  visibleZoomMin?: number;
  visibleZoomMax?: number;
}

export function buildRoute(opts: BuildRouteOptions): BusinessRouteDef {
  const zoom = SCOPE_ZOOM[opts.scope];
  const tier = opts.priorityTier ?? defaultTier(opts.scope);
  return {
    id: opts.id,
    fromCityId: opts.from,
    toCityId: opts.to,
    mode: opts.mode,
    type: opts.mode,
    active: true,
    intensity: opts.intensity ?? (tier === 1 ? 4 : 3),
    delay: opts.delay ?? 0,
    fromCountry: opts.fromCountry,
    toCountry: opts.toCountry,
    countryScope: opts.relatedCountries,
    relatedCountries: opts.relatedCountries,
    scope: opts.scope,
    level: opts.scope,
    businessPurpose: opts.businessPurpose ?? defaultPurpose(opts.scope),
    priorityTier: tier,
    priority: TIER_PRIORITY[tier] + (opts.intensity ?? 3),
    aiRecommended: opts.aiRecommended ?? tier <= 2,
    activeWhenCountrySelected: opts.activeWhenCountrySelected ?? opts.scope === 'europe',
    visibleZoomMin: opts.visibleZoomMin ?? zoom.min,
    visibleZoomMax: opts.visibleZoomMax ?? zoom.max,
  };
}

function defaultTier(scope: RouteScope): RoutePriorityTier {
  if (scope === 'europe') return 1;
  if (scope === 'country') return 2;
  return 3;
}

function defaultPurpose(scope: RouteScope): RouteBusinessPurpose {
  if (scope === 'europe') return 'hub-connection';
  if (scope === 'country') return 'logistics';
  return 'trade';
}

type BatchItem = [
  from: string,
  to: string,
  mode: TransportMode,
  scope: RouteScope,
  countries: string[],
  tier?: RoutePriorityTier,
  intensity?: number,
];

export function buildRouteBatch(list: BatchItem[], prefix: string): BusinessRouteDef[] {
  return list.map(([from, to, mode, scope, countries, tier, intensity], i) =>
    buildRoute({
      id: `${prefix}-${mode}-${from}-${to}`,
      from,
      to,
      mode,
      scope,
      relatedCountries: countries,
      priorityTier: tier,
      intensity,
      delay: (i * 0.04) % 0.8,
      activeWhenCountrySelected: scope === 'europe' || scope === 'country',
    }),
  );
}
