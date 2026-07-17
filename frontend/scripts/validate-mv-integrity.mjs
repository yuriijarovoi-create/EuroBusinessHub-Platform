/**
 * Cross-state integrity checks after MV import (IDs / coords; other states unchanged).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const STATE_FILES = {
  'Rheinland-Pfalz': 'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  Saarland: 'features/map/data/germany/germanySaarlandNodes.generated.ts',
  Hessen: 'features/map/data/germany/germanyHessenNodes.generated.ts',
  'Baden-Württemberg': 'features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
  Bayern: 'features/map/data/germany/germanyBayernNodes.generated.ts',
  'Nordrhein-Westfalen': 'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts',
  Niedersachsen: 'features/map/data/germany/germanyNiedersachsenNodes.generated.ts',
  'Schleswig-Holstein': 'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts',
  'Mecklenburg-Vorpommern': 'features/map/data/germany/germanyMecklenburgVorpommernNodes.generated.ts',
};

const ALL_SEED = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  ...Object.values(STATE_FILES),
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

function countEntries(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return 0;
  const src = fs.readFileSync(full, 'utf8');
  let n = 0;
  for (const block of src.split(/\{\s*\n/).slice(1)) {
    if (/id:\s*['"]/.test(block) && /lat:\s*/.test(block)) n++;
  }
  return n;
}

function collectIdsAndCoords() {
  const ids = new Map();
  const coords = new Map();
  const dupIds = [];
  const dupCoords = [];
  for (const f of ALL_SEED) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const src = fs.readFileSync(p, 'utf8');
    for (const block of src.split(/\{\s*\n/).slice(1)) {
      const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
      const latM = block.match(/lat:\s*([\d.-]+)/);
      const lngM = block.match(/lng:\s*([\d.-]+)/);
      if (!idM || !latM || !lngM) continue;
      const id = idM[1];
      if (ids.has(id)) dupIds.push({ id, a: ids.get(id), b: f });
      else ids.set(id, f);
      const ck = `${Number(latM[1]).toFixed(5)},${Number(lngM[1]).toFixed(5)}`;
      if (f.includes('germany') && f.includes('Nodes')) {
        if (coords.has(ck) && coords.get(ck).id !== id) {
          dupCoords.push({ coord: ck, a: coords.get(ck), b: { id, f } });
        } else coords.set(ck, { id, f });
      }
    }
  }
  return {
    totalIds: ids.size,
    dupIds: dupIds.slice(0, 20),
    dupCoords: dupCoords.slice(0, 20),
    dupIdCount: dupIds.length,
    dupCoordCount: dupCoords.length,
  };
}

const stateCounts = Object.fromEntries(
  Object.entries(STATE_FILES).map(([k, f]) => [k, countEntries(f)]),
);
const dups = collectIdsAndCoords();
const ok = dups.dupIdCount === 0 && dups.dupCoordCount === 0;

console.log(JSON.stringify({ stateCounts, ...dups, ok }, null, 2));
process.exit(ok ? 0 : 1);
