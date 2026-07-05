import type { BusinessRouteDef, TransportMode } from '../types/mapTypes';

type Corridor = [from: string, to: string, mode: TransportMode, intensity?: number];

function route(
  from: string,
  to: string,
  mode: TransportMode,
  intensity = 2,
  delay = 0,
): BusinessRouteDef {
  return {
    id: `${mode}-${from}-${to}`,
    fromCityId: from,
    toCityId: to,
    mode,
    active: true,
    delay,
    intensity,
  };
}

function corridors(list: Corridor[]): BusinessRouteDef[] {
  return list.map(([from, to, mode, intensity], i) =>
    route(from, to, mode, intensity ?? 2, (i * 0.07) % 1),
  );
}

/** Major logistics corridors — appended to core hub routes */
export const CORRIDOR_ROUTES: BusinessRouteDef[] = [
  ...corridors([
    ['berlin', 'hamburg', 'rail', 4],
    ['berlin', 'munich', 'rail', 4],
    ['berlin', 'frankfurt', 'road', 4],
    ['hamburg', 'frankfurt', 'road', 3],
    ['munich', 'frankfurt', 'rail', 3],
    ['cologne', 'frankfurt', 'road', 3],
    ['cologne', 'duesseldorf', 'road', 2],
    ['stuttgart', 'munich', 'road', 3],
    ['leipzig', 'berlin', 'rail', 2],
    ['dortmund', 'cologne', 'road', 2],
    ['bremen', 'hamburg', 'sea', 2],
    ['hanover', 'berlin', 'rail', 2],
    ['nuremberg', 'munich', 'road', 2],
    ['paris', 'lyon', 'rail', 4],
    ['paris', 'marseille', 'air', 3],
    ['paris', 'lille', 'rail', 3],
    ['paris', 'bordeaux', 'road', 2],
    ['lyon', 'marseille', 'road', 2],
    ['toulouse', 'barcelona', 'road', 3],
    ['strasbourg', 'frankfurt', 'road', 3],
    ['nantes', 'paris', 'road', 2],
    ['nice', 'marseille', 'road', 2],
    ['madrid', 'barcelona', 'rail', 4],
    ['madrid', 'valencia', 'rail', 3],
    ['madrid', 'seville', 'road', 2],
    ['barcelona', 'valencia', 'road', 3],
    ['bilbao', 'madrid', 'road', 2],
    ['malaga', 'madrid', 'air', 2],
    ['zaragoza', 'barcelona', 'road', 2],
    ['milan', 'rome', 'rail', 4],
    ['milan', 'turin', 'road', 3],
    ['milan', 'bologna', 'rail', 3],
    ['rome', 'naples', 'road', 3],
    ['bologna', 'florence', 'road', 2],
    ['venice', 'milan', 'road', 2],
    ['genoa', 'milan', 'sea', 3],
    ['florence', 'rome', 'road', 2],
    ['amsterdam', 'rotterdam', 'road', 4],
    ['amsterdam', 'brussels', 'rail', 3],
    ['rotterdam', 'antwerp', 'sea', 4],
    ['brussels', 'antwerp', 'road', 3],
    ['brussels', 'ghent', 'road', 2],
    ['antwerp', 'liege', 'road', 2],
    ['utrecht', 'amsterdam', 'road', 2],
    ['eindhoven', 'rotterdam', 'road', 2],
    ['warsaw', 'krakow', 'rail', 3],
    ['warsaw', 'gdansk', 'rail', 3],
    ['warsaw', 'poznan', 'road', 2],
    ['wroclaw', 'prague', 'road', 3],
    ['lodz', 'warsaw', 'road', 2],
    ['prague', 'brno', 'road', 2],
    ['prague', 'vienna', 'rail', 3],
    ['brno', 'vienna', 'road', 2],
    ['ostrava', 'krakow', 'road', 2],
    ['budapest', 'vienna', 'rail', 3],
    ['bucharest', 'cluj', 'road', 2],
    ['bucharest', 'constanta', 'sea', 3],
    ['sofia', 'varna', 'sea', 2],
    ['vienna', 'linz', 'road', 2],
    ['vienna', 'graz', 'road', 2],
    ['vienna', 'salzburg', 'road', 2],
    ['salzburg', 'munich', 'road', 2],
    ['zurich', 'basel', 'rail', 3],
    ['zurich', 'geneva', 'rail', 3],
    ['zurich', 'milan', 'road', 3],
    ['geneva', 'lyon', 'road', 2],
    ['basel', 'frankfurt', 'rail', 3],
    ['stockholm', 'gothenburg', 'rail', 3],
    ['stockholm', 'malmo', 'rail', 3],
    ['malmo', 'copenhagen', 'sea', 3],
    ['oslo', 'bergen', 'sea', 2],
    ['helsinki', 'tampere', 'road', 2],
    ['tallinn', 'riga', 'sea', 2],
    ['riga', 'vilnius', 'road', 2],
    ['kaunas', 'vilnius', 'road', 2],
    ['london', 'dublin', 'sea', 3],
    ['dublin', 'cork', 'road', 2],
    ['lisbon', 'porto', 'road', 3],
    ['athens', 'thessaloniki', 'road', 2],
    ['istanbul', 'thessaloniki', 'road', 2],
    ['kyiv', 'lviv', 'road', 3],
    ['kyiv', 'dnipro', 'rail', 2],
    ['odesa', 'kyiv', 'rail', 2],
    ['lviv', 'krakow', 'road', 3],
    ['berlin', 'warsaw', 'rail', 4],
    ['paris', 'brussels', 'rail', 4],
    ['paris', 'amsterdam', 'rail', 3],
    ['frankfurt', 'amsterdam', 'road', 4],
    ['frankfurt', 'paris', 'air', 3],
    ['munich', 'vienna', 'rail', 3],
    ['hamburg', 'copenhagen', 'sea', 3],
    ['milan', 'zurich', 'rail', 3],
    ['barcelona', 'marseille', 'sea', 3],
    ['madrid', 'lisbon', 'rail', 3],
    ['warsaw', 'vilnius', 'road', 2],
    ['budapest', 'bucharest', 'rail', 2],
    ['athens', 'istanbul', 'air', 2],
  ]),
];

export function mergeRoutes(...groups: BusinessRouteDef[][]): BusinessRouteDef[] {
  const seen = new Set<string>();
  const out: BusinessRouteDef[] = [];
  for (const group of groups) {
    for (const r of group) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
  }
  return out;
}
