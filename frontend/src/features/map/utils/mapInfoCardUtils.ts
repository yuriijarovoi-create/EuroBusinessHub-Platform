import type { TooltipDirection } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';

const EDGE_MARGIN = 130;
const CARD_ESTIMATE = { w: 200, h: 160 };

/** Pick tooltip direction so the card stays inside the map viewport. */
export function resolveSmartTooltipDirection(
  map: LeafletMap,
  lat: number,
  lng: number,
): TooltipDirection {
  const pt = map.latLngToContainerPoint([lat, lng]);
  const { x: width, y: height } = map.getSize();

  const spaceTop = pt.y;
  const spaceBottom = height - pt.y;
  const spaceLeft = pt.x;
  const spaceRight = width - pt.x;

  const candidates: Array<{ dir: TooltipDirection; space: number }> = [
    { dir: 'top', space: spaceTop },
    { dir: 'bottom', space: spaceBottom },
    { dir: 'right', space: spaceRight },
    { dir: 'left', space: spaceLeft },
  ];

  candidates.sort((a, b) => b.space - a.space);

  for (const { dir, space } of candidates) {
    const need =
      dir === 'top' || dir === 'bottom' ? CARD_ESTIMATE.h + EDGE_MARGIN : CARD_ESTIMATE.w + EDGE_MARGIN;
    if (space >= need) return dir;
  }

  return candidates[0]?.dir ?? 'top';
}

export function tooltipOffsetForDirection(
  direction: TooltipDirection,
  markerOffset = 14,
): [number, number] {
  switch (direction) {
    case 'bottom':
      return [0, markerOffset];
    case 'left':
      return [-markerOffset, 0];
    case 'right':
      return [markerOffset, 0];
    case 'top':
    default:
      return [0, -markerOffset];
  }
}
