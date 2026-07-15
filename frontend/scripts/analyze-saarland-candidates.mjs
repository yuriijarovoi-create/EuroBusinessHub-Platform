/**
 * Pre-import analysis: count available Saarland candidates by administrative area.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');

const SEED_FILES = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'features/map/data/germany/germanySaarlandNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '700', 10);

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3 };
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof)/i;

const LANDKREIS_BBOX = {
  'Regionalverband Saarbrücken': [49.08, 6.85, 49.35, 7.25],
  'Landkreis Saarlouis': [49.25, 6.55, 49.55, 7.05],
  'Saarpfalz-Kreis': [49.15, 7.05, 49.45, 7.45],
  'Landkreis Neunkirchen': [49.25, 6.95, 49.50, 7.35],
  'Landkreis Merzig-Wadern': [49.35, 6.35, 49.65, 6.95],
  'Landkreis St. Wendel': [49.40, 7.00, 49.65, 7.40],
};

const LANDKREIS_PRIORITY = [
  'Regionalverband Saarbrücken',
  'Landkreis Saarlouis',
  'Saarpfalz-Kreis',
  'Landkreis Neunkirchen',
  'Landkreis Merzig-Wadern',
  'Landkreis St. Wendel',
];

function distKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function loadExisting() {
  const ids = new Set();
  const coords = [];
  for (const f of SEED_FILES) {
    const fullPath = path.join(ROOT, f);
    if (!fs.existsSync(fullPath)) continue;
    const src = fs.readFileSync(fullPath, 'utf8');
    for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
    for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.]+)[\s\S]*?lng:\s*([\d.]+)/g)) {
      coords.push({ id: m[1], lat: +m[2], lng: +m[3] });
    }
  }
  return { ids, coords };
}

function inferLandkreisSort(lat, lng) {
  const hits = [];
  for (const [lk, [s, w, n, e]] of Object.entries(LANDKREIS_BBOX)) {
    if (lat >= s && lat <= n && lng >= w && lng <= e) hits.push(lk);
  }
  if (hits.length === 0) return 'other';
  for (const p of LANDKREIS_PRIORITY) {
    if (hits.includes(p)) return p;
  }
  return hits[0];
}

function sortPlacesList(list) {
  return [...list].sort((a, b) => {
    const pa = PLACE_PRIORITY[a.place] ?? 9;
    const pb = PLACE_PRIORITY[b.place] ?? 9;
    if (pa !== pb) return pa - pb;
    const popA = a.population ?? 0;
    const popB = b.population ?? 0;
    if (popA !== popB) return popB - popA;
    return a.name.localeCompare(b.name, 'de');
  });
}

function buildDistributedQueue(rawPlaces) {
  const byDistrict = new Map();
  for (const p of rawPlaces) {
    const lk = inferLandkreisSort(p.lat, p.lng);
    if (!byDistrict.has(lk)) byDistrict.set(lk, []);
    byDistrict.get(lk).push(p);
  }
  for (const [lk, list] of byDistrict) {
    byDistrict.set(lk, sortPlacesList(list));
  }

  const districtOrder = [...LANDKREIS_PRIORITY, 'other'];
  const maxRound = Math.max(...[...byDistrict.values()].map((l) => l.length), 0);
  const queue = [];
  for (let round = 0; round < maxRound; round += 1) {
    for (const lk of districtOrder) {
      const list = byDistrict.get(lk);
      if (!list || round >= list.length) continue;
      queue.push(list[round]);
    }
  }
  return queue;
}

function coordKey(lat, lng) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function isNearExisting(lat, lng, coords, thresholdKm = 0.05) {
  for (const c of coords) {
    if (distKm({ lat, lng }, c) < thresholdKm) return c.id;
  }
  return null;
}

const osmPath = path.join(__dir, 'osm-saarland-places.json');
if (!fs.existsSync(osmPath)) {
  console.error('Run fetch-osm-saarland-overpass.mjs first');
  process.exit(1);
}

const { places: rawPlaces } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
const queue = buildDistributedQueue(rawPlaces);
const { ids, coords } = loadExisting();
const usedCoords = new Set(coords.map((c) => coordKey(c.lat, c.lng)));

let available = 0;
let skippedDuplicateId = 0;
let skippedNear = 0;
let skippedUnsupported = 0;
const byDistrict = {};

for (const p of queue) {
  if (available >= LIMIT) break;
  if (SKIP_NAME.test(p.name)) {
    skippedUnsupported++;
    continue;
  }
  if (ids.has(p.id)) {
    skippedDuplicateId++;
    continue;
  }
  const lat = +Number(p.lat).toFixed(6);
  const lng = +Number(p.lng).toFixed(6);
  if (usedCoords.has(coordKey(lat, lng))) continue;
  if (isNearExisting(lat, lng, coords)) {
    skippedNear++;
    continue;
  }
  available++;
  const lk = inferLandkreisSort(lat, lng);
  byDistrict[lk] = (byDistrict[lk] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      totalSourceCandidates: rawPlaces.length,
      verifiedCandidatesAfterDedup: available,
      selectedImportCount: Math.min(available, LIMIT),
      skippedDuplicateId,
      skippedNear,
      skippedUnsupported,
      byDistrict,
      placeTypeBreakdown: rawPlaces.reduce((acc, p) => {
        acc[p.place] = (acc[p.place] ?? 0) + 1;
        return acc;
      }, {}),
    },
    null,
    2,
  ),
);
