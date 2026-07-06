import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { interpolateAlongPath } from '../utils/routeAnimation';
import { directionMarkerCount } from '../utils/mapRouteStyles';
import type { RouteRenderLevel } from './routeLevels';

export function addRouteDirectionMarkers(
  group: L.LayerGroup,
  points: LatLngTuple[],
  color: string,
  level: RouteRenderLevel,
): L.CircleMarker[] {
  const count = directionMarkerCount(level);
  if (count === 0 || points.length < 2) return [];

  const markers: L.CircleMarker[] = [];
  const positions = count === 3 ? [0.28, 0.52, 0.76] : [0.38, 0.68];

  for (const t of positions) {
    const pos = interpolateAlongPath(points, t);
    const m = L.circleMarker(pos, {
      radius: level === 1 ? 2.2 : 1.6,
      fillColor: color,
      fillOpacity: 0.55,
      color: '#ffffff',
      weight: 0.6,
      opacity: 0.35,
      className: 'ebh-route-direction',
      interactive: false,
    }).addTo(group);
    markers.push(m);
  }

  return markers;
}
