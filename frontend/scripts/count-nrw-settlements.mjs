/**
 * Count canonical Nordrhein-Westfalen settlement IDs across all seed sources.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const SEED_FILES = [
  'data/cities.ts', 'features/map/data/germany/germanyCitiesDense.ts', 'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts', 'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts', 'features/map/data/germany/germanySaarlandNodes.generated.ts',
  'features/map/data/germany/germanyHessenNodes.generated.ts', 'features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
  'features/map/data/germany/germanyBayernNodes.generated.ts', 'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const ids = new Set();
let generated = 0;
for (const f of SEED_FILES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  for (const block of src.split(/\{\s*\n/)) {
    const isNrw = /bundeslandId:\s*['"]DE-NW['"]/.test(block) || /federalState:\s*['"]Nordrhein-Westfalen['"]/.test(block)
      || (f.includes('germanyNordrheinWestfalen') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (idM && isNrw) { ids.add(idM[1]); if (f.includes('germanyNordrheinWestfalen')) generated++; }
  }
}
console.log(JSON.stringify({ canonicalNrwCount: ids.size, generatedNrwCount: generated }, null, 2));
