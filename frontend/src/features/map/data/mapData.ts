import { cities, getCityById } from '@/data/cities';
import { createCityMetrics } from '@/data/cityMetrics';
import { latLngToMapXY } from '../utils/projection';
import type { MapCityRecord } from '../types/mapTypes';

export const DEFAULT_HUB_ID = 'berlin';

/** All major business cities visible on the interactive map */
export const BUSINESS_CITY_IDS = cities.map((c) => c.id);

/** @deprecated Use BUSINESS_CITY_IDS — kept for barrel exports */
export const FEATURED_CITY_IDS = BUSINESS_CITY_IDS;

export type FeaturedCityId = string;

import { getGermanyCityProfile } from './germany/germanyCityProfiles';
import { getGermanyCityMeta, getGermanyMapTier } from './germany/germanyCityMeta';

export function enrichCity(city: (typeof cities)[number]): MapCityRecord {
  const { mapX, mapY } = latLngToMapXY(city.lat, city.lng);
  const record: MapCityRecord = {
    ...city,
    mapX,
    mapY,
    metrics: createCityMetrics(city.businesses),
  };
  if (city.countryCode === 'DE') {
    const meta = getGermanyCityMeta(city.id);
    record.germanyProfile = getGermanyCityProfile(city.id, city.name, city.businesses);
    record.mapTier = city.mapTier ?? getGermanyMapTier(city.id);
    if (record.mapTier === 1) record.isMajorHub = true;
    record.metrics = { ...record.metrics, population: meta.population };
  }
  return record;
}

export function getMapCityById(id: string): MapCityRecord | undefined {
  const city = getCityById(id);
  return city ? enrichCity(city) : undefined;
}

export function getFeaturedMapCities(): MapCityRecord[] {
  return cities.map(enrichCity);
}

export function getDefaultHubCity(): MapCityRecord | undefined {
  return getMapCityById(DEFAULT_HUB_ID);
}

export function getAllMapCities(): MapCityRecord[] {
  return cities.map(enrichCity);
}

export function getMapCitiesByCountry(countryCode: string): MapCityRecord[] {
  return cities.filter((c) => c.countryCode === countryCode).map(enrichCity);
}

export function getFeaturedInCountry(countryCode: string): MapCityRecord[] {
  return getMapCitiesByCountry(countryCode);
}
