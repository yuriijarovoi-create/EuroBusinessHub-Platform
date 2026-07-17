/**
 * Audit existing Mecklenburg-Vorpommern settlement coverage across seed sources.
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
const details = [];

for (const f of SEED_FILES) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  for (const block of src.split(/\{\s*\n/).slice(1)) {
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.-]+)/);
    const lngM = block.match(/lng:\s*([\d.-]+)/);
    const blM = block.match(/bundeslandId:\s*['"]([^'"]+)['"]/);
    const fsM = block.match(/federalState:\s*['"]([^'"]+)['"]/);
    if (!idM || !latM || !lngM) continue;
    const isMv = blM?.[1] === 'DE-MV'
      || fsM?.[1] === 'Mecklenburg-Vorpommern'
      || MV_MANUAL_IDS.has(idM[1]);
    if (!isMv || ids.has(idM[1])) continue;
    ids.add(idM[1]);
    details.push({
      id: idM[1],
      name: nameM?.[1] ?? idM[1],
      lat: +latM[1],
      lng: +lngM[1],
      file: f,
    });
  }
}

const report = {
  canonicalMvCount: ids.size,
  majorCitiesPresent: [...MV_MANUAL_IDS].filter((id) => ids.has(id)),
  majorCitiesMissing: [...MV_MANUAL_IDS].filter((id) => !ids.has(id)),
  ids: [...ids].sort(),
  details,
};

console.log(JSON.stringify(report, null, 2));
