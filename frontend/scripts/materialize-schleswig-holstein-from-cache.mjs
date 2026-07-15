/**
 * Materialize Schleswig-Holstein TS artifacts from verified import-result / cache.
 * Does NOT call Nominatim. Safe recovery when verification already completed.
 *
 * Usage: node scripts/materialize-schleswig-holstein-from-cache.mjs [--limit=700]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '700', 10);

const RESULT_PATH = path.join(__dir, 'osm-schleswig-holstein-import-result.json');
const CACHE_PATH = path.join(__dir, 'osm-schleswig-holstein-verification-cache.json');
const CHECKPOINT_PATH = path.join(__dir, 'osm-schleswig-holstein-checkpoint.json');

const TRUE_ISLANDS = new Set(['Sylt', 'Föhr', 'Amrum', 'Fehmarn', 'Pellworm', 'Helgoland']);

const ISLAND_BBOX = {
  Sylt: [54.85, 8.25, 55.05, 8.55],
  Föhr: [54.65, 8.45, 54.75, 8.60],
  Amrum: [54.62, 8.28, 54.70, 8.40],
  Fehmarn: [54.40, 10.95, 54.55, 11.30],
  Pellworm: [54.48, 8.60, 54.55, 8.75],
  Helgoland: [54.16, 7.85, 54.20, 7.92],
};

function inBbox(lat, lng, [s, w, n, e]) {
  return lat >= s && lat <= n && lng >= w && lng <= e;
}

function detectTrueIsland(lat, lng, name) {
  for (const [island, bbox] of Object.entries(ISLAND_BBOX)) {
    if (inBbox(lat, lng, bbox)) return island;
  }
  // Name match only for exact island settlements (avoid Föhrden-* false positives)
  if (/^wyk\b|^westerland$|^wenningstedt|^kampen\b|^list\b|^hörnum|^hornnum|^neb|^wittdün|^wittduen|^helgoland$/i.test(name)) {
    if (/föhr|foehr/i.test(name) || /wyk/i.test(name)) return 'Föhr';
    if (/sylt|westerland|wenningstedt|kampen|list|hörnum|hornnum/i.test(name)) return 'Sylt';
    if (/amrum|wittdün|wittduen|neb/i.test(name)) return 'Amrum';
    if (/helgoland/i.test(name)) return 'Helgoland';
  }
  return null;
}

function isCoastal(lat, lng, name, island) {
  if (island) return true;
  if (lng < 9.15 && lat > 53.95) return true;
  if (lng > 10.0 && lat > 54.2) return true;
  if (lng > 10.6 && lat > 53.9) return true;
  if (/siel|hafen|strand|küste|foerde|förde|ostsee|nordsee/i.test(name)) return true;
  return false;
}

function buildAliases({ name, id }) {
  const aliases = new Set();
  const ascii = name.normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  if (ascii !== name) aliases.add(ascii);
  if (name.includes('-')) aliases.add(name.replace(/-/g, ' '));
  if (name.includes(' ')) aliases.add(name.replace(/\s+/g, '-'));
  if (name.startsWith('Bad ')) aliases.add(name.replace('Bad ', ''));
  aliases.delete(name);
  aliases.delete(id);
  return [...aliases].filter(Boolean).slice(0, 6);
}

function scaleMetrics(pop) {
  const companies = Math.max(28, Math.min(120, Math.round(pop / 120)));
  return {
    companies,
    jobs: Math.max(12, Math.round(companies * 0.38)),
    warehouses: Math.max(1, Math.round(companies / 35)),
    transport: Math.max(8, Math.round(companies * 0.45)),
    marketplace: Math.max(10, Math.round(companies * 0.55)),
    aiScore: Math.min(72, 42 + Math.round(pop / 8000)),
  };
}

function formatDef(d) {
  const lines = [
    '  {',
    `    id: '${d.id}',`,
    `    name: '${d.name.replace(/'/g, "\\'")}',`,
    `    lat: ${d.lat}, lng: ${d.lng},`,
    `    bundeslandId: 'DE-SH',`,
    `    federalState: 'Schleswig-Holstein',`,
    `    region: '${d.region}',`,
  ];
  if (d.landkreis) lines.push(`    landkreis: '${d.landkreis.replace(/'/g, "\\'")}',`);
  if (d.municipality) lines.push(`    municipality: '${d.municipality.replace(/'/g, "\\'")}',`);
  lines.push(
    `    nearestMajorCityId: '${d.nearestMajorCityId}',`,
    `    nearestMajorCity: '${d.nearestMajorCity.replace(/'/g, "\\'")}',`,
    `    population: ${d.population},`,
  );
  if (d.tourism) lines.push('    tourism: true,');
  lines.push('  },');
  return lines.join('\n');
}

function formatEnrich(d) {
  const m = scaleMetrics(d.population);
  let s = `  ${d.id}: { metrics: b(${m.companies}, ${m.jobs}, ${m.warehouses}, ${m.transport}, ${m.marketplace}, ${m.aiScore})`;
  if (d.tourism) s += ', tourismScore: 76';
  s += `, logisticsScore: ${Math.min(72, 38 + Math.round(d.population / 6000))}, infra: { logisticsHubs: ['${d.name.replace(/'/g, "\\'")} Regional'] } },`;
  return s;
}

function sanitizeEntry(raw) {
  const lat = +Number(raw.lat).toFixed(6);
  const lng = +Number(raw.lng).toFixed(6);
  let island = detectTrueIsland(lat, lng, raw.name);
  if (raw.island && TRUE_ISLANDS.has(raw.island) && inBbox(lat, lng, ISLAND_BBOX[raw.island])) {
    island = raw.island;
  }
  // Helgoland is a special municipality; keep dedicated landkreis label when on island
  let landkreis = raw.landkreis;
  if (island === 'Helgoland') landkreis = 'Helgoland';

  const coastal = isCoastal(lat, lng, raw.name, island);
  const nameSuggestsTourism = !/\bföhrden\b|\bfoehrden\b/i.test(raw.name)
    && /nordsee|ostsee|sylt|föhr|amrum|fehmarn|hallig|helgoland|insel/i.test(raw.name);
  const tourism = Boolean(
    raw.name.startsWith('Bad ')
    || island
    || nameSuggestsTourism
    || (coastal && /bad |kurort|strand/i.test(raw.name)),
  );

  const entry = {
    id: raw.id,
    name: raw.name,
    lat,
    lng,
    region: island === 'Helgoland' ? 'Helgoland' : raw.region,
    landkreis,
    municipality: raw.municipality,
    nearestMajorCityId: raw.nearestMajorCityId,
    nearestMajorCity: raw.nearestMajorCity,
    population: raw.population,
    osmId: raw.osmId,
  };
  if (tourism) entry.tourism = true;
  if (coastal) entry.coastal = true;
  if (island) entry.island = island;
  return entry;
}

if (!fs.existsSync(RESULT_PATH)) {
  console.error('Missing osm-schleswig-holstein-import-result.json');
  process.exit(1);
}

const result = JSON.parse(fs.readFileSync(RESULT_PATH, 'utf8'));
const source = Array.isArray(result.imported) ? result.imported : [];
if (!source.length) {
  console.error('Import result has no imported records');
  process.exit(1);
}

const seenIds = new Set();
const seenCoords = new Set();
const seenOsm = new Set();
const sanitized = [];
const corrections = { falseIslandCleared: 0, helgolandLandkreisFixed: 0, duplicateSkipped: 0 };

for (const raw of source) {
  if (sanitized.length >= LIMIT) break;
  if (!raw?.id || raw.lat == null || raw.lng == null || !raw.osmId) {
    corrections.duplicateSkipped++;
    continue;
  }
  const entry = sanitizeEntry(raw);
  const ck = `${entry.lat.toFixed(5)},${entry.lng.toFixed(5)}`;
  if (seenIds.has(entry.id) || seenCoords.has(ck) || seenOsm.has(entry.osmId)) {
    corrections.duplicateSkipped++;
    continue;
  }
  if (raw.island && !entry.island) corrections.falseIslandCleared++;
  if (raw.landkreis === 'Pinneberg' && entry.landkreis === 'Helgoland') corrections.helgolandLandkreisFixed++;
  seenIds.add(entry.id);
  seenCoords.add(ck);
  seenOsm.add(entry.osmId);
  sanitized.push(entry);
}

sanitized.sort((a, b) => a.id.localeCompare(b.id));

// Persistent verification cache keyed by OSM id + coordinates
const cache = {
  updatedAt: new Date().toISOString(),
  source: 'osm-schleswig-holstein-import-result.json',
  count: sanitized.length,
  entries: Object.fromEntries(
    sanitized.map((e) => [
      `node/${e.osmId}@${e.lat.toFixed(6)},${e.lng.toFixed(6)}`,
      {
        osmId: e.osmId,
        id: e.id,
        name: e.name,
        lat: e.lat,
        lng: e.lng,
        landkreis: e.landkreis,
        municipality: e.municipality,
        verified: true,
        status: 'ok',
      },
    ]),
  ),
};
fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

const byLandkreis = {};
for (const e of sanitized) {
  const lk = e.landkreis ?? 'missing';
  byLandkreis[lk] = (byLandkreis[lk] ?? 0) + 1;
}

const checkpoint = {
  updatedAt: new Date().toISOString(),
  phase: 'materialized',
  importedCount: sanitized.length,
  batchLimit: LIMIT,
  processedOsmIds: sanitized.map((e) => e.osmId),
  byLandkreis,
  corrections,
  deferred: [],
  failed: [],
};
fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));

// Refresh import-result with sanitized entries (preserve report metadata)
const refreshedReport = {
  ...(result.report ?? {}),
  imported: sanitized.length,
  byLandkreis,
  coastalCount: sanitized.filter((e) => e.coastal).length,
  islandCount: sanitized.filter((e) => e.island).length,
  materializeCorrections: corrections,
  mode: result.report?.mode ?? 'nominatim-reverse',
  materializedAt: new Date().toISOString(),
};
fs.writeFileSync(RESULT_PATH, JSON.stringify({ report: refreshedReport, imported: sanitized }, null, 2));

const nodesPath = path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts');
const nodesHeader = `/** Schleswig-Holstein Tier-4 local settlements — OSM verified (generated) */
import type { RawLocalNodeDef } from './germanyLocalNodes.generated';

export const GERMANY_SH_NODE_DEFS: RawLocalNodeDef[] = [
`;
fs.writeFileSync(nodesPath, `${nodesHeader}${sanitized.map(formatDef).join('\n')}\n];\n`);

const enrichPath = path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinEnrichment.ts');
const enrichHeader = `import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface SchleswigHolsteinEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  tourismScore?: number;
  infra?: Partial<GermanyInfrastructure>;
}

function b(c: number, j: number, w: number, t: number, m: number, a: number): MetricsSlice {
  return { companies: c, jobs: j, warehouses: w, transport: t, marketplace: m, aiScore: a };
}

export const GERMANY_SH_ENRICHMENT: Record<string, SchleswigHolsteinEnrichment> = {

  // ── Schleswig-Holstein batch 1 import (OSM ${new Date().toISOString().slice(0, 10)}) ──
`;
fs.writeFileSync(enrichPath, `${enrichHeader}${sanitized.map(formatEnrich).join('\n')}\n};\n`);

const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasMarker = '  // Schleswig-Holstein batch 1 import';
const aliasLines = sanitized
  .map((d) => ({ id: d.id, aliases: buildAliases(d) }))
  .filter((x) => x.aliases.length)
  .map((x) => `  ${x.id}: [${x.aliases.map((a) => `'${a.replace(/'/g, "\\'")}'`).join(', ')}],`);

if (aliasLines.length) {
  const markerIdx = aliasSrc.indexOf(aliasMarker);
  if (markerIdx !== -1) {
    const afterMarker = aliasSrc.indexOf('\n', markerIdx) + 1;
    const closeIdx = aliasSrc.indexOf('\n};', afterMarker);
    aliasSrc = `${aliasSrc.slice(0, markerIdx)}${aliasMarker}\n${aliasLines.join('\n')}${aliasSrc.slice(closeIdx)}`;
  } else {
    const slugIdx = aliasSrc.indexOf('export const CITY_SEARCH_SLUG_ALIASES');
    const beforeSlug = aliasSrc.lastIndexOf('\n};', slugIdx);
    aliasSrc = `${aliasSrc.slice(0, beforeSlug)}\n${aliasMarker}\n${aliasLines.join('\n')}\n${aliasSrc.slice(beforeSlug)}`;
  }
  fs.writeFileSync(aliasPath, aliasSrc);
}

console.log(JSON.stringify({
  ok: true,
  materialized: sanitized.length,
  cacheEntries: Object.keys(cache.entries).length,
  aliasLines: aliasLines.length,
  byLandkreis,
  corrections,
  files: {
    nodes: nodesPath,
    enrichment: enrichPath,
    aliases: aliasPath,
    cache: CACHE_PATH,
    checkpoint: CHECKPOINT_PATH,
    result: RESULT_PATH,
  },
}, null, 2));
