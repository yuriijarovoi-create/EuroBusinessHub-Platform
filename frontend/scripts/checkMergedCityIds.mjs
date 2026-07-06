import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function extractIds(file, patterns) {
  const src = fs.readFileSync(path.join(base, file), 'utf8');
  const ids = [];
  for (const p of patterns) {
    for (const m of src.matchAll(p)) ids.push(m[1]);
  }
  return ids;
}

const sources = {
  core: extractIds('data/cities.ts', [/id: '([a-z0-9_]+)'/g]),
  europeExtra: extractIds('data/europeBusinessCitiesExtra.ts', [/id: '([a-z0-9_]+)'/g]),
  germanyExtra: extractIds('features/map/data/germany/germanyCitiesExtra.ts', [/de\(\s*['"]([a-z0-9_]+)/g]),
  germanyDense: extractIds('features/map/data/germany/germanyCitiesDense.ts', [/de\(\s*['"]([a-z0-9_]+)/g]),
  localSeeds: extractIds('features/map/data/germany/germanyLocalNodes.generated.ts', [
    /export const GERMANY_LOCAL_NODE_DEFS[\s\S]*?(?=export const GERMANY_LOCAL_NODE_ENRICH)/g,
  ]).flatMap(() => []),
  regional: extractIds('features/map/data/germany/germanyRegionalClusters.generated.ts', [/id: "([a-z0-9_]+)"/g]),
};

// Parse local + rural seed defs only
function seedIdsFromConst(file, constName) {
  const src = fs.readFileSync(path.join(base, file), 'utf8');
  const start = src.indexOf(`export const ${constName}`);
  const next = src.indexOf('export const ', start + 10);
  const chunk = next > start ? src.slice(start, next) : src.slice(start);
  return [...chunk.matchAll(/id: "([a-z0-9_]+)"/g)].map((m) => m[1]);
}

sources.localSeeds = [
  ...seedIdsFromConst('features/map/data/germany/germanyLocalNodes.generated.ts', 'GERMANY_LOCAL_NODE_DEFS'),
  ...seedIdsFromConst('features/map/data/germany/germanyLocalNodesRural.generated.ts', 'GERMANY_LOCAL_NODE_RURAL_DEFS'),
];
sources.regional = seedIdsFromConst(
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
  'GERMANY_REGIONAL_CLUSTER_DEFS',
);

const all = [
  ...sources.core,
  ...sources.europeExtra,
  ...sources.germanyExtra,
  ...sources.germanyDense,
  ...sources.localSeeds,
  ...sources.regional,
];

const seen = new Map();
for (const id of all) seen.set(id, (seen.get(id) ?? 0) + 1);
const dups = [...seen.entries()].filter(([, c]) => c > 1);

console.log('Merged city id count:', all.length);
console.log('Unique ids:', seen.size);
console.log('Duplicates in merged cities list:', dups.length ? dups : 'none');

const searchTargets = ['cochem', 'bruttig_fankel', 'garmisch_partenkirchen', 'wilhelmshaven', 'zittau'];
for (const id of searchTargets) {
  console.log(`search:${id}`, seen.has(id) ? 'OK' : 'MISSING');
}
