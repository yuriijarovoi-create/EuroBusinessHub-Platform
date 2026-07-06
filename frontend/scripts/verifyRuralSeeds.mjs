import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/features/map/data/germany');

function idsFrom(file, constName) {
  const src = fs.readFileSync(path.join(base, file), 'utf8');
  const start = src.indexOf(`export const ${constName}`);
  const next = src.indexOf('export const ', start + 10);
  const chunk = next > start ? src.slice(start, next) : src.slice(start, start + 80000);
  return [...chunk.matchAll(/id: "([a-z0-9_]+)"/g)].map((m) => m[1]);
}

const local = idsFrom('germanyLocalNodes.generated.ts', 'GERMANY_LOCAL_NODE_DEFS');
const rural = idsFrom('germanyLocalNodesRural.generated.ts', 'GERMANY_LOCAL_NODE_RURAL_DEFS');
const overlap = local.filter((id) => rural.includes(id));
console.log('LOCAL seeds:', local.length);
console.log('RURAL seeds:', rural.length);
console.log('Seed overlap:', overlap.length ? overlap : 'none');
const allSeeds = [...local, ...rural];
const seen = new Set();
const dup = [];
for (const id of allSeeds) {
  if (seen.has(id)) dup.push(id);
  seen.add(id);
}
console.log('Duplicate seeds in cities list:', dup.length ? dup : 'none');
const targets = ['cochem', 'bruttig_fankel', 'garmisch_partenkirchen', 'wilhelmshaven', 'zittau'];
for (const t of targets) {
  const inLocal = local.includes(t);
  const inRural = rural.includes(t);
  console.log(`${t}: ${inLocal ? 'LOCAL seed' : inRural ? 'RURAL seed' : 'existing city only'}`);
}

// Full cities list duplicate check
const citiesSrc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/data/cities.ts'), 'utf8');
const coreIds = [...citiesSrc.matchAll(/id: ['"]([a-z0-9_]+)['"]/g)].map((m) => m[1]);
const allFromSeeds = [...coreIds, ...local, ...rural];
const seedDup = [];
const seedSeen = new Set();
for (const id of allFromSeeds) {
  if (seedSeen.has(id)) seedDup.push(id);
  seedSeen.add(id);
}
console.log('Approx duplicate ids in city seeds (core+local+rural):', seedDup.length ? [...new Set(seedDup)].slice(0, 30) : 'none');
