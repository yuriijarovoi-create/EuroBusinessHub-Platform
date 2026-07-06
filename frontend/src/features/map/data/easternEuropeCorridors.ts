import type { BusinessRouteDef } from '../types/mapTypes';
import { buildRouteBatch } from './routeBuilder';

/**
 * Eastern Europe, Ukraine, Turkey and Balkans — strategic logistics expansion.
 */
export const EASTERN_EUROPE_CORRIDORS: BusinessRouteDef[] = [
  ...buildRouteBatch(
    [
      // ── Ukraine national network ──
      ['kyiv', 'kharkiv', 'rail', 'country', ['UA'], 1, 5],
      ['kyiv', 'dnipro', 'rail', 'country', ['UA'], 1, 5],
      ['kyiv', 'lviv', 'rail', 'country', ['UA'], 1, 4],
      ['kyiv', 'odesa', 'rail', 'country', ['UA'], 1, 5],
      ['kharkiv', 'dnipro', 'rail', 'country', ['UA'], 1, 4],
      ['lviv', 'kyiv', 'road', 'country', ['UA'], 2, 4],
      ['odesa', 'kyiv', 'sea', 'country', ['UA'], 2, 4],
      ['dnipro', 'kharkiv', 'road', 'country', ['UA'], 2, 3],
      ['odesa', 'izium', 'rail', 'country', ['UA'], 1, 4],
      ['krakow', 'lviv', 'road', 'europe', ['PL', 'UA'], 1, 4],
      ['bucharest', 'odesa', 'sea', 'europe', ['RO', 'UA'], 1, 4],
      ['vienna', 'kyiv', 'rail', 'europe', ['AT', 'UA'], 1, 4],

      // ── Izium — reconstruction & European integration corridors ──
      ['izium', 'kyiv', 'rail', 'country', ['UA'], 1, 5],
      ['izium', 'kharkiv', 'road', 'country', ['UA'], 1, 4],
      ['izium', 'dnipro', 'rail', 'country', ['UA'], 1, 4],
      ['izium', 'warsaw', 'rail', 'europe', ['UA', 'PL'], 1, 5],
      ['izium', 'berlin', 'rail', 'europe', ['UA', 'DE'], 1, 5],
      ['izium', 'frankfurt', 'rail', 'europe', ['UA', 'DE'], 1, 4],
      ['izium', 'prague', 'road', 'europe', ['UA', 'CZ'], 1, 4],

      // ── Ukraine ↔ Europe backbone ──
      ['kyiv', 'prague', 'rail', 'europe', ['UA', 'CZ'], 1, 4],
      ['kyiv', 'vienna', 'rail', 'europe', ['UA', 'AT'], 1, 4],
      ['lviv', 'warsaw', 'road', 'europe', ['UA', 'PL'], 1, 4],
      ['lviv', 'prague', 'rail', 'europe', ['UA', 'CZ'], 2, 4],
      ['odesa', 'constanta', 'sea', 'europe', ['UA', 'RO'], 2, 4],
      ['odesa', 'istanbul', 'sea', 'europe', ['UA', 'TR'], 1, 4],
      ['dnipro', 'warsaw', 'rail', 'europe', ['UA', 'PL'], 2, 3],

      // ── Turkey — Europe–Asia gateway ──
      ['istanbul', 'sofia', 'road', 'europe', ['TR', 'BG'], 1, 5],
      ['istanbul', 'bucharest', 'rail', 'europe', ['TR', 'RO'], 1, 5],
      ['istanbul', 'vienna', 'rail', 'europe', ['TR', 'AT'], 1, 4],
      ['istanbul', 'budapest', 'rail', 'europe', ['TR', 'HU'], 1, 5],
      ['istanbul', 'berlin', 'air', 'europe', ['TR', 'DE'], 1, 4],
      ['istanbul', 'frankfurt', 'air', 'europe', ['TR', 'DE'], 1, 4],
      ['istanbul', 'kyiv', 'air', 'europe', ['TR', 'UA'], 1, 4],
      ['ankara', 'istanbul', 'rail', 'country', ['TR'], 1, 5],
      ['istanbul', 'izmir', 'rail', 'country', ['TR'], 1, 5],
      ['istanbul', 'bursa', 'road', 'country', ['TR'], 1, 4],
      ['izmir', 'ankara', 'rail', 'country', ['TR'], 2, 4],
      ['istanbul', 'athens', 'sea', 'europe', ['TR', 'GR'], 2, 4],
      ['istanbul', 'warsaw', 'air', 'europe', ['TR', 'PL'], 2, 3],

      // ── Balkans ──
      ['belgrade', 'budapest', 'rail', 'europe', ['RS', 'HU'], 2, 4],
      ['belgrade', 'bucharest', 'road', 'europe', ['RS', 'RO'], 2, 4],
      ['belgrade', 'vienna', 'rail', 'europe', ['RS', 'AT'], 2, 3],
      ['zagreb', 'vienna', 'road', 'europe', ['HR', 'AT'], 2, 4],
      ['zagreb', 'ljubljana', 'road', 'country', ['HR', 'SI'], 2, 3],
      ['ljubljana', 'vienna', 'road', 'europe', ['SI', 'AT'], 2, 4],
      ['sarajevo', 'zagreb', 'road', 'country', ['BA', 'HR'], 3, 3],
      ['sofia', 'bucharest', 'rail', 'europe', ['BG', 'RO'], 1, 4],
      ['bucharest', 'budapest', 'rail', 'europe', ['RO', 'HU'], 1, 4],
      ['athens', 'sofia', 'road', 'europe', ['GR', 'BG'], 2, 4],

      // ── Nordics & Baltics ──
      ['stockholm', 'copenhagen', 'rail', 'europe', ['SE', 'DK'], 1, 4],
      ['stockholm', 'helsinki', 'sea', 'europe', ['SE', 'FI'], 1, 4],
      ['oslo', 'copenhagen', 'sea', 'europe', ['NO', 'DK'], 2, 4],
      ['oslo', 'stockholm', 'rail', 'europe', ['NO', 'SE'], 2, 3],
      ['helsinki', 'tallinn', 'sea', 'europe', ['FI', 'EE'], 2, 4],
      ['tallinn', 'riga', 'road', 'europe', ['EE', 'LV'], 2, 3],
      ['riga', 'vilnius', 'rail', 'europe', ['LV', 'LT'], 2, 4],
      ['vilnius', 'warsaw', 'rail', 'europe', ['LT', 'PL'], 1, 4],
      ['copenhagen', 'hamburg', 'sea', 'europe', ['DK', 'DE'], 1, 4],

      // ── UK & Ireland ──
      ['london', 'amsterdam', 'air', 'europe', ['GB', 'NL'], 1, 4],
      ['london', 'brussels', 'rail', 'europe', ['GB', 'BE'], 1, 4],
      ['dublin', 'london', 'sea', 'europe', ['IE', 'GB'], 2, 4],
      ['dublin', 'cork', 'road', 'country', ['IE'], 3, 3],

      // ── Iberia & periphery ──
      ['lisbon', 'porto', 'rail', 'country', ['PT'], 2, 4],
      ['madrid', 'lisbon', 'rail', 'europe', ['ES', 'PT'], 2, 4],
      ['luxembourg', 'brussels', 'road', 'europe', ['LU', 'BE'], 2, 4],
      ['luxembourg', 'frankfurt', 'road', 'europe', ['LU', 'DE'], 2, 3],
    ],
    'eu-east',
  ).map((route) =>
    route.fromCityId === 'izium' || route.toCityId === 'izium'
      ? { ...route, aiRecommended: true, businessPurpose: 'hub-connection' as const }
      : route,
  ),
];
