/**
 * European country registry — centers georeferenced via projection.
 * SVG hit paths are simplified; landmass provides visual context.
 */

import { latLngToMapXY } from '../utils/projection';

export interface CountryPathDef {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  mapPath: string;
  centerX: number;
  centerY: number;
  lat: number;
  lng: number;
  zoomLevel: number;
  isHub?: boolean;
  hubCityId?: string;
}

function cc(lat: number, lng: number) {
  return latLngToMapXY(lat, lng);
}

function def(
  base: Omit<CountryPathDef, 'centerX' | 'centerY'> & { lat: number; lng: number },
): CountryPathDef {
  const { lat, lng, ...rest } = base;
  const { mapX, mapY } = cc(lat, lng);
  return { ...rest, centerX: mapX, centerY: mapY, lat, lng };
}

export const EUROPE_COUNTRY_PATHS: CountryPathDef[] = [
  def({ id: 'de', code: 'DE', name: 'Deutschland', nameEn: 'Germany', isHub: true, hubCityId: 'berlin', lat: 51.2, lng: 10.5, zoomLevel: 3.2, mapPath: 'M 44 38 Q 50 34 56 38 L 58 46 Q 54 52 48 50 L 42 46 Q 40 42 44 38 Z' }),
  def({ id: 'fr', code: 'FR', name: 'Frankreich', nameEn: 'France', lat: 46.5, lng: 2.5, zoomLevel: 2.4, mapPath: 'M 36 44 Q 42 40 46 42 L 48 52 Q 44 58 38 56 L 32 50 Q 30 46 36 44 Z' }),
  def({ id: 'it', code: 'IT', name: 'Italien', nameEn: 'Italy', lat: 42.5, lng: 12.5, zoomLevel: 2.6, mapPath: 'M 48 48 Q 52 46 54 52 L 52 62 Q 48 64 46 58 L 44 52 Q 46 48 48 48 Z' }),
  def({ id: 'es', code: 'ES', name: 'Spanien', nameEn: 'Spain', lat: 40.5, lng: -3.5, zoomLevel: 2.4, mapPath: 'M 28 48 Q 34 44 38 50 L 36 60 Q 28 62 24 54 L 28 48 Z' }),
  def({ id: 'pt', code: 'PT', name: 'Portugal', nameEn: 'Portugal', lat: 39.5, lng: -8.0, zoomLevel: 2.8, mapPath: 'M 22 50 Q 26 48 28 54 L 26 58 Q 22 58 20 54 Z' }),
  def({ id: 'be', code: 'BE', name: 'Belgien', nameEn: 'Belgium', lat: 50.5, lng: 4.5, zoomLevel: 4, mapPath: 'M 42 40 Q 46 38 48 42 L 44 46 Q 40 44 42 40 Z' }),
  def({ id: 'nl', code: 'NL', name: 'Niederlande', nameEn: 'Netherlands', lat: 52.2, lng: 5.5, zoomLevel: 4, mapPath: 'M 42 34 Q 46 32 48 36 L 46 40 Q 42 40 40 38 Z' }),
  def({ id: 'lu', code: 'LU', name: 'Luxemburg', nameEn: 'Luxembourg', lat: 49.6, lng: 6.1, zoomLevel: 5.5, mapPath: 'M 45 43 L 47 43 L 47 45 L 45 45 Z' }),
  def({ id: 'at', code: 'AT', name: 'Österreich', nameEn: 'Austria', lat: 47.5, lng: 14.0, zoomLevel: 3, mapPath: 'M 52 46 Q 58 44 62 50 L 58 56 Q 52 54 52 46 Z' }),
  def({ id: 'ch', code: 'CH', name: 'Schweiz', nameEn: 'Switzerland', lat: 46.8, lng: 8.2, zoomLevel: 3.5, mapPath: 'M 44 50 Q 48 48 50 52 L 46 56 Q 42 54 44 50 Z' }),
  def({ id: 'pl', code: 'PL', name: 'Polen', nameEn: 'Poland', lat: 52.0, lng: 19.5, zoomLevel: 2.6, mapPath: 'M 56 36 Q 66 34 70 42 L 66 48 Q 58 46 56 40 Z' }),
  def({ id: 'cz', code: 'CZ', name: 'Tschechien', nameEn: 'Czech Republic', lat: 49.8, lng: 15.5, zoomLevel: 3.2, mapPath: 'M 52 42 Q 58 40 60 46 L 56 50 Q 50 48 52 42 Z' }),
  def({ id: 'sk', code: 'SK', name: 'Slowakei', nameEn: 'Slovakia', lat: 48.7, lng: 19.5, zoomLevel: 3.4, mapPath: 'M 58 46 Q 62 44 64 50 L 60 52 Q 56 50 58 46 Z' }),
  def({ id: 'hu', code: 'HU', name: 'Ungarn', nameEn: 'Hungary', lat: 47.2, lng: 19.5, zoomLevel: 3, mapPath: 'M 56 48 Q 64 46 66 52 L 62 56 Q 56 54 56 48 Z' }),
  def({ id: 'ro', code: 'RO', name: 'Rumänien', nameEn: 'Romania', lat: 45.9, lng: 25.0, zoomLevel: 2.6, mapPath: 'M 60 50 Q 68 48 70 56 L 66 60 Q 60 58 60 50 Z' }),
  def({ id: 'bg', code: 'BG', name: 'Bulgarien', nameEn: 'Bulgaria', lat: 42.7, lng: 25.5, zoomLevel: 2.8, mapPath: 'M 62 54 Q 70 52 72 58 L 68 62 Q 62 60 62 54 Z' }),
  def({ id: 'hr', code: 'HR', name: 'Kroatien', nameEn: 'Croatia', lat: 45.1, lng: 15.2, zoomLevel: 3, mapPath: 'M 50 52 Q 56 50 58 56 L 54 58 Q 50 56 50 52 Z' }),
  def({ id: 'si', code: 'SI', name: 'Slowenien', nameEn: 'Slovenia', lat: 46.1, lng: 14.5, zoomLevel: 4.2, mapPath: 'M 52 50 Q 56 48 58 52 L 54 54 Q 52 52 52 50 Z' }),
  def({ id: 'dk', code: 'DK', name: 'Dänemark', nameEn: 'Denmark', lat: 56.0, lng: 10.0, zoomLevel: 3.8, mapPath: 'M 46 28 Q 52 26 54 30 L 50 34 Q 46 32 46 28 Z' }),
  def({ id: 'se', code: 'SE', name: 'Schweden', nameEn: 'Sweden', lat: 62.0, lng: 16.0, zoomLevel: 2.2, mapPath: 'M 50 10 Q 62 8 66 20 L 62 32 Q 54 30 50 20 Z' }),
  def({ id: 'no', code: 'NO', name: 'Norwegen', nameEn: 'Norway', lat: 64.0, lng: 12.0, zoomLevel: 2, mapPath: 'M 42 6 Q 50 4 52 16 L 48 28 Q 42 24 42 12 Z' }),
  def({ id: 'fi', code: 'FI', name: 'Finnland', nameEn: 'Finland', lat: 64.0, lng: 26.0, zoomLevel: 2, mapPath: 'M 58 10 Q 70 8 72 22 L 68 34 Q 60 30 58 18 Z' }),
  def({ id: 'ie', code: 'IE', name: 'Irland', nameEn: 'Ireland', lat: 53.3, lng: -7.5, zoomLevel: 3, mapPath: 'M 22 34 Q 28 32 30 38 L 26 42 Q 20 40 22 34 Z' }),
  def({ id: 'gb', code: 'GB', name: 'Vereinigtes Königreich', nameEn: 'United Kingdom', lat: 54.0, lng: -2.5, zoomLevel: 2.4, mapPath: 'M 30 30 Q 38 28 40 36 L 36 42 Q 30 40 28 34 Z' }),
  def({ id: 'ee', code: 'EE', name: 'Estland', nameEn: 'Estonia', lat: 58.6, lng: 25.5, zoomLevel: 3.8, mapPath: 'M 60 26 Q 68 24 70 30 L 66 32 Q 60 30 60 26 Z' }),
  def({ id: 'lv', code: 'LV', name: 'Lettland', nameEn: 'Latvia', lat: 56.9, lng: 24.6, zoomLevel: 3.8, mapPath: 'M 60 30 Q 68 28 70 34 L 66 36 Q 60 34 60 30 Z' }),
  def({ id: 'lt', code: 'LT', name: 'Litauen', nameEn: 'Lithuania', lat: 55.2, lng: 24.0, zoomLevel: 3.6, mapPath: 'M 60 34 Q 68 32 70 38 L 66 40 Q 60 38 60 34 Z' }),
  def({ id: 'gr', code: 'GR', name: 'Griechenland', nameEn: 'Greece', lat: 39.0, lng: 22.0, zoomLevel: 2.6, mapPath: 'M 58 58 Q 66 56 68 62 L 64 66 Q 58 64 58 58 Z' }),
  def({ id: 'ua', code: 'UA', name: 'Ukraine', nameEn: 'Ukraine', lat: 49.0, lng: 31.5, zoomLevel: 2.2, mapPath: 'M 68 38 Q 78 36 80 46 L 76 52 Q 68 50 68 38 Z' }),
  def({ id: 'tr', code: 'TR', name: 'Türkei', nameEn: 'Turkey', lat: 39.0, lng: 35.0, zoomLevel: 2.2, mapPath: 'M 72 48 Q 82 46 84 54 L 78 58 Q 70 56 72 48 Z' }),
  def({ id: 'rs', code: 'RS', name: 'Serbien', nameEn: 'Serbia', lat: 44.0, lng: 21.0, zoomLevel: 3, mapPath: 'M 58 52 Q 64 50 66 56 L 62 58 Q 58 56 58 52 Z' }),
  def({ id: 'ba', code: 'BA', name: 'Bosnien und Herzegowina', nameEn: 'Bosnia and Herzegovina', lat: 44.0, lng: 17.8, zoomLevel: 3.4, mapPath: 'M 54 52 Q 58 50 60 54 L 56 56 Q 54 54 54 52 Z' }),
  def({ id: 'mk', code: 'MK', name: 'Nordmazedonien', nameEn: 'North Macedonia', lat: 41.6, lng: 21.7, zoomLevel: 3.6, mapPath: 'M 60 56 Q 64 54 66 58 L 62 60 Q 60 58 60 56 Z' }),
  def({ id: 'al', code: 'AL', name: 'Albanien', nameEn: 'Albania', lat: 41.2, lng: 20.0, zoomLevel: 3.6, mapPath: 'M 58 58 Q 62 56 64 60 L 60 62 Q 58 60 58 58 Z' }),
  def({ id: 'me', code: 'ME', name: 'Montenegro', nameEn: 'Montenegro', lat: 42.7, lng: 19.3, zoomLevel: 4, mapPath: 'M 56 56 Q 60 54 62 58 L 58 60 Q 56 58 56 56 Z' }),
  def({ id: 'md', code: 'MD', name: 'Moldau', nameEn: 'Moldova', lat: 47.0, lng: 28.5, zoomLevel: 3.2, mapPath: 'M 66 48 Q 72 46 74 52 L 70 54 Q 66 52 66 48 Z' }),
];

export function getCountryPathByCode(code: string): CountryPathDef | undefined {
  return EUROPE_COUNTRY_PATHS.find((c) => c.code === code);
}
