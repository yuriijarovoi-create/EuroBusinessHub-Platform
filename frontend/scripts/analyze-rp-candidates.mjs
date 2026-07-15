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

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3 };
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof)/i;

/** Bbox [south, west, north, east] — sorting heuristic only; Nominatim confirms at import */
const LANDKREIS_BBOX = {
  'Cochem-Zell': [49.93, 6.92, 50.38, 7.48],
  'Bernkastel-Wittlich': [49.72, 6.62, 50.12, 7.18],
  'Trier-Saarburg': [49.42, 6.32, 49.88, 6.92],
  'Mayen-Koblenz': [50.12, 7.02, 50.58, 7.58],
  'Vulkaneifel': [49.92, 6.42, 50.08, 7.08],
  'Eifelkreis Bitburg-Prüm': [49.72, 6.12, 50.28, 6.68],
  'Rhein-Hunsrück-Kreis': [49.82, 7.12, 50.22, 7.78],
  'Bad Kreuznach': [49.62, 7.52, 50.08, 8.08],
  'Rhein-Lahn-Kreis': [50.0, 7.68, 50.62, 8.32],
  'Ahrweiler': [50.22, 6.78, 50.62, 7.22],
  'Neuwied': [50.32, 7.32, 50.62, 7.68],
  'Altenkirchen': [50.52, 7.42, 50.95, 8.05],
};

const LANDKREIS_PRIORITY = [
  'Cochem-Zell',
  'Bernkastel-Wittlich',
  'Trier-Saarburg',
  'Mayen-Koblenz',
  'Vulkaneifel',
  'Eifelkreis Bitburg-Prüm',
  'Rhein-Hunsrück-Kreis',
  'Bad Kreuznach',
  'Rhein-Lahn-Kreis',
  'Ahrweiler',
  'Neuwied',
  'Altenkirchen',
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

function districtPriority(lk) {
  const idx = LANDKREIS_PRIORITY.indexOf(lk);
  return idx === -1 ? 99 : idx;
}

function sortPlaces(places) {
  return [...places].sort((a, b) => {
    const da = districtPriority(inferLandkreisSort(a.lat, a.lng));
    const db = districtPriority(inferLandkreisSort(b.lat, b.lng));
    if (da !== db) return da - db;
    const pa = PLACE_PRIORITY[a.place] ?? 9;
    const pb = PLACE_PRIORITY[b.place] ?? 9;
    if (pa !== pb) return pa - pb;
    const popA = a.population ?? 0;
    const popB = b.population ?? 0;
    if (popA !== popB) return popB - popA;
    return a.name.localeCompare(b.name, 'de');
  });
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

const first300 = sorted.slice(0, 300);
const first300ByDistrict = {};
for (const p of first300) {
  const lk = inferLandkreisSort(p.lat, p.lng);
  first300ByDistrict[lk] = (first300ByDistrict[lk] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      existingIds: ids.size,
      osmPlaces: rawPlaces.length,
      availableCandidates: available.length,
      proposedImport: Math.min(300, available.length),
      availableByDistrict: byDistrict,
      proposed300ByDistrict: first300ByDistrict,
      first10: first300.slice(0, 10).map((p) => ({
        name: p.name,
        district: inferLandkreisSort(p.lat, p.lng),
        place: p.place,
      })),
    },
    null,
    2,
  ),
);
