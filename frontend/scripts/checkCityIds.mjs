import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'cities.ts');
const src = fs.readFileSync(root, 'utf8');
const ids = [...src.matchAll(/id: ['"]([^'"]+)['"]/g)].map((m) => m[1]);
const seen = new Map();
for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
const dups = [...seen.entries()].filter(([, c]) => c > 1);
console.log('IDs in cities.ts literal arrays:', ids.length);
console.log('Duplicates:', dups.length ? dups : 'none');
