/**
 * Count canonical Schleswig-Holstein settlement IDs across all seed sources.
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

const SH_MANUAL_IDS = new Set([
  'kiel', 'luebeck', 'flensburg', 'neumuenster', 'norderstedt', 'elmshorn',
  'pinneberg', 'ahrensburg', 'itzehoe', 'wedel', 'geesthacht', 'rendsburg',
  'husum', 'schleswig', 'bad_oldesloe', 'eckernfoerde', 'heide',
]);

const ids = new Set();
let generated = 0;
for (const f of SEED_FILES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  for (const block of src.split(/\{\s*\n/)) {
    const isSh = /bundeslandId:\s*['"]DE-SH['"]/.test(block)
      || /federalState:\s*['"]Schleswig-Holstein['"]/.test(block)
      || (f.includes('germanySchleswigHolstein') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (idM && isSh) {
      ids.add(idM[1]);
      if (f.includes('germanySchleswigHolstein')) generated++;
    }
    if (idM && SH_MANUAL_IDS.has(idM[1])) ids.add(idM[1]);
  }
}
console.log(JSON.stringify({ canonicalShCount: ids.size, generatedShCount: generated }, null, 2));
