import { getAllMapCities } from '../data/mapData';
import {
  CITY_SEARCH_SLUG_ALIASES,
  getSearchAliasesForCity,
} from '../data/citySearchAliases';
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
  normalizedAliases: string[];
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

/** Collapse hyphen/space variants for alias matching (e.g. "traben trarbach"). */
export function normalizeSearchPhrase(value: string): string {
  return normalizeSearchText(value).replace(/[\s-]+/g, ' ');
}

function buildCitySearchIndex(): CitySearchIndexEntry[] {
  const cities = getAllMapCities();
  const byId = new Map(cities.map((city) => [city.id, city]));

  return cities.map((city) => {
    const aliasPhrases = getSearchAliasesForCity(city.id).map(normalizeSearchPhrase);
    return {
      city,
      normalizedId: normalizeSearchText(city.id),
      normalizedName: normalizeSearchText(city.name),
      normalizedCountry: normalizeSearchText(city.country),
      normalizedCountryCode: normalizeSearchText(city.countryCode),
      normalizedAliases: aliasPhrases,
    };
  }).concat(
    Object.entries(CITY_SEARCH_SLUG_ALIASES)
      .filter(([, canonicalId]) => byId.has(canonicalId))
      .map(([legacySlug, canonicalId]) => {
        const city = byId.get(canonicalId)!;
        return {
          city,
          normalizedId: normalizeSearchText(legacySlug),
          normalizedName: normalizeSearchText(city.name),
          normalizedCountry: normalizeSearchText(city.country),
          normalizedCountryCode: normalizeSearchText(city.countryCode),
          normalizedAliases: [normalizeSearchPhrase(legacySlug.replace(/_/g, ' '))],
        };
      }),
  );
}

export function getCitySearchIndex(): CitySearchIndexEntry[] {
  if (!cachedCityIndex) {
    cachedCityIndex = buildCitySearchIndex();
  }
  return cachedCityIndex;
}

function entryMatchesQuery(entry: CitySearchIndexEntry, query: string): boolean {
  const phraseQuery = normalizeSearchPhrase(query);
  const compactQuery = phraseQuery.replace(/\s+/g, '');

  const namePhrase = normalizeSearchPhrase(entry.city.name);
  const nameCompact = namePhrase.replace(/\s+/g, '');

  return (
    entry.normalizedId.includes(query) ||
    entry.normalizedName.includes(query) ||
    entry.normalizedCountry.includes(query) ||
    entry.normalizedCountryCode.includes(query) ||
    entry.normalizedAliases.some(
      (alias) => alias.includes(phraseQuery) || alias.replace(/\s+/g, '').includes(compactQuery),
    ) ||
    namePhrase.includes(phraseQuery) ||
    nameCompact.includes(compactQuery)
  );
}

function rankEntry(entry: CitySearchIndexEntry, query: string): number {
  const phraseQuery = normalizeSearchPhrase(query);
  if (entry.normalizedName === query || normalizeSearchPhrase(entry.city.name) === phraseQuery) return 0;
  if (entry.normalizedId === query) return 1;
  if (entry.normalizedAliases.some((a) => a === phraseQuery)) return 1;
  if (entry.normalizedName.startsWith(query) || normalizeSearchPhrase(entry.city.name).startsWith(phraseQuery)) {
    return 2;
  }
  if (entry.normalizedCountry.startsWith(query)) return 3;
  if (entry.normalizedCountryCode === query) return 4;
  if (entry.normalizedName.includes(query)) return 5;
  if (entry.normalizedAliases.some((a) => a.includes(phraseQuery))) return 5;
  return 6;
}

/** Filter cities for the map search combobox (min 2 chars, max 8 results). */
export function filterCitiesForSearch(
  query: string,
  activeLayer?: BusinessLayerId | null,
): CitySearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_QUERY_LENGTH) return [];

  const seenIds = new Set<string>();
  const matches = getCitySearchIndex()
    .filter((entry) => entryMatchesQuery(entry, normalizedQuery))
    .sort((a, b) => {
      const rankDiff = rankEntry(a, normalizedQuery) - rankEntry(b, normalizedQuery);
      if (rankDiff !== 0) return rankDiff;
      return a.city.name.localeCompare(b.city.name);
    })
    .filter((entry) => {
      if (seenIds.has(entry.city.id)) return false;
      seenIds.add(entry.city.id);
      return true;
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
