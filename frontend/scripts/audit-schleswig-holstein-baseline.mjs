/**
 * Audit existing Schleswig-Holstein settlement coverage across all Germany seed sources.
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
    const isSh =
      /bundeslandId:\s*['"]DE-SH['"]/.test(block) ||
      /federalState:\s*['"]Schleswig-Holstein['"]/.test(block) ||
      (f.includes('germanySchleswigHolstein') && /id:\s*['"]/.test(block));
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.-]+)/);
    const lngM = block.match(/lng:\s*([\d.-]+)/);
    if (!idM) continue;
    if (isSh) {
      ids.add(idM[1]);
      bySource[f]++;
      if (nameM) names.push({ id: idM[1], name: nameM[1], source: f });
      if (latM && lngM) coords.push({ id: idM[1], lat: +latM[1], lng: +lngM[1] });
    }
    if (SH_MANUAL_IDS.has(idM[1])) {
      ids.add(idM[1]);
      if (nameM) names.push({ id: idM[1], name: nameM[1], source: f });
    }
  }
  for (const m of src.matchAll(/de\(\s*['"]([^'"]+)['"]/g)) {
    if (SH_MANUAL_IDS.has(m[1])) ids.add(m[1]);
  }
}

const uniqueNames = [...new Set(names.map((n) => n.name))].sort((a, b) => a.localeCompare(b, 'de'));

console.log(JSON.stringify({
  baselineCanonicalCount: ids.size,
  bySource,
  uniqueNamesCount: uniqueNames.length,
  sampleIds: [...ids].sort().slice(0, 50),
  sampleNames: uniqueNames.slice(0, 40),
  majorCitiesPresent: [...SH_MANUAL_IDS].filter((id) => ids.has(id) || ids.has(slug(id))),
  majorCitiesMissing: [...SH_MANUAL_IDS].filter((id) => !ids.has(id) && !ids.has(slug(id))),
}, null, 2));
