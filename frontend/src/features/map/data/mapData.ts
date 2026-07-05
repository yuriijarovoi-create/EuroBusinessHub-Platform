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

import {
  getGermanyCityEnrichment,
} from './germany/germanyCityEnrichment';
import { getGermanyCityProfile } from './germany/germanyCityProfiles';
import { getGermanyCityMeta } from './germany/germanyCityMeta';
import {
  getGermanyLocalServiceNode,
  getGermanyLocalNodeMeta,
} from './germany/germanyLocalNodes';
import {
  getGermanyRegionalCluster,
  getGermanyRegionalClusterMeta,
} from './germany/germanyRegionalClusters';

export function enrichCity(city: (typeof cities)[number]): MapCityRecord {
  const { mapX, mapY } = latLngToMapXY(city.lat, city.lng);
  const record: MapCityRecord = {
    ...city,
    mapX,
    mapY,
    metrics: createCityMetrics(city.businesses),
  };
  if (city.countryCode === 'DE') {
    const regionalCluster = getGermanyRegionalCluster(city.id);
    const regionalMeta = getGermanyRegionalClusterMeta(city.id);
    const localNode = regionalCluster?.localServiceNode ?? getGermanyLocalServiceNode(city.id);
    const localMeta = getGermanyLocalNodeMeta(city.id);
    const meta = regionalMeta ?? localMeta ?? getGermanyCityMeta(city.id);
    const enrich = getGermanyCityEnrichment(city.id);
    record.germanyProfile = getGermanyCityProfile(city.id, city.name, city.businesses);
    record.mapTier = city.mapTier ?? meta.tier;
    if (record.mapTier === 1) record.isMajorHub = true;

    if (regionalCluster && record.germanyProfile) {
      record.localServiceNode = regionalCluster.localServiceNode;
      record.mapTier = 4;
      record.metrics = {
        ...record.metrics,
        companies: regionalCluster.companies,
        jobs: regionalCluster.jobs,
        warehouses: regionalCluster.warehouses,
        transport: regionalCluster.transportOffers,
        marketplace: regionalCluster.marketplaceOffers,
        aiScore: regionalCluster.aiScore,
        population: regionalCluster.population,
      };
      record.germanyProfile = {
        ...record.germanyProfile,
        mapTier: 4,
        population: regionalCluster.population,
        logisticsScore: regionalCluster.transportScore,
        innovationScore: regionalCluster.innovationScore,
        sustainabilityScore: regionalCluster.sustainabilityScore,
        techScore: Math.round(regionalCluster.aiScore * 0.92),
        infrastructure: {
          ...record.germanyProfile.infrastructure,
          ...regionalCluster.infrastructure,
          industrialZones: regionalCluster.industrialZones,
        },
      };
    } else if (localNode) {
      record.localServiceNode = localNode;
      if (city.mapTier === 4) {
        record.mapTier = 4;
        record.metrics = {
          ...record.metrics,
          companies: localNode.companies,
          jobs: localNode.jobs,
          warehouses: localNode.warehouses,
          transport: localNode.transportOffers,
          marketplace: localNode.marketplaceOffers,
          aiScore: localNode.aiScore,
          population: localNode.population,
        };
      }
    }
    record.metrics = { ...record.metrics, population: meta.population };
    if (enrich) {
      record.metrics = { ...record.metrics, ...enrich.metrics };
    }
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
