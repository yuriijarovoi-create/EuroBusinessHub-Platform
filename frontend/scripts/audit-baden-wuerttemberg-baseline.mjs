/**
 * Audit existing Baden-Württemberg settlement coverage across all Germany seed sources.
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

const BW_MANUAL_IDS = new Set([
  'stuttgart',
  'mannheim',
  'karlsruhe',
  'freiburg',
  'ulm',
  'heidelberg',
  'heilbronn',
  'pforzheim',
  'reutlingen',
  'tuebingen',
  'konstanz',
  'villingen_schwenningen',
  'ravensburg',
  'aalen',
  'sindelfingen',
  'esslingen',
  'ludwigsburg',
  'baden_baden',
  'offenburg',
  'boeblingen',
  'waiblingen',
  'leonberg',
  'goeppingen',
  'schwaebisch_gmuend',
  'heidenheim',
  'loerrach',
  'friedrichshafen',
  'biberach',
  'sigmaringen',
  'calw',
  'rottweil',
  'tuttlingen',
  'emmen',
  'crailsheim',
  'bruchsal',
  'weinheim',
  'schwetzingen',
  'lahr',
  'kehl',
  'ehingen',
  'metzingen',
  'nagold',
  'balingen',
  'mosbach',
  'ebersbach',
  'geislingen',
  'backnang',
  'bietigheim_bissingen',
  'filderstadt',
  'ostfildern',
  'kirchheim_unter_teck',
  'nurtingen',
  'fellbach',
  'kornwestheim',
  'remseck',
  'ostfildern',
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
const aliases = new Set();
const bySource = {};
const manualBw = [];
const generatedBw = [];

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) continue;
  const src = fs.readFileSync(fullPath, 'utf8');
  bySource[f] = 0;
  const blocks = src.split(/\{\s*\n/);
  for (const block of blocks) {
    const isBw =
      /bundeslandId:\s*['"]DE-BW['"]/.test(block) ||
      /federalState:\s*['"]Baden-Württemberg['"]/.test(block) ||
      (f.includes('germanyBadenWuerttemberg') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    if (!idM) continue;

    if (isBw) {
      ids.add(idM[1]);
      bySource[f]++;
      if (nameM) {
        names.add(nameM[1].toLowerCase());
        slugs.add(slug(nameM[1]));
        aliases.add(nameM[1]);
      }
      if (latM && lngM) coords.add(`${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`);
      if (f.includes('germanyBadenWuerttemberg')) generatedBw.push(idM[1]);
      else if (BW_MANUAL_IDS.has(idM[1])) manualBw.push(idM[1]);
    }

    if (BW_MANUAL_IDS.has(idM[1]) && !isBw) {
      manualBw.push(idM[1]);
      ids.add(idM[1]);
      if (nameM) {
        names.add(nameM[1].toLowerCase());
        slugs.add(slug(nameM[1]));
      }
      if (latM && lngM) coords.add(`${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`);
    }
  }
  for (const m of src.matchAll(/de\(\s*['"]([^'"]+)['"]/g)) {
    if (BW_MANUAL_IDS.has(m[1])) ids.add(m[1]);
  }
}

console.log(
  JSON.stringify(
    {
      baselineCanonicalCount: ids.size,
      manualTierIds: [...new Set(manualBw)].sort(),
      generatedBwIds: generatedBw.length,
      uniqueIds: ids.size,
      uniqueSlugs: slugs.size,
      uniqueNames: names.size,
      uniqueCoords: coords.size,
      bySource,
      exclusionSets: {
        idCount: ids.size,
        slugCount: slugs.size,
        nameCount: names.size,
        coordCount: coords.size,
      },
    },
    null,
    2,
  ),
);
