import type { ModuleId } from '@shared/types';
import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import { ALL_LOGISTICS_HUBS, isPrimaryLogisticsHub, isSecondaryLogisticsHub } from '../data/logisticsHubNetwork';
import { isMobileMapUiViewport } from '../mobile/useMobileMapUi';
import type { ActiveMapContext, BusinessLayerId } from './mapLayerContext';

const MODULE_LAYER_MAP: Partial<Record<ModuleId, BusinessLayerId>> = {
  marketplace: 'marketplace',
  transport: 'transport',
  logistik: 'transport',
  unternehmen: 'companies',
  jobs: 'jobs',
  lager: 'warehouses',
  partner: 'partners',
  akademie: 'academy',
  'digitale-produkte': 'digitalProducts',
  ki: 'ai',
  services: 'businessServices',
};

const INDUSTRY_HINTS: Partial<Record<BusinessLayerId, string[]>> = {
  manufacturing: ['automotive', 'industrial', 'manufacturing', 'steel', 'machinery', 'aerospace'],
  agriculture: ['agriculture', 'agri', 'food', 'farming', 'wine'],
  construction: ['construction', 'infrastructure', 'building', 'housing'],
  medical: ['pharma', 'medical', 'health', 'healthcare', 'biotech'],
  tourism: ['tourism', 'hospitality', 'travel', 'cultural'],
  technology: ['technology', 'tech', 'software', 'digital', 'semiconductor', 'innovation'],
  finance: ['finance', 'banking', 'financial', 'insurance', 'fintech'],
  legal: ['legal', 'law', 'compliance', 'regulatory'],
  education: ['education', 'university', 'research', 'academic'],
  events: ['events', 'conference', 'trade fair', 'exhibition', 'messe'],
  investments: ['investment', 'venture', 'capital', 'fund'],
  startups: ['startup', 'founder', 'scale-up', 'innovation'],
  digitalProducts: ['digital', 'saas', 'software', 'product'],
};

function hasActiveModule(city: MapCityRecord, layer: BusinessLayerId): boolean {
  return city.activeModules.some((moduleId) => MODULE_LAYER_MAP[moduleId] === layer);
}

function matchesIndustryHint(industry: string | undefined, layer: BusinessLayerId): boolean {
  if (!industry) return false;
  const hints = INDUSTRY_HINTS[layer];
  if (!hints) return false;
  const lower = industry.toLowerCase();
  return hints.some((hint) => lower.includes(hint));
}

/** Relevance score for a city under a business layer (higher = more relevant). */
export function scoreCityForBusinessLayer(city: MapCityRecord, layer: BusinessLayerId): number {
  if (hasActiveModule(city, layer)) return 1000;

  const m = city.metrics;
  const profile = city.germanyProfile;
  const local = city.localServiceNode;

  switch (layer) {
    case 'companies':
      return m.companies + city.businesses / 20 + (profile?.businessIndex ?? 0) * 0.5;
    case 'jobs':
      return m.jobs + (local?.jobs ?? 0);
    case 'warehouses':
      return m.warehouses + (local?.warehouses ?? 0) * 2;
    case 'transport':
      return (
        m.transport +
        (profile?.logisticsScore ?? local?.logisticsScore ?? 0) +
        (ALL_LOGISTICS_HUBS.has(city.id) ? 40 : 0)
      );
    case 'marketplace':
      return m.marketplace + (local?.marketplaceOffers ?? 0);
    case 'partners':
      return m.partners;
    case 'academy':
      return m.services * 0.4 + (profile?.innovationScore ?? 0) * 0.3;
    case 'digitalProducts':
      return m.digitalProducts + m.subscriptions * 0.5;
    case 'ai':
      return m.aiScore * 2 + m.aiRequests * 0.01 + (profile?.innovationScore ?? 0);
    case 'events':
      return (m.services + m.marketplace) * 0.3 + (city.isMajorHub ? 20 : 0);
    case 'investments':
      return (profile?.financeScore ?? 0) + m.companies * 0.15 + (city.isMajorHub ? 15 : 0);
    case 'startups':
      return (profile?.techScore ?? 0) + (profile?.innovationScore ?? 0) + m.aiScore * 0.5;
    case 'businessServices':
      return m.services;
    case 'tourism':
      if (matchesIndustryHint(profile?.mainIndustry, layer)) return 80;
      return (profile?.tourismScore ?? local?.tourismScore ?? 0) + m.services * 0.2;
    case 'finance':
      if (matchesIndustryHint(profile?.mainIndustry, layer)) return 80;
      return (profile?.financeScore ?? 0) + m.companies * 0.1;
    case 'technology':
      if (matchesIndustryHint(profile?.mainIndustry, layer)) return 80;
      return (profile?.techScore ?? 0) + m.digitalProducts * 0.5 + m.aiScore * 0.3;
    case 'manufacturing':
    case 'agriculture':
    case 'construction':
    case 'medical':
    case 'legal':
    case 'education':
      if (matchesIndustryHint(profile?.mainIndustry, layer)) return 80;
      return m.services * 0.15 + (city.isMajorHub ? 10 : 0);
    default:
      return 0;
  }
}

function fallbackCitiesForLayer(cities: MapCityRecord[], layer: BusinessLayerId): MapCityRecord[] {
  if (layer === 'transport' || layer === 'warehouses') {
    return cities.filter(
      (city) =>
        ALL_LOGISTICS_HUBS.has(city.id) ||
        isPrimaryLogisticsHub(city.id) ||
        isSecondaryLogisticsHub(city.id),
    );
  }
  return cities.filter((city) => city.isMajorHub || isPrimaryLogisticsHub(city.id));
}

export function filterCitiesByBusinessLayer(
  cities: MapCityRecord[],
  layerId: BusinessLayerId,
  selectedCityId?: string | null,
): MapCityRecord[] {
  const scored = cities
    .map((city) => ({ city, score: scoreCityForBusinessLayer(city, layerId) }))
    .filter(({ score }) => score > 0);

  let filtered: MapCityRecord[];

  if (scored.length === 0) {
    filtered = fallbackCitiesForLayer(cities, layerId);
  } else {
    scored.sort((a, b) => b.score - a.score);
    const keepCount = Math.max(3, Math.ceil(scored.length * 0.45));
    filtered = scored.slice(0, keepCount).map(({ city }) => city);
  }

  if (selectedCityId && !filtered.some((city) => city.id === selectedCityId)) {
    const selected = cities.find((city) => city.id === selectedCityId);
    if (selected) filtered = [...filtered, selected];
  }

  return filtered;
}

function routeIndustryMatches(route: BusinessRouteDef, keywords: string[]): boolean {
  const industries = route.mainIndustries ?? route.industries ?? [];
  const lower = industries.map((entry) => entry.toLowerCase()).join(' ');
  return keywords.some((keyword) => lower.includes(keyword));
}

export function filterRoutesByBusinessLayer(
  routes: BusinessRouteDef[],
  layerId: BusinessLayerId,
): BusinessRouteDef[] {
  switch (layerId) {
    case 'transport':
      return routes;
    case 'warehouses':
      return routes.filter(
        (route) =>
          route.businessPurpose === 'logistics' ||
          route.businessCategory === 'logistics' ||
          route.mode === 'road' ||
          route.mode === 'rail',
      );
    case 'marketplace':
      return routes.filter(
        (route) =>
          route.businessPurpose === 'trade' ||
          route.businessCategory === 'retail' ||
          routeIndustryMatches(route, ['retail', 'e-commerce', 'trade']),
      );
    case 'tourism':
      return routes.filter((route) => route.businessPurpose === 'tourism');
    case 'manufacturing':
      return routes.filter(
        (route) =>
          route.businessCategory === 'manufacturing' ||
          route.businessCategory === 'automotive' ||
          routeIndustryMatches(route, ['manufacturing', 'automotive', 'steel', 'industrial']),
      );
    case 'agriculture':
      return routes.filter(
        (route) =>
          route.businessCategory === 'agriculture' ||
          route.mode === 'river' ||
          routeIndustryMatches(route, ['agriculture', 'food', 'grain']),
      );
    case 'medical':
      return routes.filter(
        (route) =>
          route.businessCategory === 'pharma' ||
          route.mode === 'air' ||
          routeIndustryMatches(route, ['pharma', 'medical', 'health']),
      );
    case 'construction':
      return routes.filter(
        (route) =>
          route.businessPurpose === 'industry' ||
          routeIndustryMatches(route, ['construction', 'building', 'infrastructure']),
      );
    case 'ai':
      return routes.filter((route) => route.aiRecommended || route.type === 'ai');
    case 'companies':
    case 'jobs':
    case 'partners':
    case 'academy':
    case 'digitalProducts':
    case 'events':
    case 'investments':
    case 'startups':
    case 'technology':
    case 'finance':
    case 'legal':
    case 'education':
    case 'businessServices':
      return [];
    default:
      return [];
  }
}

/** Mobile-only: apply business-layer filtering when a layer is active. */
export function shouldApplyMobileBusinessLayerFilter(context: ActiveMapContext): boolean {
  return isMobileMapUiViewport() && context.businessLayer !== null;
}

export function getMobileBusinessLayerFilter(context: ActiveMapContext): BusinessLayerId | null {
  if (!shouldApplyMobileBusinessLayerFilter(context)) return null;
  return context.businessLayer;
}

/** Mobile-only: show ports, airports, hub halos when transport/warehouse layers are active. */
export function shouldShowMobileLogisticsOverlays(context: ActiveMapContext): boolean {
  if (!isMobileMapUiViewport()) return true;
  if (!context.businessLayer) return true;
  return context.businessLayer === 'transport' || context.businessLayer === 'warehouses';
}
