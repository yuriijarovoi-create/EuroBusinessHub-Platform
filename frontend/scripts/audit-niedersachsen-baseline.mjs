/**
 * Audit existing Niedersachsen settlement coverage across all Germany seed sources.
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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const NI_MANUAL_IDS = new Set([
  'hanover', 'hannover', 'braunschweig', 'oldenburg', 'osnabrueck', 'wolfsburg',
  'goettingen', 'hildesheim', 'salzgitter', 'wilhelmshaven', 'celle', 'lueneburg',
  'emden', 'delmenhorst', 'nienburg', 'stade', 'peine', 'gifhorn', 'cuxhaven',
  'leer', 'aurich', 'vechta', 'cloppenburg', 'lingen', 'nordhorn', 'papenburg',
  'meppen', 'hameln', 'goslar', 'northeim', 'uelzen', 'verden', 'wolfenbuettel',
  'helmstedt', 'holzminden', 'luechow', 'bremervoerde', 'rottenburg_wuemme',
  'buchholz_nordheide', 'winsen_luhe', 'seesen', 'einbeck', 'osterode',
]);

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

const ids = new Set();
const bySource = {};
const names = [];
const coords = [];

for (const f of SEED_FILES) {
  const fullPath = path.join(ROOT, f);
  if (!fs.existsSync(fullPath)) { bySource[f] = 0; continue; }
  const src = fs.readFileSync(fullPath, 'utf8');
  bySource[f] = 0;
  for (const block of src.split(/\{\s*\n/)) {
    const isNi =
      /bundeslandId:\s*['"]DE-NI['"]/.test(block) ||
      /federalState:\s*['"]Niedersachsen['"]/.test(block) ||
      (f.includes('germanyNiedersachsen') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    if (!idM) continue;
    if (isNi) {
      ids.add(idM[1]);
      bySource[f]++;
      if (nameM) names.push({ id: idM[1], name: nameM[1], source: f });
      if (latM && lngM) coords.push({ id: idM[1], lat: +latM[1], lng: +lngM[1] });
    }
    if (NI_MANUAL_IDS.has(idM[1])) {
      ids.add(idM[1]);
      if (nameM) names.push({ id: idM[1], name: nameM[1], source: f });
    }
  }
  for (const m of src.matchAll(/de\(\s*['"]([^'"]+)['"]/g)) {
    if (NI_MANUAL_IDS.has(m[1])) ids.add(m[1]);
  }
}

const uniqueNames = [...new Set(names.map((n) => n.name))].sort((a, b) => a.localeCompare(b, 'de'));

console.log(JSON.stringify({
  baselineCanonicalCount: ids.size,
  bySource,
  uniqueNamesCount: uniqueNames.length,
  sampleIds: [...ids].sort().slice(0, 50),
  sampleNames: uniqueNames.slice(0, 40),
  majorCitiesPresent: [...NI_MANUAL_IDS].filter((id) => ids.has(id) || ids.has(slug(id))),
}, null, 2));
