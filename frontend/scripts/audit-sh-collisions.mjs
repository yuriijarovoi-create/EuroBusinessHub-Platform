/**
 * One-shot SH collision audit vs other seed files (no Nominatim).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const sh = fs.readFileSync(
  path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts'),
  'utf8',
);

const shIds = new Set();
const shCoords = new Map();
for (const block of sh.split(/\{\s*\n/).slice(1)) {
  const id = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1];
  const lat = Number(block.match(/lat:\s*([\d.-]+)/)?.[1]);
  const lng = Number(block.match(/lng:\s*([\d.-]+)/)?.[1]);
  if (!id || !Number.isFinite(lat)) continue;
  shIds.add(id);
  shCoords.set(`${lat.toFixed(5)},${lng.toFixed(5)}`, id);
}

const others = [
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

const collisions = [];
const coordHits = [];
for (const f of others) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const block of src.split(/\{\s*\n/).slice(1)) {
    const id = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1];
    const lat = Number(block.match(/lat:\s*([\d.-]+)/)?.[1]);
    const lng = Number(block.match(/lng:\s*([\d.-]+)/)?.[1]);
    if (id && shIds.has(id)) collisions.push({ id, f });
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const ck = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      const sid = shCoords.get(ck);
      if (sid && sid !== id) coordHits.push({ sh: sid, other: id, f, ck });
    }
  }
}

const enrich = fs.readFileSync(
  path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinEnrichment.ts'),
  'utf8',
);
const enrichIds = [...enrich.matchAll(/^  ([a-z0-9_]+): \{ metrics:/gm)].map((m) => m[1]);

const alias = fs.readFileSync(path.join(ROOT, 'features/map/data/citySearchAliases.ts'), 'utf8');
const m = alias.indexOf('// Schleswig-Holstein batch 1 import');
const end = alias.indexOf('\n};', m);
const aliasBlock = alias.slice(m, end);
const aliasKeys = [...aliasBlock.matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((x) => x[1]);

const lohe = sh.split(/\{\s*\n/).find((b) => /id:\s*'lohe_fohrden'/.test(b)) ?? '';
const helgoland = sh.split(/\{\s*\n/).find((b) => /id:\s*'helgoland'/.test(b)) ?? '';

console.log(JSON.stringify({
  shCount: shIds.size,
  shIdCollisions: collisions.length,
  collisions: collisions.slice(0, 20),
  coordCollisions: coordHits.length,
  coordSample: coordHits.slice(0, 10),
  enrichCount: enrichIds.length,
  enrichUnique: new Set(enrichIds).size,
  aliasKeys: aliasKeys.length,
  aliasUnique: new Set(aliasKeys).size,
  lohe_fohrden: {
    tourism: /tourism:\s*true/.test(lohe),
    landkreis: lohe.match(/landkreis:\s*'([^']+)'/)?.[1] ?? null,
  },
  helgoland: {
    landkreis: helgoland.match(/landkreis:\s*'([^']+)'/)?.[1] ?? null,
    region: helgoland.match(/region:\s*'([^']+)'/)?.[1] ?? null,
  },
  ok: collisions.length === 0 && coordHits.length === 0 && enrichIds.length === shIds.size,
}, null, 2));
process.exit(collisions.length || coordHits.length ? 1 : 0);
