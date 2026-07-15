/**
 * Audit existing Nordrhein-Westfalen settlement coverage across all Germany seed sources.
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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const NRW_MANUAL_IDS = new Set([
  'cologne', 'duesseldorf', 'dortmund', 'essen', 'bonn', 'aachen', 'duisburg', 'bielefeld',
  'bochum', 'wuppertal', 'muenster', 'gelsenkirchen', 'moenchengladbach', 'krefeld',
  'oberhausen', 'hagen', 'leverkusen', 'osnabrueck', 'solingen', 'paderborn', 'bottrop',
  'recklinghausen', 'bergisch_gladbach', 'remscheid', 'moers', 'siegen', 'guetersloh',
  'iserlohn', 'herne', 'neuss', 'witten', 'marl', 'luedenscheid', 'unna', 'hamm',
  'muelheim', 'herford', 'detmold', 'ratingen', 'velbert', 'viersen', 'minden',
  'troisdorf', 'dorsten', 'castrop_rauxel', 'lippstadt', 'dinslaken', 'arnsberg',
  'luenen', 'wesel', 'kleve', 'emmerich', 'goch', 'geldern', 'grevenbroich', 'pulheim',
  'bergheim', 'huerth', 'euskirchen', 'siegburg', 'troisdorf', 'bergkamen', 'herten',
]);

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

const ids = new Set();
const bySource = {};

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) { bySource[f] = 0; continue; }
  const src = fs.readFileSync(fullPath, 'utf8');
  bySource[f] = 0;
  for (const block of src.split(/\{\s*\n/)) {
    const isNrw =
      /bundeslandId:\s*['"]DE-NW['"]/.test(block) ||
      /federalState:\s*['"]Nordrhein-Westfalen['"]/.test(block) ||
      (f.includes('germanyNordrheinWestfalen') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (!idM) continue;
    if (isNrw) { ids.add(idM[1]); bySource[f]++; }
    if (NRW_MANUAL_IDS.has(idM[1])) ids.add(idM[1]);
  }
  for (const m of src.matchAll(/de\(\s*['"]([^'"]+)['"]/g)) {
    if (NRW_MANUAL_IDS.has(m[1])) ids.add(m[1]);
  }
}

console.log(JSON.stringify({ baselineCanonicalCount: ids.size, bySource }, null, 2));
