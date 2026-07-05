import { memo, useEffect, useMemo, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCityRecord } from '../../types/mapTypes';

interface GermanyCityLabelsProps {
  active: boolean;
  cities: MapCityRecord[];
  selectedCityId?: string;
  hoveredCityId?: string;
}

function getTier(city: MapCityRecord): 1 | 2 | 3 {
  return city.mapTier ?? (city.isMajorHub ? 1 : 3);
}

function tierMinZoom(tier: 1 | 2 | 3, mobile: boolean): number {
  if (tier === 1) return mobile ? 5.5 : 5;
  if (tier === 2) return mobile ? 6.5 : 6;
  return mobile ? 8.5 : 7.5;
}

function labelAllowed(
  city: MapCityRecord,
  zoom: number,
  mobile: boolean,
  selectedCityId?: string,
  hoveredCityId?: string,
): boolean {
  if (city.id === selectedCityId || city.id === hoveredCityId) return true;
  return zoom >= tierMinZoom(getTier(city), mobile);
}

/** Overlap avoidance — tier 1 always wins, then tier 2, then tier 3 */
function filterVisibleLabels(
  cities: MapCityRecord[],
  zoom: number,
  mobile: boolean,
  selectedCityId?: string,
  hoveredCityId?: string,
): MapCityRecord[] {
  const candidates = cities.filter((c) =>
    labelAllowed(c, zoom, mobile, selectedCityId, hoveredCityId),
  );

  const sorted = [...candidates].sort((a, b) => {
    const score = (c: MapCityRecord) => {
      const t = getTier(c);
      return (4 - t) * 1000 + c.businesses + (c.id === 'berlin' ? 50 : 0);
    };
    return score(b) - score(a);
  });

  const minDist = mobile
    ? zoom >= 8 ? 0.28 : 0.5
    : zoom >= 8 ? 0.22 : zoom >= 7 ? 0.35 : 0.5;

  const placed: { lat: number; lng: number }[] = [];
  const visible: MapCityRecord[] = [];

  for (const city of sorted) {
    const tier = getTier(city);
    const forced = city.id === selectedCityId || city.id === hoveredCityId;
    const tooClose = placed.some(
      (p) => Math.hypot(p.lat - city.lat, p.lng - city.lng) < minDist,
    );
    if (tooClose && tier >= 3 && !forced) continue;
    if (tooClose && tier === 2 && !forced && zoom < (mobile ? 7.5 : 7)) continue;
    placed.push({ lat: city.lat, lng: city.lng });
    visible.push(city);
  }

  return visible;
}

function labelIcon(name: string, tier: 1 | 2 | 3, selected: boolean) {
  const cls = [
    'ebh-city-label',
    tier === 1 ? 'ebh-city-label-tier1' : '',
    tier === 2 ? 'ebh-city-label-tier2' : '',
    tier === 3 ? 'ebh-city-label-tier3' : '',
    selected ? 'ebh-city-label-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'ebh-city-label-wrap',
    html: `<span class="${cls}">${name}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export const GermanyCityLabels = memo(function GermanyCityLabels({
  active,
  cities,
  selectedCityId,
  hoveredCityId,
}: GermanyCityLabelsProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  );

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    const onResize = () => setMobile(window.innerWidth <= 768);
    map.on('zoomend', onZoom);
    window.addEventListener('resize', onResize);
    return () => {
      map.off('zoomend', onZoom);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  const labels = useMemo(() => {
    if (!active || zoom < (mobile ? 5.5 : 5)) return [];
    return filterVisibleLabels(cities, zoom, mobile, selectedCityId, hoveredCityId);
  }, [active, cities, zoom, mobile, selectedCityId, hoveredCityId]);

  if (!active || zoom < (mobile ? 5.5 : 5)) return null;

  return (
    <>
      {labels.map((city) => {
        const tier = getTier(city);
        return (
          <Marker
            key={`label-${city.id}`}
            position={[city.lat, city.lng]}
            icon={labelIcon(city.name, tier, city.id === selectedCityId)}
            interactive={false}
            zIndexOffset={
              city.id === selectedCityId ? 500 : tier === 1 ? 300 : tier === 2 ? 150 : 0
            }
          />
        );
      })}
    </>
  );
});
