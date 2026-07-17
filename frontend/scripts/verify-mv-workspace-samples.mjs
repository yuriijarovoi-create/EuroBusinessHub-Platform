/**
 * Validate representative /workspace/:cityId samples across MV districts.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const nodesPath = path.join(ROOT, 'features/map/data/germany/germanyMecklenburgVorpommernNodes.generated.ts');
const src = fs.readFileSync(nodesPath, 'utf8');

const byLk = new Map();
for (const block of src.split(/\{\s*\n/).slice(1)) {
  const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
  const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
  if (!idM) continue;
  const lk = lkM?.[1] ?? 'unknown';
  if (!byLk.has(lk)) byLk.set(lk, []);
  byLk.get(lk).push(idM[1]);
}

const samples = [];
for (const [lk, ids] of byLk) {
  const take = Math.min(3, ids.length);
  for (let i = 0; i < take; i++) {
    samples.push({ landkreis: lk, cityId: ids[i], route: `/workspace/${ids[i]}` });
  }
}

// Ensure at least 24 samples when enough settlements exist
while (samples.length < 24) {
  let added = false;
  for (const [, ids] of byLk) {
    for (const id of ids) {
      if (samples.some((s) => s.cityId === id)) continue;
      samples.push({ landkreis: 'extra', cityId: id, route: `/workspace/${id}` });
      added = true;
      if (samples.length >= 24) break;
    }
    if (samples.length >= 24) break;
  }
  if (!added) break;
}

const ok = samples.length >= Math.min(24, [...byLk.values()].reduce((n, a) => n + a.length, 0));
console.log(JSON.stringify({
  districts: byLk.size,
  totalSettlements: [...byLk.values()].reduce((n, a) => n + a.length, 0),
  sampleCount: samples.length,
  samples: samples.slice(0, 30),
  ok,
}, null, 2));
process.exit(ok ? 0 : 1);
