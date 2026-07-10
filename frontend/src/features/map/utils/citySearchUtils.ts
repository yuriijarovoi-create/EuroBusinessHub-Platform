import { getAllMapCities } from '../data/mapData';
import type { MapCityRecord } from '../types/mapTypes';
import { scoreCityForBusinessLayer } from './mapBusinessLayerFilter';
import type { BusinessLayerId } from './mapLayerContext';

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

let cachedCityIndex: CitySearchIndexEntry[] | null = null;

export interface CitySearchIndexEntry {
  city: MapCityRecord;
  normalizedId: string;
  normalizedName: string;
  normalizedCountry: string;
  normalizedCountryCode: string;
}

export interface CitySearchResult {
  city: MapCityRecord;
  hasActiveLayerData: boolean;
}

/** Strip diacritics and lowercase for accent-tolerant matching. */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function buildCitySearchIndex(): CitySearchIndexEntry[] {
  return getAllMapCities().map((city) => ({
    city,
    normalizedId: normalizeSearchText(city.id),
    normalizedName: normalizeSearchText(city.name),
    normalizedCountry: normalizeSearchText(city.country),
    normalizedCountryCode: normalizeSearchText(city.countryCode),
  }));
}

export function getCitySearchIndex(): CitySearchIndexEntry[] {
  if (!cachedCityIndex) {
    cachedCityIndex = buildCitySearchIndex();
  }
  return cachedCityIndex;
}

function entryMatchesQuery(entry: CitySearchIndexEntry, query: string): boolean {
  return (
    entry.normalizedId.includes(query) ||
    entry.normalizedName.includes(query) ||
    entry.normalizedCountry.includes(query) ||
    entry.normalizedCountryCode.includes(query)
  );
}

function rankEntry(entry: CitySearchIndexEntry, query: string): number {
  if (entry.normalizedName === query) return 0;
  if (entry.normalizedId === query) return 1;
  if (entry.normalizedName.startsWith(query)) return 2;
  if (entry.normalizedCountry.startsWith(query)) return 3;
  if (entry.normalizedCountryCode === query) return 4;
  if (entry.normalizedName.includes(query)) return 5;
  return 6;
}

/** Filter cities for the map search combobox (min 2 chars, max 8 results). */
export function filterCitiesForSearch(
  query: string,
  activeLayer?: BusinessLayerId | null,
): CitySearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_QUERY_LENGTH) return [];

  const matches = getCitySearchIndex()
    .filter((entry) => entryMatchesQuery(entry, normalizedQuery))
    .sort((a, b) => {
      const rankDiff = rankEntry(a, normalizedQuery) - rankEntry(b, normalizedQuery);
      if (rankDiff !== 0) return rankDiff;
      return a.city.name.localeCompare(b.city.name);
    })
    .slice(0, MAX_RESULTS);

  return matches.map(({ city }) => ({
    city,
    hasActiveLayerData: activeLayer
      ? scoreCityForBusinessLayer(city, activeLayer) > 0
      : false,
  }));
}

export function cityHasLayerData(city: MapCityRecord, layer: BusinessLayerId): boolean {
  return scoreCityForBusinessLayer(city, layer) > 0;
}
