/**
 * Validate Saarland settlement imports: bbox, admin areas, duplicates.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');

const SAARLAND_BBOX = { south: 49.05, west: 6.30, north: 49.70, east: 7.45 };
const VALID_LANDKREISE = new Set([
  'Regionalverband Saarbrücken',
  'Landkreis Saarlouis',
  'Saarpfalz-Kreis',
  'Landkreis Neunkirchen',
  'Landkreis Merzig-Wadern',
  'Landkreis St. Wendel',
]);

const file = path.join(ROOT, 'features/map/data/germany/germanySaarlandNodes.generated.ts');
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
    entry.lat < SAARLAND_BBOX.south ||
    entry.lat > SAARLAND_BBOX.north ||
    entry.lng < SAARLAND_BBOX.west ||
    entry.lng > SAARLAND_BBOX.east
  ) {
    errors.push(`outside Saarland bbox: ${entry.id} (${entry.lat}, ${entry.lng})`);
  }
  if (entry.bundeslandId !== 'DE-SL') errors.push(`wrong bundeslandId: ${entry.id}`);
  if (entry.federalState !== 'Saarland') errors.push(`wrong federalState: ${entry.id}`);
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
