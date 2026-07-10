import L from 'leaflet';
import { EUROPE_BOUNDS, EUROPE_DEFAULT_ZOOM } from '../config/leafletConfig';
import { flyMapToCityFocus, logMapNavigation } from '../utils/mapNavigationDiagnostics';
import { getCountryByCode } from '../services/mapService';
import type { MapCityRecord } from '../types/mapTypes';

export type FlyableMap = L.Map;

export function flyToEurope(map: FlyableMap): void {
  logMapNavigation('europe-fit', { zoom: EUROPE_DEFAULT_ZOOM });
  map.flyToBounds(EUROPE_BOUNDS, {
    padding: [24, 24],
    maxZoom: EUROPE_DEFAULT_ZOOM,
    duration: 1.2,
  });
}

export function flyToCountry(
  map: FlyableMap,
  countryCode: string,
  cities: MapCityRecord[],
): void {
  const countryCities = cities.filter((c) => c.countryCode === countryCode);
  if (countryCities.length > 0) {
    const bounds = L.latLngBounds(countryCities.map((c) => [c.lat, c.lng] as [number, number]));
    map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 7.5, duration: 1.2 });
    return;
  }
  const country = getCountryByCode(countryCode);
  if (country?.lat != null && country.lng != null) {
    map.flyTo([country.lat, country.lng], country.zoomLevel ?? 5.5, { duration: 1.2 });
  }
}

export function flyToCity(map: FlyableMap, lat: number, lng: number, city?: MapCityRecord): void {
  flyMapToCityFocus(map, lat, lng, 'city-focus', city?.name ?? city?.id);
}
