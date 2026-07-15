/**
 * Count canonical Bayern settlement IDs across all seed sources.
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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const byIds = new Set();
const generatedBy = [];

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) continue;
  const src = fs.readFileSync(fullPath, 'utf8');
  const blocks = src.split(/\{\s*\n/);
  for (const block of blocks) {
    const isBy =
      /bundeslandId:\s*['"]DE-BY['"]/.test(block) ||
      /federalState:\s*['"]Bayern['"]/.test(block) ||
      (f.includes('germanyBayern') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (!idM || !isBy) continue;
    byIds.add(idM[1]);
    if (f.includes('germanyBayern')) generatedBy.push(idM[1]);
  }
}

console.log(
  JSON.stringify(
    {
      canonicalBayernCount: byIds.size,
      generatedBayernCount: generatedBy.length,
    },
    null,
    2,
  ),
);
