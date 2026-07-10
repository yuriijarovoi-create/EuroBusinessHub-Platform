import { useCallback } from 'react';
import type { MapSearchTarget } from '../engine/types';
import { getMapCityById } from '../data/mapData';
import { normalizeSearchText, filterCitiesForSearch } from '../utils/citySearchUtils';

/**
 * Search → map fly controller. Wire GlobalSearch results here.
 */
export function useMapSearchController(flyTo?: (target: MapSearchTarget) => void) {
  return useCallback(
    (query: string) => {
      const normalized = normalizeSearchText(query);
      if (!normalized || !flyTo) return false;

      const match = filterCitiesForSearch(query)[0]?.city ?? getMapCityById(normalized);

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
