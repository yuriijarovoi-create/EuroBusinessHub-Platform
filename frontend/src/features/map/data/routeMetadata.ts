import type { BusinessRouteDef, RoutePriorityLevel, TransportMode } from '../types/mapTypes';
import { CITY_BY_ID } from './routeCityIndex';
import { routeDistanceKm } from '../utils/routeGeometry';
import { vehicleIconForMode } from '../utils/routeVehicleIcons';

const AVG_SPEED_KMH: Record<TransportMode, number> = {
  road: 68,
  rail: 95,
  air: 720,
  sea: 32,
  river: 22,
};

const INDUSTRIES_BY_MODE: Record<TransportMode, string[]> = {
  road: ['Retail', 'Manufacturing', 'E-commerce'],
  rail: ['Automotive', 'Steel', 'Chemicals'],
  air: ['Pharma', 'Electronics', 'Express'],
  sea: ['Containers', 'Bulk goods', 'Energy'],
  river: ['Chemicals', 'Agriculture', 'Construction'],
};

/** Known high-activity corridors — mock live operations data */
const LIVE_CORRIDOR_OVERRIDES: Record<string, Partial<BusinessRouteDef>> = {
  'corridor-rail-berlin-hamburg': { activeOffers: 18, activeOrders: 14 },
  'de-rail-berlin-hamburg': { activeOffers: 18, activeOrders: 14 },
  'corridor-air-frankfurt-paris': { activeOffers: 12, activeOrders: 9 },
  'de-sea-duisburg-rotterdam': { activeOffers: 24, activeOrders: 18 },
  'corridor-road-cologne-rotterdam': { activeOffers: 24, activeOrders: 18 },
  'de-road-cologne-rotterdam': { activeOffers: 24, activeOrders: 18 },
  'corridor-sea-rotterdam-hamburg': { activeOffers: 16, activeOrders: 11 },
  'corridor-rail-munich-vienna': { activeOffers: 9, activeOrders: 7 },
  'corridor-sea-hamburg-copenhagen': { activeOffers: 7, activeOrders: 5 },
  'corridor-rail-frankfurt-cologne': { activeOffers: 15, activeOrders: 11 },
  'eu-east-rail-izium-kyiv': { activeOffers: 22, activeOrders: 16 },
  'eu-east-rail-izium-warsaw': { activeOffers: 18, activeOrders: 14 },
  'eu-east-rail-izium-berlin': { activeOffers: 15, activeOrders: 11 },
  'eu-east-rail-izium-frankfurt': { activeOffers: 14, activeOrders: 10 },
  'eu-east-rail-istanbul-sofia': { activeOffers: 20, activeOrders: 15 },
  'eu-east-rail-istanbul-budapest': { activeOffers: 17, activeOrders: 12 },
  'eu-east-air-istanbul-berlin': { activeOffers: 11, activeOrders: 8 },
  'eu-east-rail-kyiv-kharkiv': { activeOffers: 16, activeOrders: 12 },
  'eu-east-rail-odesa-izium': { activeOffers: 16, activeOrders: 12 },
  'eu-east-rail-istanbul-izmir': { activeOffers: 21, activeOrders: 15 },
  'eu-east-road-krakow-lviv': { activeOffers: 14, activeOrders: 10 },
  'fr-rail-paris-rotterdam': { activeOffers: 28, activeOrders: 21 },
  'fr-rail-paris-lehavre': { activeOffers: 22, activeOrders: 16 },
  'fr-rail-lyon-marseille': { activeOffers: 19, activeOrders: 14 },
  'fr-rail-lille-brussels': { activeOffers: 24, activeOrders: 18 },
  'fr-sea-marseille-genoa': { activeOffers: 17, activeOrders: 12 },
  'corridor-rail-paris-brussels': { activeOffers: 26, activeOrders: 19 },
  'corridor-rail-paris-lyon': { activeOffers: 20, activeOrders: 15 },
};

function inferRoutePriority(scope: string, tier?: number): RoutePriorityLevel {
  if (scope === 'europe' || tier === 1) return 'primary';
  if (scope === 'country' || tier === 2) return 'secondary';
  return 'local';
}

function inferCategory(mode: TransportMode) {
  if (mode === 'air') return 'pharma' as const;
  if (mode === 'rail') return 'automotive' as const;
  if (mode === 'river') return 'energy' as const;
  return 'logistics' as const;
}

/** Compute mock business metrics from city coordinates */
export function enrichRouteMetrics(route: BusinessRouteDef): BusinessRouteDef {
  const from = CITY_BY_ID.get(route.fromCityId);
  const to = CITY_BY_ID.get(route.toCityId);
  if (!from || !to) return route;

  const override = LIVE_CORRIDOR_OVERRIDES[route.id];
  const distanceKm = Math.round(routeDistanceKm(from, to));
  const intensity = route.intensity ?? 3;
  const speed = AVG_SPEED_KMH[route.mode];
  const estimatedTime = Math.round((distanceKm / speed) * 10) / 10;
  const monthlyVolumeTons =
    route.monthlyVolumeTons ?? route.volume ?? Math.round(distanceKm * intensity * 14 + 120);
  const activeOffers =
    override?.activeOffers ?? route.activeOffers ?? Math.max(3, Math.round(monthlyVolumeTons / 38));
  const activeOrders =
    override?.activeOrders ?? route.activeOrders ?? Math.max(2, Math.round(activeOffers * 0.72));
  const companiesCount =
    route.companiesCount ?? Math.max(8, Math.round((from.businesses + to.businesses) / 180));
  const scope = route.scope ?? route.level ?? 'country';
  const routePriority =
    route.routePriority ?? inferRoutePriority(scope, route.priorityTier);
  const industries = route.mainIndustries ?? route.industries ?? INDUSTRIES_BY_MODE[route.mode];

  return {
    ...route,
    ...override,
    distance: route.distance ?? distanceKm,
    distanceKm: route.distanceKm ?? distanceKm,
    estimatedTime: route.estimatedTime ?? estimatedTime,
    volume: monthlyVolumeTons,
    monthlyVolumeTons,
    transportMode: route.transportMode ?? route.mode,
    activeOffers,
    activeOrders,
    companiesCount,
    industries,
    mainIndustries: industries,
    businessCategory: route.businessCategory ?? inferCategory(route.mode),
    status: route.status ?? 'active',
    routePriority,
    vehicleIcon: route.vehicleIcon ?? vehicleIconForMode(route.mode),
    animationSpeed:
      route.animationSpeed ??
      (route.mode === 'sea' ? 0.00045 : route.mode === 'air' ? 0.00075 : 0.0006),
    averagePriceIndex:
      route.averagePriceIndex ?? Math.round(92 + intensity * 4 + (distanceKm % 17)),
    reliabilityScore:
      route.reliabilityScore ?? Math.min(99, 78 + intensity * 4 + (routePriority === 'primary' ? 6 : 0)),
    co2Estimate:
      route.co2Estimate ?? Math.round(distanceKm * (route.mode === 'air' ? 0.9 : route.mode === 'rail' ? 0.35 : 0.55)),
    lastActivity: route.lastActivity ?? new Date(Date.now() - (distanceKm % 48) * 3600000).toISOString(),
  };
}

export function getRouteArrowName(
  route: BusinessRouteDef,
  cityMap: Map<string, { name: string }>,
): string {
  const from = cityMap.get(route.fromCityId)?.name ?? route.fromCityId;
  const to = cityMap.get(route.toCityId)?.name ?? route.toCityId;
  return `${from} → ${to}`;
}

export function getRouteDisplayName(
  route: BusinessRouteDef,
  cityMap: Map<string, { name: string }>,
): string {
  return getRouteArrowName(route, cityMap);
}

export function formatEstimatedTime(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

const MODE_LABELS: Record<string, string> = {
  road: 'Road Freight',
  rail: 'Rail Freight',
  air: 'Air Cargo',
  sea: 'Sea Freight',
  river: 'River / Inland',
};

export function buildRouteTooltipHtml(
  route: BusinessRouteDef,
  cityMap: Map<string, { name: string }>,
): string {
  const from = cityMap.get(route.fromCityId)?.name ?? route.fromCityId;
  const to = cityMap.get(route.toCityId)?.name ?? route.toCityId;
  const mode = MODE_LABELS[route.transportMode ?? route.mode] ?? route.mode;
  const time = route.estimatedTime != null ? formatEstimatedTime(route.estimatedTime) : '—';
  const offers = route.activeOffers != null ? String(route.activeOffers) : '—';
  const aiScore = route.reliabilityScore != null ? `${route.reliabilityScore}` : '—';
  const aiTag = route.aiRecommended ? '<span class="ebh-route-tooltip-ai">AI Optimized</span>' : '';

  return `<div class="ebh-route-tooltip ebh-route-tooltip-premium">
    <div class="ebh-route-tooltip-title">${from} → ${to}</div>
    <div class="ebh-route-tooltip-type">${mode}${aiTag}</div>
    <div class="ebh-route-tooltip-row"><span>Origin</span><strong>${from}</strong></div>
    <div class="ebh-route-tooltip-row"><span>Destination</span><strong>${to}</strong></div>
    <div class="ebh-route-tooltip-row"><span>Route type</span><strong>${mode}</strong></div>
    <div class="ebh-route-tooltip-row"><span>Distance</span><strong>${route.distanceKm ?? route.distance ?? '—'} km</strong></div>
    <div class="ebh-route-tooltip-row"><span>Active offers</span><strong>${offers}</strong></div>
    <div class="ebh-route-tooltip-row"><span>Est. time</span><strong>${time}</strong></div>
    <div class="ebh-route-tooltip-row"><span>AI score</span><strong class="ebh-route-tooltip-score">${aiScore}</strong></div>
  </div>`;
}
