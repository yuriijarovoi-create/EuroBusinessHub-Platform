/**
 * Count canonical Mecklenburg-Vorpommern settlement IDs across seed sources.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
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
  'features/map/data/germany/germanyMecklenburgVorpommernNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const MV_MANUAL_IDS = new Set([
  'rostock', 'schwerin', 'neubrandenburg', 'stralsund', 'greifswald', 'wismar', 'guestrow',
]);

const ids = new Set();
for (const f of SEED_FILES) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  const isMvFile = f.includes('germanyMecklenburgVorpommernNodes');
  for (const block of src.split(/\{\s*\n/).slice(1)) {
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (!idM) continue;
    if (isMvFile
      || /bundeslandId:\s*['"]DE-MV['"]/.test(block)
      || /federalState:\s*['"]Mecklenburg-Vorpommern['"]/.test(block)
      || MV_MANUAL_IDS.has(idM[1])) {
      ids.add(idM[1]);
    }
  }
  // de() helper cities (rostock / schwerin) without bundeslandId in block
  for (const id of MV_MANUAL_IDS) {
    if (new RegExp(`de\\(\\s*['"]${id}['"]`).test(src)) ids.add(id);
  }
}

const genPath = path.join(ROOT, 'features/map/data/germany/germanyMecklenburgVorpommernNodes.generated.ts');
const generatedMvCount = fs.existsSync(genPath)
  ? (fs.readFileSync(genPath, 'utf8').match(/id:\s*'/g) || []).length
  : 0;

console.log(JSON.stringify({ canonicalMvCount: ids.size, generatedMvCount }, null, 2));
