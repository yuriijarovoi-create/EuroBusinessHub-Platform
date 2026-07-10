import { useCallback } from 'react';
import type { MapSearchTarget } from '../engine/types';
import { focusMapOnCity } from '../utils/mapCityNavigation';
import { filterCitiesForSearch, normalizeSearchText } from '../utils/citySearchUtils';

/**
 * Search → map fly controller. Wire GlobalSearch results here.
 */
export function useMapSearchController(flyTo?: (target: MapSearchTarget) => void) {
  return useCallback(
    (query: string) => {
      const normalized = normalizeSearchText(query);
      if (!normalized || !flyTo) return false;

      const match = filterCitiesForSearch(query)[0]?.city;
      if (!match) return false;

      focusMapOnCity(match, { clearCountryFocus: true, source: 'search' });

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
