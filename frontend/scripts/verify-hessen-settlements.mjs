/**
 * Validate Hessen settlement imports: bbox, admin areas, duplicates.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');

const HESSEN_BBOX = { south: 49.39, west: 7.77, north: 51.66, east: 10.24 };
const VALID_LANDKREISE = new Set([
  'Lahn-Dill-Kreis',
  'Marburg-Biedenkopf',
  'Waldeck-Frankenberg',
  'Schwalm-Eder-Kreis',
  'Vogelsbergkreis',
  'Fulda',
  'Werra-Meißner-Kreis',
  'Hersfeld-Rotenburg',
  'Main-Kinzig-Kreis',
  'Limburg-Weilburg',
  'Wetteraukreis',
  'Gießen',
  'Bergstraße',
  'Darmstadt-Dieburg',
  'Rheingau-Taunus-Kreis',
  'Odenwaldkreis',
  'Groß-Gerau',
  'Hochtaunuskreis',
  'Main-Taunus-Kreis',
  'Offenbach',
  'Kassel',
  'Landkreis Kassel',
  'Frankfurt am Main',
  'Wiesbaden',
  'Darmstadt',
  'Offenbach am Main',
]);

const file = path.join(ROOT, 'features/map/data/germany/germanyHessenNodes.generated.ts');
const src = fs.readFileSync(file, 'utf8');
const blocks = src.split(/\{\s*\n/).slice(1);

const entries = [];
const ids = new Set();
const coords = new Map();
const errors = [];

for (const block of blocks) {
  const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
  const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
  const latM = block.match(/lat:\s*([\d.]+)/);
  const lngM = block.match(/lng:\s*([\d.]+)/);
  const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
  const blM = block.match(/bundeslandId:\s*['"]([^'"]+)['"]/);
  const fsM = block.match(/federalState:\s*['"]([^'"]+)['"]/);
  if (!idM || !latM || !lngM) continue;

  const entry = {
    id: idM[1],
    name: nameM?.[1] ?? idM[1],
    lat: Number(latM[1]),
    lng: Number(lngM[1]),
    landkreis: lkM?.[1] ?? null,
    bundeslandId: blM?.[1],
    federalState: fsM?.[1],
  };
  entries.push(entry);

  if (ids.has(entry.id)) errors.push(`duplicate id: ${entry.id}`);
  ids.add(entry.id);

  const ck = `${entry.lat.toFixed(5)},${entry.lng.toFixed(5)}`;
  if (coords.has(ck)) errors.push(`duplicate coord: ${entry.id} vs ${coords.get(ck)}`);
  coords.set(ck, entry.id);

  if (!Number.isFinite(entry.lat) || !Number.isFinite(entry.lng)) {
    errors.push(`non-finite coord: ${entry.id}`);
  }
  if (
    entry.lat < HESSEN_BBOX.south ||
    entry.lat > HESSEN_BBOX.north ||
    entry.lng < HESSEN_BBOX.west ||
    entry.lng > HESSEN_BBOX.east
  ) {
    errors.push(`outside Hessen bbox: ${entry.id} (${entry.lat}, ${entry.lng})`);
  }
  if (entry.bundeslandId !== 'DE-HE') errors.push(`wrong bundeslandId: ${entry.id}`);
  if (entry.federalState !== 'Hessen') errors.push(`wrong federalState: ${entry.id}`);
  if (entry.landkreis && !VALID_LANDKREISE.has(entry.landkreis)) {
    errors.push(`invalid landkreis: ${entry.id} → ${entry.landkreis}`);
  }
}

const byAdmin = {};
for (const e of entries) {
  const key = e.landkreis ?? 'unknown';
  byAdmin[key] = (byAdmin[key] ?? 0) + 1;
}

const result = {
  count: entries.length,
  duplicateIds: errors.filter((e) => e.startsWith('duplicate id')).length,
  duplicateCoords: errors.filter((e) => e.startsWith('duplicate coord')).length,
  bboxViolations: errors.filter((e) => e.startsWith('outside')).length,
  adminViolations: errors.filter((e) => e.startsWith('invalid landkreis')).length,
  byAdmin,
  errors: errors.slice(0, 20),
  pass: errors.length === 0,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.pass ? 0 : 1);
