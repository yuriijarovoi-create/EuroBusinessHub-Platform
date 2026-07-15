/**
 * Count canonical Saarland settlements across all seed sources.
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

const SAARLAND_MANUAL_IDS = new Set([
  'saarbruecken',
  'neunkirchen',
  'homburg',
  'voelklingen',
  'saarlouis',
  'sankt_ingbert',
  'merzig',
  'st_wendel',
  'dillingen_saar',
  'lebach',
  'ottweiler',
  'blieskastel',
]);

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

const ids = new Set();
const slugs = new Set();
const names = new Set();
const coords = new Set();
let slNodeFileCount = 0;

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) continue;
  const src = fs.readFileSync(fullPath, 'utf8');
  const blocks = src.split(/\{\s*\n/);
  for (const block of blocks) {
    const isSl =
      /bundeslandId:\s*'DE-SL'/.test(block) ||
      /federalState:\s*'Saarland'/.test(block) ||
      (f.includes('germanySaarland') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    if (!idM) continue;
    if (!isSl && !SAARLAND_MANUAL_IDS.has(idM[1])) continue;
    ids.add(idM[1]);
    if (nameM) {
      names.add(nameM[1].toLowerCase());
      slugs.add(slug(nameM[1]));
    }
    if (latM && lngM) coords.add(`${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`);
    if (f.includes('germanySaarland')) slNodeFileCount++;
  }
}

console.log(
  JSON.stringify(
    {
      slNodeFileEntries: slNodeFileCount,
      uniqueSlIds: ids.size,
      uniqueNames: names.size,
      uniqueSlugs: slugs.size,
      uniqueCoords: coords.size,
    },
    null,
    2,
  ),
);
