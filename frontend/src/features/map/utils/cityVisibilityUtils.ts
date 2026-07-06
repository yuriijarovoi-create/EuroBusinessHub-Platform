import type { MapCityRecord } from '../types/mapTypes';
import { isMoselVillageId } from './moselVillageUtils';

export type CityDisplayTier = 1 | 2 | 3 | 4 | 5;

const MOBILE_BREAKPOINT = 768;

export function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
}

/** Derive display tier from existing city fields — no data mutation */
export function getCityDisplayTier(city: MapCityRecord): CityDisplayTier {
  if (city.mapTier === 4) {
    if (city.localServiceNode || city.businesses < 100) return 5;
    if (city.population != null && city.population < 3500) return 5;
    return 4;
  }
  if (city.mapTier === 1 || city.isMajorHub) return 1;
  if (city.mapTier === 2) return 2;
  if (city.mapTier === 3) {
    return city.businesses < 180 ? 4 : 3;
  }

  if (city.businesses >= 700) return 1;
  if (city.businesses >= 400) return 2;
  if (city.businesses >= 200) return 3;
  if (city.businesses >= 100) return 4;
  return 5;
}

function isForcedVisible(
  cityId: string,
  selectedCityId?: string,
  hoveredCityId?: string,
  searchResultId?: string,
): boolean {
  return cityId === selectedCityId || cityId === hoveredCityId || cityId === searchResultId;
}

/** Minimum zoom for city marker visibility */
export function minNodeZoomForTier(tier: CityDisplayTier, isMobile: boolean): number {
  switch (tier) {
    case 1:
      return 0;
    case 2:
      return isMobile ? 5 : 4.5;
    case 3:
      return isMobile ? 6.75 : 6.25;
    case 4:
      return isMobile ? 8.25 : 7.75;
    case 5:
      return isMobile ? 11 : 10.5;
    default:
      return 0;
  }
}

/** Minimum zoom for persistent label visibility (before hover/search exceptions) */
export function minLabelZoomForTier(tier: CityDisplayTier, isMobile: boolean): number {
  switch (tier) {
    case 1:
      return 0;
    case 2:
      return isMobile ? 6 : 5.5;
    case 3:
      return isMobile ? 7.25 : 6.75;
    case 4:
      return isMobile ? 9.5 : 9;
    case 5:
      return isMobile ? 12 : 11.5;
    default:
      return 0;
  }
}

export function isCityNodeVisible(
  city: MapCityRecord,
  zoom: number,
  isMobile: boolean,
  selectedCityId?: string,
  hoveredCityId?: string,
  searchResultId?: string,
): boolean {
  if (isForcedVisible(city.id, selectedCityId, hoveredCityId, searchResultId)) return true;
  if (isMoselVillageId(city.id)) {
    return zoom >= minNodeZoomForTier(4, isMobile);
  }
  const tier = getCityDisplayTier(city);
  return zoom >= minNodeZoomForTier(tier, isMobile);
}

export function isCityLabelVisible(
  city: MapCityRecord,
  zoom: number,
  isMobile: boolean,
  selectedCityId?: string,
  hoveredCityId?: string,
  searchResultId?: string,
): boolean {
  if (isForcedVisible(city.id, selectedCityId, hoveredCityId, searchResultId)) return true;
  const tier = getCityDisplayTier(city);
  return zoom >= minLabelZoomForTier(tier, isMobile);
}

export interface CityVisibilityContext {
  zoom: number;
  isMobile: boolean;
  selectedCityId?: string;
  hoveredCityId?: string;
  searchResultId?: string;
}

export function getVisibleCityNodes(
  cities: MapCityRecord[],
  zoom: number,
  selectedCityId?: string,
  hoveredCityId?: string,
  searchResultId?: string,
  isMobile = isMobileViewport(),
): MapCityRecord[] {
  const ctx: CityVisibilityContext = { zoom, isMobile, selectedCityId, hoveredCityId, searchResultId };
  return cities.filter((city) => isCityNodeVisible(
    city,
    ctx.zoom,
    ctx.isMobile,
    ctx.selectedCityId,
    ctx.hoveredCityId,
    ctx.searchResultId,
  ));
}

function labelPriority(city: MapCityRecord, ctx: CityVisibilityContext): number {
  const tier = getCityDisplayTier(city);
  const forced = isForcedVisible(city.id, ctx.selectedCityId, ctx.hoveredCityId, ctx.searchResultId);
  return (6 - tier) * 1000 + city.businesses + (forced ? 500 : 0) + (city.id === 'berlin' ? 50 : 0);
}

/** Overlap avoidance — higher tiers win; forced labels always pass */
export function filterVisibleCityLabels(
  cities: MapCityRecord[],
  ctx: CityVisibilityContext,
): MapCityRecord[] {
  const { zoom, isMobile } = ctx;
  if (zoom < (isMobile ? 5.5 : 5)) return [];

  const candidates = cities.filter((city) =>
    isCityLabelVisible(
      city,
      ctx.zoom,
      ctx.isMobile,
      ctx.selectedCityId,
      ctx.hoveredCityId,
      ctx.searchResultId,
    ),
  );

  const sorted = [...candidates].sort((a, b) => labelPriority(b, ctx) - labelPriority(a, ctx));

  const minDist = isMobile
    ? zoom >= 11 ? 0.18 : zoom >= 9 ? 0.28 : zoom >= 7 ? 0.42 : 0.55
    : zoom >= 11 ? 0.14 : zoom >= 9 ? 0.22 : zoom >= 7 ? 0.32 : 0.48;

  const placed: { lat: number; lng: number }[] = [];
  const visible: MapCityRecord[] = [];

  for (const city of sorted) {
    const tier = getCityDisplayTier(city);
    const forced = isForcedVisible(city.id, ctx.selectedCityId, ctx.hoveredCityId, ctx.searchResultId);
    const tooClose = placed.some(
      (p) => Math.hypot(p.lat - city.lat, p.lng - city.lng) < minDist,
    );
    if (tooClose && tier >= 4 && !forced) continue;
    if (tooClose && tier === 3 && !forced && zoom < (isMobile ? 8 : 7.5)) continue;
    if (tooClose && tier === 2 && !forced && zoom < (isMobile ? 7.5 : 7)) continue;
    placed.push({ lat: city.lat, lng: city.lng });
    visible.push(city);
  }

  return visible;
}

export function getFocusZoomForCity(city: MapCityRecord, isMobile: boolean): number {
  const tier = getCityDisplayTier(city);
  if (tier === 5) return isMobile ? 12 : 11.5;
  if (tier === 4) return isMobile ? 9.5 : 9;
  if (tier === 3) return isMobile ? 7.5 : 7;
  if (tier === 2) return isMobile ? 6.5 : 6;
  return isMobile ? 5.5 : 5;
}
