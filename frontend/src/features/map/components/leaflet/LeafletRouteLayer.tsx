import { memo, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusinessRouteDef, MapCityRecord } from '../../types/mapTypes';
import { ROUTE_COLORS, ROUTE_DASH } from '../../config/leafletConfig';
import { buildRouteLatLngs } from '../../utils/routeGeometry';

interface LeafletRouteLayerProps {
  routes: BusinessRouteDef[];
  cityMap: Map<string, MapCityRecord>;
}

const MAX_ROUTES = 180;

export const LeafletRouteLayer = memo(function LeafletRouteLayer({
  routes,
  cityMap,
}: LeafletRouteLayerProps) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;

    const animators: {
      marker: L.CircleMarker;
      points: L.LatLngTuple[];
      progress: number;
      speed: number;
    }[] = [];

    const visible = routes
      .filter((r) => cityMap.has(r.fromCityId) && cityMap.has(r.toCityId))
      .slice(0, MAX_ROUTES);

    visible.forEach((route, idx) => {
      const from = cityMap.get(route.fromCityId)!;
      const to = cityMap.get(route.toCityId)!;
      const intensity = route.intensity ?? 2;

      const latlngs = buildRouteLatLngs(from.lat, from.lng, to.lat, to.lng, route.mode);
      const color = ROUTE_COLORS[route.mode];
      const weight = route.mode === 'air' ? 1.2 + intensity * 0.2 : 1.5 + intensity * 0.25;
      const glowWeight = weight + 3;

      L.polyline(latlngs, {
        color,
        weight: glowWeight,
        opacity: 0.08 + intensity * 0.03,
        lineCap: 'round',
        interactive: false,
      }).addTo(group);

      L.polyline(latlngs, {
        color,
        weight,
        opacity: 0.35 + intensity * 0.08,
        dashArray: ROUTE_DASH[route.mode],
        lineCap: 'round',
        className: `ebh-route ebh-route-${route.mode}`,
      }).addTo(group);

      L.polyline(latlngs, {
        color: '#f0f9ff',
        weight: Math.max(0.6, weight - 1),
        opacity: 0.15 + intensity * 0.05,
        dashArray: '2 14',
        lineCap: 'round',
        interactive: false,
      }).addTo(group);

      const particleCount = Math.min(3, Math.max(1, Math.round(intensity / 2)));
      for (let p = 0; p < particleCount; p++) {
        const particle = L.circleMarker(latlngs[0], {
          radius: route.mode === 'air' ? 2.5 + intensity * 0.3 : 2 + intensity * 0.25,
          fillColor: color,
          fillOpacity: 0.95,
          color: '#f0f9ff',
          weight: 1,
          interactive: false,
        }).addTo(group);

        animators.push({
          marker: particle,
          points: latlngs,
          progress: ((idx * 0.11 + p * 0.33) % 1),
          speed:
            (route.mode === 'sea' ? 0.0007 : route.mode === 'air' ? 0.0011 : 0.0009) *
            (0.8 + intensity * 0.15),
        });
      }
    });

    const interpolate = (points: L.LatLngTuple[], t: number): L.LatLngTuple => {
      const seg = t * (points.length - 1);
      const i = Math.floor(seg);
      const f = seg - i;
      const a = points[i];
      const b = points[Math.min(i + 1, points.length - 1)];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    };

    const tick = () => {
      animators.forEach((a) => {
        a.progress = (a.progress + a.speed) % 1;
        a.marker.setLatLng(interpolate(a.points, a.progress));
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map, routes, cityMap]);

  return null;
});
