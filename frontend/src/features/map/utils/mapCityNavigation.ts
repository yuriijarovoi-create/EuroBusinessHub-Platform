import { getMapCityById } from '../data/mapData';
import { mapSessionStore } from '../store/mapSessionStore';
import type { MapCityRecord } from '../types/mapTypes';

export type CityFocusSource = 'search' | 'marker' | 'deep-link';

export interface FocusMapCityOptions {
  /**
   * Exit country / Bundesland focus when jumping to a city.
   * Use `true` for search and cross-region jumps; `false` when selecting
   * a city inside the current country context (marker tap).
   */
  clearCountryFocus?: boolean;
  source?: CityFocusSource;
}

function resolveCity(city: MapCityRecord | string): MapCityRecord | null {
  if (typeof city === 'string') return getMapCityById(city) ?? null;
  return city;
}

/** Whether an explicit city geographic focus is active (blocks auto extent fits). */
export function hasActiveCityFocus(
  session = mapSessionStore.getState(),
): boolean {
  return Boolean(session.focusCityId ?? session.selectedCityId);
}

/**
 * Shared geographic city focus for every map control layer.
 * Updates session selection only — never changes activeMapContext or layer filters.
 * Camera movement is handled by LeafletCityFocus via `focusCityId`.
 */
export function focusMapOnCity(
  city: MapCityRecord | string,
  options: FocusMapCityOptions = {},
): MapCityRecord | null {
  const record = resolveCity(city);
  if (!record) return null;

  const clearCountryFocus = options.clearCountryFocus ?? false;

  mapSessionStore.patch({
    focusCityId: record.id,
    selectedCityId: record.id,
    infoCardCityId: record.id,
    infoCardCountryCode: null,
    selectedRouteId: null,
    homeFullEuropeOverview: false,
    ...(clearCountryFocus
      ? {
          selectedCountryCode: undefined,
          selectedBundeslandId: undefined,
        }
      : {}),
  });

  void options.source;

  return record;
}

/** Clear city geographic focus while keeping the active business layer unchanged. */
export function clearMapCityFocus(): void {
  mapSessionStore.patch({
    focusCityId: undefined,
    selectedCityId: null,
    infoCardCityId: null,
    infoCardCountryCode: null,
    selectedRouteId: null,
  });
}
