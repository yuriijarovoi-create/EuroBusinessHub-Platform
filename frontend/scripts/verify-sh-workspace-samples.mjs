/**
 * Pick geographically balanced SH workspace samples and verify they resolve.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const sh = fs.readFileSync(
  path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts'),
  'utf8',
);

const entries = [];
for (const block of sh.split(/\{\s*\n/).slice(1)) {
  const id = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1];
  const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
  const lk = block.match(/landkreis:\s*['"]([^'"]+)['"]/)?.[1];
  const region = block.match(/region:\s*['"]([^'"]+)['"]/)?.[1];
  const lat = Number(block.match(/lat:\s*([\d.-]+)/)?.[1]);
  const lng = Number(block.match(/lng:\s*([\d.-]+)/)?.[1]);
  const tourism = /tourism:\s*true/.test(block);
  if (id && Number.isFinite(lat)) entries.push({ id, name, lk, region, lat, lng, tourism });
}

const ISLAND_BBOX = [
  { name: 'Sylt', box: [54.85, 8.25, 55.05, 8.55] },
  { name: 'Föhr', box: [54.65, 8.45, 54.75, 8.60] },
  { name: 'Amrum', box: [54.62, 8.28, 54.70, 8.40] },
  { name: 'Fehmarn', box: [54.40, 10.95, 54.55, 11.30] },
  { name: 'Pellworm', box: [54.48, 8.60, 54.55, 8.75] },
  { name: 'Helgoland', box: [54.16, 7.85, 54.20, 7.92] },
];

function isIsland(e) {
  // Exclude mainland *-Föhrden* names that contain "föhr" as a substring
  if (/\bföhrden\b|\bfoehrden\b/i.test(e.name ?? '')) return false;
  return ISLAND_BBOX.some(({ box: [s, w, n, ea] }) => e.lat >= s && e.lat <= n && e.lng >= w && e.lng <= ea)
    || /helgoland|hallig|\bsylt\b|wyk auf föhr|amrum|fehmarn|pellworm/i.test(e.name ?? '');
}

function isCoastal(e) {
  if (isIsland(e)) return true;
  if (e.lng < 9.15 && e.lat > 53.95) return true;
  if (e.lng > 10.0 && e.lat > 54.2) return true;
  if (e.lng > 10.6 && e.lat > 53.9) return true;
  return false;
}

function isDanishBorder(e) {
  return e.lat >= 54.70 && e.lng >= 8.8 && e.lng <= 9.7;
}

function isInlandRural(e) {
  return !isCoastal(e) && !isIsland(e) && (e.population ?? 900) < 3000
    && !['Pinneberg', 'Stormarn', 'Segeberg'].includes(e.lk);
}

const groups = {
  nordfriesland: entries.filter((e) => e.lk === 'Nordfriesland'),
  schleswigFlensburg: entries.filter((e) => e.lk === 'Schleswig-Flensburg'),
  dithmarschen: entries.filter((e) => e.lk === 'Dithmarschen'),
  rendsburg: entries.filter((e) => e.lk === 'Rendsburg-Eckernförde'),
  ostholstein: entries.filter((e) => e.lk === 'Ostholstein'),
  lauenburgStormarn: entries.filter((e) => ['Herzogtum Lauenburg', 'Stormarn'].includes(e.lk)),
  other: entries.filter((e) => ['Plön', 'Steinburg', 'Segeberg', 'Pinneberg', 'Flensburg', 'Kiel', 'Lübeck', 'Neumünster', 'Helgoland'].includes(e.lk)),
};

function pick(list, n) {
  if (!list.length) return [];
  const step = Math.max(1, Math.floor(list.length / n));
  const out = [];
  for (let i = 0; i < list.length && out.length < n; i += step) out.push(list[i]);
  return out;
}

const samples = [
  ...pick(groups.nordfriesland, 4).map((e) => ({ ...e, group: 'nordfriesland' })),
  ...pick(groups.schleswigFlensburg, 4).map((e) => ({ ...e, group: 'schleswig-flensburg' })),
  ...pick(groups.dithmarschen, 4).map((e) => ({ ...e, group: 'dithmarschen' })),
  ...pick(groups.rendsburg, 4).map((e) => ({ ...e, group: 'rendsburg-eckernfoerde' })),
  ...pick(groups.ostholstein, 4).map((e) => ({ ...e, group: 'ostholstein' })),
  ...pick(groups.lauenburgStormarn, 4).map((e) => ({ ...e, group: 'lauenburg-stormarn' })),
  ...pick(groups.other, 4).map((e) => ({ ...e, group: 'other-kreise' })),
];

// Ensure specialty coverage
function ensure(list, predicate, tag, n = 2) {
  const extras = list.filter(predicate).filter((e) => !samples.some((s) => s.id === e.id));
  for (const e of pick(extras, n)) samples.push({ ...e, group: tag });
}

ensure(entries, isCoastal, 'coastal', 2);
ensure(entries, isIsland, 'island', 2);
ensure(entries, isDanishBorder, 'danish-border', 2);
ensure(entries, isInlandRural, 'inland-rural', 2);

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
  'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];
const allIds = new Set();
for (const f of seedFiles) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) allIds.add(m[1]);
}

const results = samples.map((s) => ({
  id: s.id,
  name: s.name,
  landkreis: s.lk,
  group: s.group,
  found: allIds.has(s.id),
  workspaceRoute: `/workspace/${s.id}`,
  coastal: isCoastal(s),
  island: isIsland(s),
  danishBorder: isDanishBorder(s),
}));

const failed = results.filter((r) => !r.found);
console.log(JSON.stringify({
  checked: results.length,
  failed: failed.length,
  specialty: {
    coastal: results.filter((r) => r.group === 'coastal' || r.coastal).length,
    island: results.filter((r) => r.group === 'island' || r.island).length,
    danishBorder: results.filter((r) => r.group === 'danish-border' || r.danishBorder).length,
    inlandRural: results.filter((r) => r.group === 'inland-rural').length,
  },
  byGroup: Object.fromEntries(
    [...new Set(results.map((r) => r.group))].map((g) => [g, results.filter((r) => r.group === g).length]),
  ),
  results,
}, null, 2));
process.exit(failed.length ? 1 : 0);
