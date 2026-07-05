/** Back-compat shim — mapData.ts is the source of truth (mapDataCore was never added during refactor). */
export {
  DEFAULT_HUB_ID,
  FEATURED_CITY_IDS,
  enrichCity,
  getMapCityById,
  getFeaturedMapCities,
  getDefaultHubCity,
  getAllMapCities,
  getMapCitiesByCountry,
  getFeaturedInCountry,
} from './mapData';
export type { FeaturedCityId } from './mapData';
