/**
 * Audit existing Bayern settlement coverage across all Germany seed sources.
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

const BY_MANUAL_IDS = new Set([
  'munich',
  'nuremberg',
  'augsburg',
  'regensburg',
  'ingolstadt',
  'wuerzburg',
  'fuerth',
  'erlangen',
  'bamberg',
  'bayreuth',
  'landshut',
  'passau',
  'rosenheim',
  'schweinfurt',
  'aschaffenburg',
  'kempten',
  'coburg',
  'ansbach',
  'memmingen',
  'straubing',
  'deggendorf',
  'amberg',
  'weiden',
  'freising',
  'erding',
  'garmisch_partenkirchen',
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
const bySource = {};
const manualBy = [];
const generatedBy = [];
const byRegierungsbezirkHint = {};

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) {
    bySource[f] = 0;
    continue;
  }
  const src = fs.readFileSync(fullPath, 'utf8');
  bySource[f] = 0;
  const blocks = src.split(/\{\s*\n/);
  for (const block of blocks) {
    const isBy =
      /bundeslandId:\s*['"]DE-BY['"]/.test(block) ||
      /federalState:\s*['"]Bayern['"]/.test(block) ||
      (f.includes('germanyBayern') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    const regionM = block.match(/region:\s*['"]([^'"]+)['"]/);
    if (!idM) continue;

    if (isBy) {
      ids.add(idM[1]);
      bySource[f]++;
      if (nameM) {
        names.add(nameM[1].toLowerCase());
        slugs.add(slug(nameM[1]));
      }
      if (latM && lngM) coords.add(`${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`);
      if (f.includes('germanyBayern')) generatedBy.push(idM[1]);
      else if (BY_MANUAL_IDS.has(idM[1])) manualBy.push(idM[1]);
      if (regionM) {
        const r = regionM[1];
        byRegierungsbezirkHint[r] = (byRegierungsbezirkHint[r] ?? 0) + 1;
      }
    }

    if (BY_MANUAL_IDS.has(idM[1]) && !isBy) {
      manualBy.push(idM[1]);
      ids.add(idM[1]);
      if (nameM) {
        names.add(nameM[1].toLowerCase());
        slugs.add(slug(nameM[1]));
      }
      if (latM && lngM) coords.add(`${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`);
    }
  }
  for (const m of src.matchAll(/de\(\s*['"]([^'"]+)['"]/g)) {
    if (BY_MANUAL_IDS.has(m[1])) ids.add(m[1]);
  }
}

console.log(
  JSON.stringify(
    {
      baselineCanonicalCount: ids.size,
      manualTierIds: [...new Set(manualBy)].sort(),
      generatedByIds: generatedBy.length,
      uniqueIds: ids.size,
      uniqueSlugs: slugs.size,
      uniqueNames: names.size,
      uniqueCoords: coords.size,
      bySource,
      byRegionHint: byRegierungsbezirkHint,
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
