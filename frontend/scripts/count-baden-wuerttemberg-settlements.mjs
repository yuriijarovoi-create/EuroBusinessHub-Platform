/**
 * Count canonical Baden-Württemberg settlement IDs across all seed sources.
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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const BW_HUB_IDS = new Set([
  'stuttgart', 'mannheim', 'karlsruhe', 'freiburg', 'ulm',
  'heidelberg', 'heilbronn', 'pforzheim', 'reutlingen',
]);

const ids = new Map();
const coords = new Set();

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) continue;
  const src = fs.readFileSync(fullPath, 'utf8');
  const blocks = src.split(/\{\s*\n/);
  for (const block of blocks) {
    const isBw =
      /bundeslandId:\s*['"]DE-BW['"]/.test(block) ||
      /federalState:\s*['"]Baden-Württemberg['"]/.test(block);
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    if (!idM) continue;
    if (isBw || (BW_HUB_IDS.has(idM[1]) && f.includes('cities'))) {
      ids.set(idM[1], f);
      if (latM && lngM) coords.add(`${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`);
    }
  }
  for (const m of src.matchAll(/de\(\s*['"]([^'"]+)['"]/g)) {
    if (BW_HUB_IDS.has(m[1])) ids.set(m[1], f);
  }
}

const byFile = {};
for (const [, file] of ids) {
  byFile[file] = (byFile[file] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      canonicalBadenWuerttembergCount: ids.size,
      uniqueCoords: coords.size,
      byFile,
    },
    null,
    2,
  ),
);
