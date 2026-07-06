import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import { getAllMapCities, getFeaturedMapCities } from '../data/mapData';
import { getRoutesForMapView } from '../data/routeData';
import { ACTIVITY_STATS } from '../data/activityData';

/**
 * API-ready data boundary — swap mock implementations for fetch() later.
 */
export const futureMapAPI = {
  async fetchCities(countryCode?: string): Promise<MapCityRecord[]> {
    return countryCode
      ? getAllMapCities().filter((c) => c.countryCode === countryCode)
      : getFeaturedMapCities();
  },

  async fetchRoutes(countryCode?: string): Promise<BusinessRouteDef[]> {
    return getRoutesForMapView(countryCode);
  },

  async fetchLiveStats() {
    return {
      activeUsers: ACTIVITY_STATS.liveActivity,
      openJobs: 3420,
      marketplaceOffers: ACTIVITY_STATS.openTransportOffers * 7,
      transportOffers: ACTIVITY_STATS.openTransportOffers,
      warehouses: 680,
    };
  },

  async fetchTrendingCities(): Promise<Array<{ id: string; name: string; growth: number }>> {
    return [
      { id: 'berlin', name: 'Berlin', growth: 12.4 },
      { id: 'warsaw', name: 'Warsaw', growth: 9.8 },
      { id: 'rotterdam', name: 'Rotterdam', growth: 8.2 },
      { id: 'vienna', name: 'Vienna', growth: 7.6 },
    ];
  },

  async fetchAiRecommendations(): Promise<string[]> {
    return [
      'High demand: Berlin → Izium reconstruction logistics',
      'Expand corridor: Warsaw → Kyiv → Izium',
      'Partner match: Istanbul → Odesa maritime logistics',
      'AI route: Frankfurt → Prague → Kyiv → Izium',
      'New opportunity: Ukraine rebuilding supply chain',
    ];
  },
};
