import type { PathOptions } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import type { MapCountry } from '@shared/types';
import type { EuropeGeoStyles } from '../utils/mapThemeUtils';
import type { CountryBusinessStats } from '../data/countryStats';

export type CountryLayerState = 'default' | 'hover' | 'selected' | 'dim';

export function resolveCountryIso(feature?: Feature<Geometry>): string | undefined {
  const iso = feature?.properties?.ISO_A2 as string | undefined;
  if (!iso || iso === '-99') return undefined;
  return iso;
}

export function resolveCountryLayerState(
  iso: string | undefined,
  selectedCode?: string,
  hoveredCode?: string,
): CountryLayerState {
  if (!iso) return 'default';
  if (selectedCode && iso === selectedCode) return 'selected';
  if (hoveredCode && iso === hoveredCode) return 'hover';
  if (selectedCode && iso !== selectedCode) return 'dim';
  return 'default';
}

export function styleForCountryState(
  state: CountryLayerState,
  styles: EuropeGeoStyles,
): PathOptions {
  switch (state) {
    case 'selected':
      return styles.selected;
    case 'hover':
      return styles.hover;
    case 'dim':
      return styles.dim;
    default:
      return styles.coast;
  }
}

export function buildCountryTooltipHtml(
  country: MapCountry,
  stats: CountryBusinessStats,
): string {
  return `<div class="ebh-country-tooltip-card">
    <div class="ebh-country-tooltip-title">${country.name}</div>
    <div class="ebh-country-tooltip-row"><span>Companies</span><strong>${stats.companies.toLocaleString()}</strong></div>
    <div class="ebh-country-tooltip-row"><span>Jobs</span><strong>${stats.jobs.toLocaleString()}</strong></div>
    <div class="ebh-country-tooltip-row"><span>Warehouses</span><strong>${stats.warehouses}</strong></div>
    <div class="ebh-country-tooltip-row"><span>Transport</span><strong>${stats.transport}</strong></div>
    <div class="ebh-country-tooltip-row"><span>AI Score</span><strong class="ebh-country-tooltip-ai">${stats.aiScore}</strong></div>
  </div>`;
}
