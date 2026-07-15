/**
 * Fetch all place=* settlements in Niedersachsen from OpenStreetMap (Overpass API).
 * Output: scripts/osm-niedersachsen-places.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'osm-niedersachsen-places.json');
const SERVERS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

// Approximate Niedersachsen bounding box (fallback only)
const NI_BBOX = '51.30,6.65,53.90,11.60';

const QUERY = `
[out:json][timeout:300];
area["name"="Niedersachsen"]["boundary"="administrative"]["admin_level"="4"]->.ni;
(
  node["place"="city"]["name"](area.ni);
  node["place"="town"]["name"](area.ni);
  node["place"="village"]["name"](area.ni);
  node["place"="hamlet"]["name"](area.ni);
);
out body;
`;

const BBOX_QUERY = `
[out:json][timeout:300];
(
  node["place"="city"]["name"](${NI_BBOX});
  node["place"="town"]["name"](${NI_BBOX});
  node["place"="village"]["name"](${NI_BBOX});
  node["place"="hamlet"]["name"](${NI_BBOX});
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
          'User-Agent': 'EuroBusinessHub-Platform/1.0 (settlement-import)',
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
  console.error('Area query failed — falling back to NI bbox:', e.message);
  data = await fetchOverpass(BBOX_QUERY);
}

const places = [];
for (const el of data.elements ?? []) {
  if (el.type !== 'node' || !el.tags?.name) continue;
  const pop = el.tags.population ? parseInt(el.tags.population, 10) : null;
  places.push({
    osmId: el.id,
    id: slug(el.tags.name.trim()),
    name: el.tags.name.trim(),
    lat: el.lat,
    lng: el.lon,
    place: el.tags.place,
    population: Number.isFinite(pop) ? pop : null,
  });
}
places.sort((a, b) => a.name.localeCompare(b.name, 'de'));
fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), count: places.length, places }, null, 2));
console.error(`Fetched ${places.length} OSM places → ${OUT}`);
console.log(JSON.stringify({ count: places.length, sample: places.slice(0, 5) }, null, 2));
