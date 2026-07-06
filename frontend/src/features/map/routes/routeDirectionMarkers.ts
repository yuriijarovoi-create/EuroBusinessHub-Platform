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
  const positions = count === 2 ? [0.38, 0.68] : [0.52];

  for (const t of positions) {
    const pos = interpolateAlongPath(points, t);
    const m = L.circleMarker(pos, {
      radius: level === 1 ? 1.5 : 1.1,
      fillColor: color,
      fillOpacity: 0.42,
      color: 'rgba(255,255,255,0.5)',
      weight: 0.3,
      opacity: 0.28,
      className: 'ebh-route-direction',
      interactive: false,
    }).addTo(group);
    markers.push(m);
  }

  return markers;
}
