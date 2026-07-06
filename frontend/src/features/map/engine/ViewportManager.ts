import L from 'leaflet';
import { EUROPE_BOUNDS, EUROPE_DEFAULT_ZOOM } from '../config/leafletConfig';
import { getFocusZoomForCity } from '../utils/cityVisibilityUtils';
import { getCountryByCode } from '../services/mapService';
import type { MapCityRecord } from '../types/mapTypes';

export type FlyableMap = L.Map;

export function flyToEurope(map: FlyableMap): void {
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const zoom = city ? getFocusZoomForCity(city, isMobile) : isMobile ? 9 : 10;
  map.flyTo([lat, lng], zoom, { duration: 1.1 });
}
