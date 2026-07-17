/**
 * Estimate remaining Schleswig-Holstein candidates after local filters.
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
  'features/map/data/germany/germanyHessenNodes.generated.ts',
  'features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
  'features/map/data/germany/germanyBayernNodes.generated.ts',
  'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts',
  'features/map/data/germany/germanyNiedersachsenNodes.generated.ts',
  'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof|flughafen|industrie|hof\s|gut\s|camping|windpark|strand|düne|leuchtturm|fähre|marina|naturschutz|\()/i;
const MAJOR_EXCLUDE = [
  'kiel', 'luebeck', 'flensburg', 'neumuenster', 'norderstedt', 'elmshorn',
  'pinneberg', 'ahrensburg', 'itzehoe', 'wedel', 'geesthacht', 'rendsburg',
  'husum', 'schleswig', 'bad_oldesloe', 'eckernfoerde', 'heide',
];
const SH_BBOX = [53.35, 8.20, 55.10, 11.40];
const HEL = [54.16, 7.85, 54.20, 7.92];

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}
function inBbox(lat, lng, [s, w, n, e]) {
  return lat >= s && lat <= n && lng >= w && lng <= e;
}
function coordKey(lat, lng) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}
function distKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const ids = new Set();
const coords = [];
for (const f of SEED_FILES) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
  for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.-]+)[\s\S]*?lng:\s*([\d.-]+)/g)) {
    coords.push({ id: m[1], lat: +m[2], lng: +m[3] });
  }
}
for (const id of MAJOR_EXCLUDE) ids.add(id);
const usedCoords = new Set(coords.map((c) => coordKey(c.lat, c.lng)));

const result = JSON.parse(fs.readFileSync(path.join(__dir, 'osm-schleswig-holstein-import-result.json'), 'utf8'));
const importedOsm = new Set((result.imported || []).map((e) => e.osmId));
const cache = JSON.parse(fs.readFileSync(path.join(__dir, 'osm-schleswig-holstein-verification-cache.json'), 'utf8'));
const places = JSON.parse(fs.readFileSync(path.join(__dir, 'osm-schleswig-holstein-places.json'), 'utf8')).places;

const counts = {
  needNominatim: 0,
  cacheHit: 0,
  dupId: 0,
  dupCoord: 0,
  near: 0,
  skipName: 0,
  outside: 0,
  alreadyImported: 0,
};

for (const p of places) {
  if (importedOsm.has(p.osmId)) {
    counts.alreadyImported++;
    continue;
  }
  if (SKIP_NAME.test(p.name)) {
    counts.skipName++;
    continue;
  }
  if (ids.has(p.id) || (ids.has(slug(p.name)) && slug(p.name) !== p.id)) {
    counts.dupId++;
    continue;
  }
  const lat = +Number(p.lat).toFixed(6);
  const lng = +Number(p.lng).toFixed(6);
  const ck = coordKey(lat, lng);
  if (usedCoords.has(ck)) {
    counts.dupCoord++;
    continue;
  }
  if (coords.some((c) => distKm({ lat, lng }, c) < 0.05)) {
    counts.near++;
    continue;
  }
  if (!inBbox(lat, lng, SH_BBOX) && !inBbox(lat, lng, HEL)) {
    counts.outside++;
    continue;
  }
  const key = `node/${p.osmId}@${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (cache.entries?.[key]?.status === 'ok') counts.cacheHit++;
  else counts.needNominatim++;
}

console.log(JSON.stringify({
  ...counts,
  remainingAfterLocalFilters: counts.needNominatim + counts.cacheHit,
  seedIds: ids.size,
  seedCoords: coords.length,
  places: places.length,
}, null, 2));
