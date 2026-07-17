import type { Map as LeafletMap } from 'leaflet';
import type { MapCityRecord } from '../types/mapTypes';

/** Leaflet `bounds.pad()` factor for settlement marker culling (~25% margin). */
export const SETTLEMENT_VIEWPORT_BOUNDS_PAD = 0.25;

/** Serializable padded map bounds — stable for React dependency comparison. */
export interface MapViewportBoundsSnapshot {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function readPaddedBoundsSnapshot(
  map: LeafletMap,
  pad: number = SETTLEMENT_VIEWPORT_BOUNDS_PAD,
): MapViewportBoundsSnapshot {
  const b = map.getBounds().pad(pad);
  return {
    west: b.getWest(),
    south: b.getSouth(),
    east: b.getEast(),
    north: b.getNorth(),
  };
}

export function isLatLngInBoundsSnapshot(
  lat: number,
  lng: number,
  bounds: MapViewportBoundsSnapshot,
): boolean {
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

export function boundsSnapshotsEqual(
  a: MapViewportBoundsSnapshot,
  b: MapViewportBoundsSnapshot,
): boolean {
  return (
    a.west === b.west &&
    a.south === b.south &&
    a.east === b.east &&
    a.north === b.north
  );
}

/**
 * Keep zoom-eligible settlements that fall inside padded viewport bounds.
 * Forced IDs (selected / hovered / search) stay mounted even when off-screen.
 * When bounds are unavailable, only forced IDs render (avoids mounting the full DE set).
 */
export function filterCitiesInViewportBounds(
  cities: MapCityRecord[],
  bounds: MapViewportBoundsSnapshot | null | undefined,
  forcedIds?: ReadonlySet<string>,
): MapCityRecord[] {
  if (!bounds) {
    if (!forcedIds?.size) return [];
    return cities.filter((city) => forcedIds.has(city.id));
  }
  return cities.filter((city) => {
    if (forcedIds?.has(city.id)) return true;
    return isLatLngInBoundsSnapshot(city.lat, city.lng, bounds);
  });
}

export interface SettlementMarkerViewportStats {
  totalSettlements: number;
  zoomEligible: number;
  viewportRendered: number;
}

/** Pure helper for DEV diagnostics — no logging side effects. */
export function computeSettlementMarkerViewportStats(
  totalSettlements: number,
  zoomEligible: number,
  viewportRendered: number,
): SettlementMarkerViewportStats {
  return { totalSettlements, zoomEligible, viewportRendered };
}
