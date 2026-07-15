/**
 * Pre-import analysis: count available RP candidates by priority district.
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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '300', 10);

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3 };
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof)/i;

/** Bbox [south, west, north, east] — sorting heuristic only; Nominatim confirms at import */
const LANDKREIS_BBOX = {
  'Altenkirchen': [50.52, 7.42, 50.95, 8.05],
  'Eifelkreis Bitburg-Prüm': [49.72, 6.12, 50.28, 6.68],
  'Rhein-Lahn-Kreis': [50.0, 7.68, 50.62, 8.32],
  'Bad Kreuznach': [49.62, 7.52, 50.08, 8.08],
  'Rhein-Hunsrück-Kreis': [49.82, 7.12, 50.22, 7.78],
  'Mayen-Koblenz': [50.12, 7.02, 50.58, 7.58],
  'Neuwied': [50.32, 7.32, 50.62, 7.68],
  'Ahrweiler': [50.22, 6.78, 50.62, 7.22],
  'Vulkaneifel': [49.92, 6.42, 50.08, 7.08],
  'Trier-Saarburg': [49.42, 6.32, 49.88, 6.92],
  'Bernkastel-Wittlich': [49.72, 6.62, 50.12, 7.18],
  'Cochem-Zell': [49.93, 6.92, 50.38, 7.48],
  'Westerwaldkreis': [50.35, 7.55, 50.75, 8.35],
  'Kusel': [49.35, 7.25, 49.75, 7.85],
  'Donnersbergkreis': [49.55, 7.65, 49.95, 8.25],
  'Südwestpfalz': [49.05, 7.05, 49.45, 7.65],
  'Kaiserslautern': [49.25, 7.45, 49.65, 8.05],
  'Südliche Weinstraße': [49.05, 7.85, 49.55, 8.45],
  'Germersheim': [49.15, 8.05, 49.45, 8.55],
  'Rhein-Pfalz-Kreis': [49.35, 8.15, 49.62, 8.55],
  'Bad Dürkheim': [49.35, 7.95, 49.65, 8.35],
  'Birkenfeld': [49.55, 7.05, 50.05, 7.55],
  'Mainz-Bingen': [49.75, 7.75, 50.05, 8.35],
};

const LANDKREIS_PRIORITY = [
  'Altenkirchen',
  'Eifelkreis Bitburg-Prüm',
  'Rhein-Lahn-Kreis',
  'Rhein-Hunsrück-Kreis',
  'Bad Kreuznach',
  'Westerwaldkreis',
  'Neuwied',
  'Ahrweiler',
  'Mayen-Koblenz',
  'Südwestpfalz',
  'Kusel',
  'Donnersbergkreis',
  'Kaiserslautern',
  'Südliche Weinstraße',
  'Germersheim',
  'Rhein-Pfalz-Kreis',
  'Bad Dürkheim',
  'Mainz-Bingen',
  'Birkenfeld',
  'Vulkaneifel',
  'Trier-Saarburg',
  'Bernkastel-Wittlich',
  'Cochem-Zell',
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
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
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

function sortPlaces(places) {
  return buildDistributedQueue(places);
}

const { ids, coords } = loadExisting();
const { places: rawPlaces } = JSON.parse(fs.readFileSync(path.join(__dir, 'osm-rp-places.json'), 'utf8'));

const available = rawPlaces.filter((p) => {
  if (SKIP_NAME.test(p.name)) return false;
  if (ids.has(p.id)) return false;
  const lat = +p.lat;
  const lng = +p.lng;
  for (const c of coords) {
    if (distKm({ lat, lng }, c) < 0.05) return false;
  }
  return true;
});

const sorted = sortPlaces(available);
const byDistrict = {};
for (const p of sorted) {
  const lk = inferLandkreisSort(p.lat, p.lng);
  byDistrict[lk] = (byDistrict[lk] ?? 0) + 1;
}

const firstBatch = sorted.slice(0, LIMIT);
const firstBatchByDistrict = {};
for (const p of firstBatch) {
  const lk = inferLandkreisSort(p.lat, p.lng);
  firstBatchByDistrict[lk] = (firstBatchByDistrict[lk] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      existingIds: ids.size,
      osmPlaces: rawPlaces.length,
      availableCandidates: available.length,
      proposedImport: Math.min(LIMIT, available.length),
      availableByDistrict: byDistrict,
      proposedBatchByDistrict: firstBatchByDistrict,
      first10: firstBatch.slice(0, 10).map((p) => ({
        name: p.name,
        district: inferLandkreisSort(p.lat, p.lng),
        place: p.place,
      })),
    },
    null,
    2,
  ),
);
