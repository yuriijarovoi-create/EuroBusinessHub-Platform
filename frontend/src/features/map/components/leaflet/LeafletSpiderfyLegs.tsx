import { memo, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CityMarkerCluster } from '../../utils/cityClusterUtils';
import { easeOutCubic, type LatLngPoint } from '../../utils/cityClusterSpiderfy';

function readSpiderLegColor(): string {
  if (typeof document === 'undefined') return 'rgba(56, 120, 170, 0.42)';
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--map-tooltip-border')
    .trim();
  if (!raw) return 'rgba(56, 120, 170, 0.42)';
  return raw.includes('rgb') ? raw.replace(/\)$/, ' / 0.42)') : raw;
}

interface LeafletSpiderfyLegsProps {
  cluster: CityMarkerCluster;
  layout: Map<string, LatLngPoint>;
  progress: number;
}

export const LeafletSpiderfyLegs = memo(function LeafletSpiderfyLegs({
  cluster,
  layout,
  progress,
}: LeafletSpiderfyLegsProps) {
  const map = useMap();
  const linesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    const color = readSpiderLegColor();
    const lines: L.Polyline[] = [];

    cluster.cities.forEach((city) => {
      const target = layout.get(city.id);
      if (!target) return;
      const line = L.polyline(
        [
          [cluster.lat, cluster.lng],
          [city.lat, city.lng],
        ],
        {
          color,
          weight: 1,
          opacity: 0,
          dashArray: '3 5',
          lineCap: 'round',
          interactive: false,
          className: 'ebh-spiderfy-leg',
        },
      ).addTo(group);
      lines.push(line);
    });

    linesRef.current = lines;

    return () => {
      map.removeLayer(group);
      linesRef.current = [];
    };
  }, [map, cluster, layout]);

  useEffect(() => {
    const center: LatLngPoint = { lat: cluster.lat, lng: cluster.lng };
    const t = easeOutCubic(progress);
    const opacity = 0.38 * t;

    linesRef.current.forEach((line, i) => {
      const city = cluster.cities[i];
      if (!city) return;
      const target = layout.get(city.id);
      if (!target) return;

      const spiderLat = center.lat + (target.lat - center.lat) * t;
      const spiderLng = center.lng + (target.lng - center.lng) * t;

      line.setLatLngs([
        [spiderLat, spiderLng],
        [city.lat, city.lng],
      ]);
      line.setStyle({ opacity });
    });
  }, [cluster, layout, progress]);

  return null;
});
