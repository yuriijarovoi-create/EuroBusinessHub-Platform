/**
 * Validate Schleswig-Holstein settlement imports.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const SH_BBOX = { south: 53.30, west: 7.80, north: 55.10, east: 11.40 };

const VALID_KREISE = new Set([
  'Nordfriesland', 'Schleswig-Flensburg', 'Dithmarschen', 'Rendsburg-Eckernförde',
  'Ostholstein', 'Herzogtum Lauenburg', 'Plön', 'Steinburg', 'Segeberg',
  'Stormarn', 'Pinneberg', 'Flensburg', 'Kiel', 'Lübeck', 'Neumünster', 'Helgoland',
]);

const file = path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts');
if (!fs.existsSync(file)) { console.log(JSON.stringify({ ok: false, error: 'missing file' })); process.exit(1); }

const src = fs.readFileSync(file, 'utf8');
const ids = new Set();
const coords = new Map();
const errors = [];
let entries = 0;
const byLandkreis = {};

for (const block of src.split(/\{\s*\n/).slice(1)) {
  const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
  const latM = block.match(/lat:\s*([\d.-]+)/);
  const lngM = block.match(/lng:\s*([\d.-]+)/);
  const blM = block.match(/bundeslandId:\s*['"]([^'"]+)['"]/);
  const fsM = block.match(/federalState:\s*['"]([^'"]+)['"]/);
  const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
  if (!idM || !latM || !lngM) continue;
  entries++;
  const lat = Number(latM[1]), lng = Number(lngM[1]);
  if (ids.has(idM[1])) errors.push(`duplicate id: ${idM[1]}`);
  ids.add(idM[1]);
  const ck = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (coords.has(ck)) errors.push(`duplicate coord: ${idM[1]} vs ${coords.get(ck)}`);
  coords.set(ck, idM[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) errors.push(`non-finite: ${idM[1]}`);
  if (lat < SH_BBOX.south || lat > SH_BBOX.north || lng < SH_BBOX.west || lng > SH_BBOX.east) {
    errors.push(`bbox: ${idM[1]} (${lat},${lng})`);
  }
  if (blM?.[1] !== 'DE-SH') errors.push(`bundesland: ${idM[1]}`);
  if (fsM?.[1] !== 'Schleswig-Holstein') errors.push(`state: ${idM[1]}`);
  const lk = lkM?.[1] ?? 'missing';
  if (lk !== 'missing' && !VALID_KREISE.has(lk)) errors.push(`unknown kreis: ${idM[1]} → ${lk}`);
  byLandkreis[lk] = (byLandkreis[lk] ?? 0) + 1;
}

console.log(JSON.stringify({
  entries,
  uniqueIds: ids.size,
  uniqueCoords: coords.size,
  landkreisCoverage: Object.keys(byLandkreis).length,
  byLandkreis,
  errors: errors.length,
  errorSample: errors.slice(0, 20),
  ok: errors.length === 0,
}, null, 2));
process.exit(errors.length ? 1 : 0);
