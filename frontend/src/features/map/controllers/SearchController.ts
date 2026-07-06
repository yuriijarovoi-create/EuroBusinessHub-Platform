import { useCallback } from 'react';
import type { MapSearchTarget } from '../engine/types';
import { getAllMapCities } from '../data/mapData';

/**
 * Search → map fly controller. Wire GlobalSearch results here.
 */
export function useMapSearchController(flyTo?: (target: MapSearchTarget) => void) {
  return useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized || !flyTo) return false;

      const match = getAllMapCities().find(
        (c) =>
          c.id === normalized ||
          c.name.toLowerCase() === normalized ||
          c.name.toLowerCase().startsWith(normalized),
      );

      if (!match) return false;

      flyTo({
        kind: 'city',
        id: match.id,
        lat: match.lat,
        lng: match.lng,
        label: match.name,
      });
      return true;
    },
    [flyTo],
  );
}
