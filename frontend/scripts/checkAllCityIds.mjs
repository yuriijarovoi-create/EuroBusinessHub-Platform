import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const files = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const ids = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(base, f), 'utf8');
  for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) {
    ids.push(m[1]);
  }
}

const seen = new Map();
for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
const dups = [...seen.entries()].filter(([, c]) => c > 1);
console.log('Total city ids across seed files:', ids.length);
console.log('Unique:', seen.size);
console.log('Duplicates:', dups.length ? dups.slice(0, 20) : 'none');
