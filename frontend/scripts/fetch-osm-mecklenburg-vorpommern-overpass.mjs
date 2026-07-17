/**
 * Fetch place=* settlements in Mecklenburg-Vorpommern from OpenStreetMap (Overpass API).
 * Output: scripts/osm-mecklenburg-vorpommern-places.json
 *
 * Includes city, town, village, hamlet, and isolated_dwelling (filtered later for
 * independent settlement names).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'osm-mecklenburg-vorpommern-places.json');
const SERVERS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

// Approximate MV bbox incl. Rügen / Usedom (fallback only)
const MV_BBOX = '53.05,10.55,54.75,14.45';

const QUERY = `
[out:json][timeout:300];
area["name"="Mecklenburg-Vorpommern"]["boundary"="administrative"]["admin_level"="4"]->.mv;
(
  node["place"="city"]["name"](area.mv);
  node["place"="town"]["name"](area.mv);
  node["place"="village"]["name"](area.mv);
  node["place"="hamlet"]["name"](area.mv);
  node["place"="isolated_dwelling"]["name"](area.mv);
);
out body;
`;

const BBOX_QUERY = `
[out:json][timeout:300];
(
  node["place"="city"]["name"](${MV_BBOX});
  node["place"="town"]["name"](${MV_BBOX});
  node["place"="village"]["name"](${MV_BBOX});
  node["place"="hamlet"]["name"](${MV_BBOX});
  node["place"="isolated_dwelling"]["name"](${MV_BBOX});
);
out body;
`;

async function fetchOverpass(query) {
  let lastErr;
  for (const server of SERVERS) {
    try {
      console.error(`Trying ${server}…`);
      const res = await fetch(server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: 'application/json',
          'User-Agent': 'EuroBusinessHub-Platform/1.0 (mecklenburg-vorpommern-import)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) { lastErr = new Error(`Overpass ${res.status}`); continue; }
      const json = await res.json();
      if (json.elements?.length) return json;
      lastErr = new Error('Empty result');
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error('Overpass failed');
}

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

let data;
try { data = await fetchOverpass(QUERY); }
catch (e) {
  console.error('Area query failed — falling back to MV bbox:', e.message);
  data = await fetchOverpass(BBOX_QUERY);
}

const places = [];
const byPlace = {};
for (const el of data.elements ?? []) {
  if (el.type !== 'node' || !el.tags?.name) continue;
  const pop = el.tags.population ? parseInt(el.tags.population, 10) : null;
  const place = el.tags.place;
  byPlace[place] = (byPlace[place] ?? 0) + 1;
  places.push({
    osmId: el.id,
    id: slug(el.tags.name.trim()),
    name: el.tags.name.trim(),
    lat: el.lat,
    lng: el.lon,
    place,
    population: Number.isFinite(pop) ? pop : null,
  });
}
places.sort((a, b) => a.name.localeCompare(b.name, 'de'));
fs.writeFileSync(OUT, JSON.stringify({
  fetchedAt: new Date().toISOString(),
  count: places.length,
  byPlace,
  places,
}, null, 2));
console.error(`Fetched ${places.length} OSM places → ${OUT}`);
console.log(JSON.stringify({ count: places.length, byPlace, sample: places.slice(0, 5) }, null, 2));
