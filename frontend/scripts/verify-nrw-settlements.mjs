/**
 * Validate Nordrhein-Westfalen settlement imports.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const NRW_BBOX = { south: 50.32, west: 5.87, north: 52.53, east: 9.46 };

const file = path.join(ROOT, 'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts');
if (!fs.existsSync(file)) { console.log(JSON.stringify({ ok: false, error: 'missing file' })); process.exit(1); }

const src = fs.readFileSync(file, 'utf8');
const ids = new Set();
const coords = new Map();
const errors = [];
let entries = 0;

for (const block of src.split(/\{\s*\n/).slice(1)) {
  const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
  const latM = block.match(/lat:\s*([\d.]+)/);
  const lngM = block.match(/lng:\s*([\d.]+)/);
  const blM = block.match(/bundeslandId:\s*['"]([^'"]+)['"]/);
  const fsM = block.match(/federalState:\s*['"]([^'"]+)['"]/);
  if (!idM || !latM || !lngM) continue;
  entries++;
  const lat = Number(latM[1]), lng = Number(lngM[1]);
  if (ids.has(idM[1])) errors.push(`duplicate id: ${idM[1]}`);
  ids.add(idM[1]);
  const ck = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (coords.has(ck)) errors.push(`duplicate coord: ${idM[1]}`);
  coords.set(ck, idM[1]);
  if (lat < NRW_BBOX.south || lat > NRW_BBOX.north || lng < NRW_BBOX.west || lng > NRW_BBOX.east) errors.push(`bbox: ${idM[1]}`);
  if (blM?.[1] !== 'DE-NW') errors.push(`bundesland: ${idM[1]}`);
  if (fsM?.[1] !== 'Nordrhein-Westfalen') errors.push(`state: ${idM[1]}`);
}

console.log(JSON.stringify({ entries, errors: errors.length, errorSample: errors.slice(0, 15), ok: errors.length === 0 }, null, 2));
process.exit(errors.length ? 1 : 0);
