import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import { EUROPE_BOUNDS, EUROPE_DEFAULT_ZOOM } from '../../config/leafletConfig';
import { getBundeslandById } from '../../data/germany/bundeslandData';
import { getFocusZoomForCity } from '../../utils/cityVisibilityUtils';
import type { MapCityRecord } from '../../types/mapTypes';

export function MapInstanceCapture({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export function LeafletFitEurope({ active }: { active: boolean }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (!active || didFit.current) return;
    didFit.current = true;
    map.fitBounds(EUROPE_BOUNDS, { padding: [24, 24], maxZoom: EUROPE_DEFAULT_ZOOM });
  }, [map, active]);

  return null;
}

/** Smooth zoom to country / Bundesland bounds */
export function LeafletCountryFocus({
  countryCode,
  cities,
  bundeslandId,
}: {
  countryCode?: string;
  cities: MapCityRecord[];
  bundeslandId?: string;
}) {
  const map = useMap();
  const prevKey = useRef('');

  useEffect(() => {
    const key = `${countryCode ?? ''}|${bundeslandId ?? ''}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (bundeslandId) {
      const bl = getBundeslandById(bundeslandId);
      if (!bl) return;
      const bounds = L.latLngBounds(bl.ring.map(([lat, lng]) => [lat, lng] as [number, number]));
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 8, duration: 1.1 });
      return;
    }

    if (!countryCode) {
      map.flyToBounds(EUROPE_BOUNDS, {
        padding: [24, 24],
        maxZoom: EUROPE_DEFAULT_ZOOM,
        duration: 1.2,
      });
      return;
    }

    const countryCities = cities.filter((c) => c.countryCode === countryCode);
    if (countryCities.length === 0) return;

    const bounds = L.latLngBounds(countryCities.map((c) => [c.lat, c.lng] as [number, number]));
    const maxZoom = countryCode === 'DE' ? 6.5 : 7;
    map.flyToBounds(bounds, { padding: [48, 48], maxZoom, duration: 1.2 });
  }, [map, countryCode, cities, bundeslandId]);

  return null;
}

/** Fly to a searched or focused city — centers map and ensures visibility */
export function LeafletCityFocus({
  cityId,
  cityMap,
  countryCode,
}: {
  cityId?: string;
  cityMap: Map<string, MapCityRecord>;
  countryCode?: string;
}) {
  const map = useMap();
  const prevId = useRef('');

  useEffect(() => {
    if (!cityId || cityId === prevId.current) return;

    const city = cityMap.get(cityId);
    if (!city) return;
    if (countryCode && city.countryCode !== countryCode) return;

    prevId.current = cityId;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const zoom = getFocusZoomForCity(city, isMobile);
    map.flyTo([city.lat, city.lng], zoom, { duration: 1.1 });
  }, [map, cityId, cityMap, countryCode]);

  return null;
}
