import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import {
  filterCorridorRoutes,
} from './routeFilterEngine';

export { filterCorridorRoutes, routeDensityOpacity } from './routeFilterEngine';
export type { RouteFilterContext } from './routeFilterEngine';

export function filterRoutesByZoom(
  routes: BusinessRouteDef[],
  cityMap: Map<string, MapCityRecord>,
  zoom: number,
  selectedCountryCode?: string,
  selectedCityId?: string,
): BusinessRouteDef[] {
  return filterCorridorRoutes(routes, {
    zoom,
    selectedCountryCode,
    selectedCityId,
    cityMap,
  });
}

export function isRouteVisibleAtZoom(
  route: BusinessRouteDef,
  cityMap: Map<string, MapCityRecord>,
  zoom: number,
  selectedCountryCode?: string,
): boolean {
  return (
    filterCorridorRoutes([route], { zoom, selectedCountryCode, cityMap }).length > 0
  );
}
