/**
 * Fetch all place=* settlements in Bayern from OpenStreetMap (Overpass API).
 * Output: scripts/osm-bayern-places.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'osm-bayern-places.json');

const SERVERS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const QUERY = `
[out:json][timeout:300];
area["name"="Bayern"]["boundary"="administrative"]["admin_level"="4"]->.by;
(
  node["place"="city"]["name"](area.by);
  node["place"="town"]["name"](area.by);
  node["place"="village"]["name"](area.by);
  node["place"="hamlet"]["name"](area.by);
);
out body;
`;

/** Bayern bbox fallback [south, west, north, east] */
const BBOX_QUERY = `
[out:json][timeout:300];
(
  node["place"="city"]["name"](47.27,8.98,50.56,13.84);
  node["place"="town"]["name"](47.27,8.98,50.56,13.84);
  node["place"="village"]["name"](47.27,8.98,50.56,13.84);
  node["place"="hamlet"]["name"](47.27,8.98,50.56,13.84);
);
out body;
`;

async function fetchOverpass(query) {
  let lastErr;
  for (const server of SERVERS) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: 'application/json',
          'User-Agent': 'EuroBusinessHub-Platform/1.0 (settlement-import)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        lastErr = new Error(`Overpass ${res.status} @ ${server}`);
        continue;
      }
      const json = await res.json();
      if (json.elements?.length) return json;
      lastErr = new Error(`Empty result @ ${server}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('Overpass failed');
}

function slug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/_+/g, '_');
}

let data;
try {
  data = await fetchOverpass(QUERY);
} catch {
  console.error('Area query failed — falling back to Bayern bbox');
  data = await fetchOverpass(BBOX_QUERY);
}

const places = [];

for (const el of data.elements ?? []) {
  if (el.type !== 'node' || !el.tags?.name) continue;
  const name = el.tags.name.trim();
  const place = el.tags.place;
  const pop = el.tags.population ? parseInt(el.tags.population, 10) : null;
  places.push({
    osmId: el.id,
    id: slug(name),
    name,
    lat: el.lat,
    lng: el.lon,
    place,
    population: Number.isFinite(pop) ? pop : null,
    isIn: el.tags['is_in'] ?? el.tags['addr:city'] ?? null,
    wikidata: el.tags.wikidata ?? null,
  });
}

places.sort((a, b) => a.name.localeCompare(b.name, 'de'));
fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), count: places.length, places }, null, 2));
console.error(`Fetched ${places.length} OSM places → ${OUT}`);
console.log(JSON.stringify({ count: places.length, sample: places.slice(0, 5) }, null, 2));
