/**
 * Pick geographically balanced NI workspace samples and verify they resolve.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const ni = fs.readFileSync(
  path.join(ROOT, 'features/map/data/germany/germanyNiedersachsenNodes.generated.ts'),
  'utf8',
);

const entries = [];
for (const block of ni.split(/\{\s*\n/).slice(1)) {
  const id = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1];
  const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
  const lk = block.match(/landkreis:\s*['"]([^'"]+)['"]/)?.[1];
  const lat = Number(block.match(/lat:\s*([\d.-]+)/)?.[1]);
  const lng = Number(block.match(/lng:\s*([\d.-]+)/)?.[1]);
  if (id && Number.isFinite(lat)) entries.push({ id, name, lk, lat, lng });
}

const groups = {
  western: entries.filter((e) => ['Emsland', 'Grafschaft Bentheim', 'Osnabrück', 'Cloppenburg', 'Vechta'].includes(e.lk)),
  eastern: entries.filter((e) => ['Gifhorn', 'Helmstedt', 'Wolfenbüttel', 'Lüchow-Dannenberg', 'Uelzen'].includes(e.lk)),
  northern: entries.filter((e) => ['Cuxhaven', 'Stade', 'Aurich', 'Leer', 'Friesland', 'Wesermarsch', 'Ammerland'].includes(e.lk)),
  southern: entries.filter((e) => ['Göttingen', 'Northeim', 'Goslar', 'Holzminden', 'Hameln-Pyrmont'].includes(e.lk)),
  hannover: entries.filter((e) => ['Region Hannover', 'Hildesheim', 'Peine', 'Schaumburg', 'Celle'].includes(e.lk)),
  central: entries.filter((e) => ['Diepholz', 'Nienburg/Weser', 'Verden', 'Heidekreis', 'Rotenburg (Wümme)', 'Oldenburg'].includes(e.lk)),
  extra: entries.filter((e) => ['Osterholz', 'Harburg', 'Lüneburg', 'Braunschweig'].includes(e.lk)),
};

function pick(list, n) {
  const step = Math.max(1, Math.floor(list.length / n));
  const out = [];
  for (let i = 0; i < list.length && out.length < n; i += step) out.push(list[i]);
  return out;
}

const samples = [
  ...pick(groups.western, 4).map((e) => ({ ...e, group: 'western' })),
  ...pick(groups.eastern, 4).map((e) => ({ ...e, group: 'eastern' })),
  ...pick(groups.northern, 4).map((e) => ({ ...e, group: 'northern' })),
  ...pick(groups.southern, 4).map((e) => ({ ...e, group: 'southern' })),
  ...pick(groups.hannover, 4).map((e) => ({ ...e, group: 'hannover' })),
  ...pick(groups.central, 4).map((e) => ({ ...e, group: 'central' })),
  ...pick(groups.extra, 4).map((e) => ({ ...e, group: 'extra' })),
];

// Also verify against all seed IDs
const seedFiles = [
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
const allIds = new Set();
for (const f of seedFiles) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) allIds.add(m[1]);
}

const results = samples.map((s) => ({
  id: s.id,
  name: s.name,
  landkreis: s.lk,
  group: s.group,
  found: allIds.has(s.id),
  workspaceRoute: `/workspace/${s.id}`,
}));

const failed = results.filter((r) => !r.found);
console.log(JSON.stringify({
  checked: results.length,
  failed: failed.length,
  byGroup: Object.fromEntries(
    [...new Set(results.map((r) => r.group))].map((g) => [g, results.filter((r) => r.group === g).length]),
  ),
  results,
}, null, 2));
process.exit(failed.length ? 1 : 0);
