/**
 * Import OSM-verified Saarland settlements into generated TS files.
 * Reads osm-saarland-places.json, filters duplicates, Nominatim-reverse verifies admin, writes patches.
 *
 * Usage: node scripts/import-saarland-settlements.mjs [--limit=700] [--dry-run] [--fast]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');

const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '700', 10);
const DRY = process.argv.includes('--dry-run');
const FAST = process.argv.includes('--fast');

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3 };

/** Names that are landmarks/sub-places, not municipalities */
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof)/i;

const SEED_FILES = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'features/map/data/germany/germanySaarlandNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'saarbruecken', name: 'Saarbrücken', lat: 49.24, lng: 6.996 },
  { id: 'neunkirchen', name: 'Neunkirchen', lat: 49.344, lng: 7.18 },
  { id: 'homburg', name: 'Homburg', lat: 49.326, lng: 7.339 },
  { id: 'voelklingen', name: 'Völklingen', lat: 49.251, lng: 6.859 },
  { id: 'saarlouis', name: 'Saarlouis', lat: 49.314, lng: 6.752 },
  { id: 'sankt_ingbert', name: 'Sankt Ingbert', lat: 49.277, lng: 7.117 },
  { id: 'merzig', name: 'Merzig', lat: 49.443, lng: 6.638 },
  { id: 'st_wendel', name: 'St. Wendel', lat: 49.466, lng: 7.169 },
  { id: 'dillingen_saar', name: 'Dillingen/Saar', lat: 49.355, lng: 6.728 },
  { id: 'lebach', name: 'Lebach', lat: 49.411, lng: 6.909 },
  { id: 'ottweiler', name: 'Ottweiler', lat: 49.401, lng: 7.164 },
  { id: 'blieskastel', name: 'Blieskastel', lat: 49.237, lng: 7.257 },
];

const LANDKREIS_REGION = {
  'Regionalverband Saarbrücken': 'Saarbrücken',
  'Landkreis Saarlouis': 'Saarlouis',
  'Saarpfalz-Kreis': 'Saarpfalz',
  'Landkreis Neunkirchen': 'Neunkirchen',
  'Landkreis Merzig-Wadern': 'Merzig-Wadern',
  'Landkreis St. Wendel': 'St. Wendel',
};

/** Bbox [south, west, north, east] — candidate sort heuristic; Nominatim confirms at import */
const LANDKREIS_BBOX = {
  'Regionalverband Saarbrücken': [49.08, 6.85, 49.35, 7.25],
  'Landkreis Saarlouis': [49.25, 6.55, 49.55, 7.05],
  'Saarpfalz-Kreis': [49.15, 7.05, 49.45, 7.45],
  'Landkreis Neunkirchen': [49.25, 6.95, 49.50, 7.35],
  'Landkreis Merzig-Wadern': [49.35, 6.35, 49.65, 6.95],
  'Landkreis St. Wendel': [49.40, 7.00, 49.65, 7.40],
};

const LANDKREIS_PRIORITY = [
  'Regionalverband Saarbrücken',
  'Landkreis Saarlouis',
  'Saarpfalz-Kreis',
  'Landkreis Neunkirchen',
  'Landkreis Merzig-Wadern',
  'Landkreis St. Wendel',
];

/** Saarland state bbox for --fast verification */
const SAARLAND_BBOX = [49.05, 6.30, 49.70, 7.45];

function inferLandkreisSort(lat, lng) {
  const hits = [];
  for (const [lk, [s, w, n, e]] of Object.entries(LANDKREIS_BBOX)) {
    if (lat >= s && lat <= n && lng >= w && lng <= e) hits.push(lk);
  }
  if (hits.length === 0) return 'other';
  for (const p of LANDKREIS_PRIORITY) {
    if (hits.includes(p)) return p;
  }
  return hits[0];
}

function sortPlacesList(list) {
  return [...list].sort((a, b) => {
    const pa = PLACE_PRIORITY[a.place] ?? 9;
    const pb = PLACE_PRIORITY[b.place] ?? 9;
    if (pa !== pb) return pa - pb;
    const popA = a.population ?? 0;
    const popB = b.population ?? 0;
    if (popA !== popB) return popB - popA;
    return a.name.localeCompare(b.name, 'de');
  });
}

function buildDistributedQueue(rawPlaces) {
  const byDistrict = new Map();
  for (const p of rawPlaces) {
    const lk = inferLandkreisSort(p.lat, p.lng);
    if (!byDistrict.has(lk)) byDistrict.set(lk, []);
    byDistrict.get(lk).push(p);
  }
  for (const [lk, list] of byDistrict) {
    byDistrict.set(lk, sortPlacesList(list));
  }

  const districtOrder = [...LANDKREIS_PRIORITY, 'other'];
  const maxRound = Math.max(...[...byDistrict.values()].map((l) => l.length), 0);
  const queue = [];
  for (let round = 0; round < maxRound; round += 1) {
    for (const lk of districtOrder) {
      const list = byDistrict.get(lk);
      if (!list || round >= list.length) continue;
      queue.push(list[round]);
    }
  }
  return queue;
}

function loadExistingIds() {
  const ids = new Set();
  const coords = [];
  const namesByLandkreis = new Map();
  for (const f of SEED_FILES) {
    const fullPath = path.join(ROOT, f);
    if (!fs.existsSync(fullPath)) continue;
    const src = fs.readFileSync(fullPath, 'utf8');
    for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
    for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.]+)[\s\S]*?lng:\s*([\d.]+)/g)) {
      coords.push({ id: m[1], lat: +m[2], lng: +m[3] });
    }
    const blocks = src.split(/\{\s*\n/);
    for (const block of blocks) {
      const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
      const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
      const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
      if (!idM || !nameM) continue;
      ids.add(slug(nameM[1]));
      if (lkM) {
        const lk = lkM[1];
        const norm = normalizeSettlementName(nameM[1]);
        if (!namesByLandkreis.has(lk)) namesByLandkreis.set(lk, new Set());
        namesByLandkreis.get(lk).add(norm);
      }
    }
  }
  return { ids, coords, namesByLandkreis };
}

function normalizeSettlementName(name) {
  return slug(name.replace(/\s*\([^)]*\)/g, '').trim());
}

function slug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/_+/g, '_');
}

function distKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestHub(lat, lng) {
  let best = HUBS[0];
  let bestD = Infinity;
  for (const h of HUBS) {
    const d = distKm({ lat, lng }, h);
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  }
  return best;
}

function estimatePopulation(place, osmPop) {
  if (osmPop && osmPop > 0) return osmPop;
  switch (place) {
    case 'city': return 55000;
    case 'town': return 4500;
    case 'village': return 900;
    case 'hamlet': return 250;
    default: return 800;
  }
}

function inferRegion(landkreis, lat, lng) {
  if (landkreis && LANDKREIS_REGION[landkreis]) return LANDKREIS_REGION[landkreis];
  const lk = inferLandkreisSort(lat, lng);
  if (lk !== 'other' && LANDKREIS_REGION[lk]) return LANDKREIS_REGION[lk];
  return 'Saarland';
}

function coordKey(lat, lng) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function isNearExisting(lat, lng, coords, thresholdKm = 0.05) {
  for (const c of coords) {
    if (distKm({ lat, lng }, c) < thresholdKm) return c.id;
  }
  return null;
}

function asciiName(name) {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function hyphenVariant(name) {
  return name.replace(/\s+/g, '-');
}

function spaceVariant(name) {
  return name.replace(/-/g, ' ');
}

function buildAliases(entry) {
  const { name, id } = entry;
  const aliases = new Set();
  const ascii = asciiName(name);
  if (ascii !== name) aliases.add(ascii);
  if (name.includes('-')) aliases.add(spaceVariant(name));
  if (name.includes(' ')) aliases.add(hyphenVariant(name));
  if (name.includes(' an der ')) {
    aliases.add(name.replace(' an der ', ' a.d. '));
    aliases.add(name.replace(' an der ', ' '));
  }
  if (name.includes(' in der ')) {
    aliases.add(name.replace(' in der ', ' i.d. '));
  }
  if (name.startsWith('Bad ')) aliases.add(name.replace('Bad ', ''));
  if (name.startsWith('Sankt ')) {
    aliases.add(`St. ${name.slice(6)}`);
    aliases.add(`St ${name.slice(6)}`);
  }
  aliases.delete(name);
  aliases.delete(id);
  return [...aliases].filter(Boolean).slice(0, 6);
}

function scaleMetrics(pop) {
  const companies = Math.max(28, Math.min(120, Math.round(pop / 120)));
  const jobs = Math.max(12, Math.round(companies * 0.38));
  const warehouses = Math.max(1, Math.round(companies / 35));
  const transport = Math.max(8, Math.round(companies * 0.45));
  const marketplace = Math.max(10, Math.round(companies * 0.55));
  const aiScore = Math.min(72, 42 + Math.round(pop / 8000));
  return { companies, jobs, warehouses, transport, marketplace, aiScore };
}

function formatDef(d) {
  const lines = [
    '  {',
    `    id: '${d.id}',`,
    `    name: '${d.name.replace(/'/g, "\\'")}',`,
    `    lat: ${d.lat}, lng: ${d.lng},`,
    `    bundeslandId: 'DE-SL',`,
    `    federalState: 'Saarland',`,
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
  const parts = [`  ${d.id}: { metrics: b(${m.companies}, ${m.jobs}, ${m.warehouses}, ${m.transport}, ${m.marketplace}, ${m.aiScore})`];
  if (d.tourism) parts.push(', tourismScore: 76');
  parts.push(`, logisticsScore: ${Math.min(72, 38 + Math.round(d.population / 6000))}`);
  parts.push(`, infra: { logisticsHubs: ['${d.name.replace(/'/g, "\\'")} Regional'] } },`);
  return parts.join('');
}

function formatAlias(id, aliases) {
  if (!aliases.length) return '';
  const arr = aliases.map((a) => `'${a.replace(/'/g, "\\'")}'`).join(', ');
  return `  ${id}: [${arr}],`;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeLandkreis(raw) {
  if (!raw) return null;
  return raw
    .replace(/^Landkreis\s+/, '')
    .replace(/^Kreis\s+/, '')
    .replace(/^Regionalverband\s+/, 'Regionalverband ')
    .trim();
}

async function reverseVerify(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '10',
  })}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (saarland-import)' },
  });
  if (!res.ok) return null;
  const d = await res.json();
  const addr = d.address ?? {};
  const state = addr.state ?? '';
  if (!state.includes('Saarland')) return null;
  const county = addr.county ?? '';
  let landkreis = normalizeLandkreis(county);
  if (landkreis && !landkreis.startsWith('Regionalverband') && !landkreis.startsWith('Landkreis') && !landkreis.startsWith('Saarpfalz')) {
    landkreis = `Landkreis ${landkreis}`;
  }
  const municipality =
    addr.municipality ?? addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? null;
  return { landkreis: landkreis || null, municipality, display: d.display_name ?? '' };
}

const osmPath = path.join(__dir, 'osm-saarland-places.json');
if (!fs.existsSync(osmPath)) {
  console.error('Run fetch-osm-saarland-overpass.mjs first');
  process.exit(1);
}

const { places: rawPlaces } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));

const places = buildDistributedQueue(rawPlaces);
const { ids: existingIds, coords: existingCoords, namesByLandkreis } = loadExistingIds();
const usedIds = new Set(existingIds);
const usedCoords = new Set(existingCoords.map((c) => coordKey(c.lat, c.lng)));
const usedSlugs = new Map();
const batchNamesByLandkreis = new Map();

const skipped = {
  duplicateId: 0,
  duplicateCoord: 0,
  nearExisting: 0,
  verifyFailed: 0,
  slugCollision: 0,
  duplicateName: 0,
  unsupportedName: 0,
  outsideSaarland: 0,
};
const imported = [];
const byAdmin = {};

for (const p of places) {
  if (imported.length >= LIMIT) break;

  if (SKIP_NAME.test(p.name)) {
    skipped.unsupportedName++;
    continue;
  }
  if (p.place === 'city' && existingIds.has(p.id)) {
    skipped.duplicateId++;
    continue;
  }

  let id = p.id;
  if (existingIds.has(id)) {
    skipped.duplicateId++;
    continue;
  }
  const nameSlug = slug(p.name);
  if (existingIds.has(nameSlug) && nameSlug !== id) {
    skipped.duplicateId++;
    continue;
  }

  const lat = +Number(p.lat).toFixed(6);
  const lng = +Number(p.lng).toFixed(6);
  const ck = coordKey(lat, lng);
  if (usedCoords.has(ck)) {
    skipped.duplicateCoord++;
    continue;
  }
  const near = isNearExisting(lat, lng, existingCoords);
  if (near) {
    skipped.nearExisting++;
    continue;
  }

  if (usedSlugs.has(id)) {
    id = `${id}_${p.osmId}`;
    skipped.slugCollision++;
  }
  if (usedIds.has(id)) {
    skipped.duplicateId++;
    continue;
  }

  let admin;
  if (FAST) {
    const [s, w, n, e] = SAARLAND_BBOX;
    if (lat < s || lat > n || lng < w || lng > e) {
      skipped.outsideSaarland++;
      continue;
    }
    const lk = inferLandkreisSort(lat, lng);
    admin = { landkreis: lk === 'other' ? null : lk, municipality: p.name, display: p.name };
  } else {
    await sleep(1100);
    admin = await reverseVerify(lat, lng);
    if (!admin) {
      skipped.verifyFailed++;
      console.error(`SKIP verify ${p.name}`);
      continue;
    }
  }

  if (admin.landkreis) {
    const norm = normalizeSettlementName(p.name);
    const existingNames = namesByLandkreis.get(admin.landkreis);
    const batchNames = batchNamesByLandkreis.get(admin.landkreis);
    if (existingNames?.has(norm) || batchNames?.has(norm)) {
      skipped.duplicateName++;
      console.error(`SKIP duplicate name ${p.name} in ${admin.landkreis}`);
      continue;
    }
  }

  const hub = nearestHub(lat, lng);
  const population = estimatePopulation(p.place, p.population);
  const region = inferRegion(admin.landkreis, lat, lng);
  const tourism = p.name.startsWith('Bad ') || region === 'Saarpfalz';

  const entry = {
    id,
    name: p.name,
    lat,
    lng,
    region,
    landkreis: admin.landkreis,
    municipality: admin.municipality,
    nearestMajorCityId: hub.id,
    nearestMajorCity: hub.name,
    population,
    tourism: tourism || undefined,
    place: p.place,
    osmId: p.osmId,
  };

  imported.push(entry);
  usedIds.add(id);
  usedCoords.add(ck);
  usedSlugs.set(p.id, id);
  existingCoords.push({ id, lat, lng });
  const adminKey = admin.landkreis ?? inferLandkreisSort(lat, lng);
  byAdmin[adminKey] = (byAdmin[adminKey] ?? 0) + 1;
  if (admin.landkreis) {
    const norm = normalizeSettlementName(p.name);
    if (!batchNamesByLandkreis.has(admin.landkreis)) batchNamesByLandkreis.set(admin.landkreis, new Set());
    batchNamesByLandkreis.get(admin.landkreis).add(norm);
  }
  console.error(`OK ${imported.length}/${LIMIT} ${id} (${p.name})`);
}

imported.sort((a, b) => a.id.localeCompare(b.id));

const report = {
  totalSourceCandidates: rawPlaces.length,
  imported: imported.length,
  skipped,
  byAdmin,
  ids: imported.map((i) => i.id),
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
};

fs.writeFileSync(path.join(__dir, 'osm-saarland-import-result.json'), JSON.stringify({ report, imported }, null, 2));
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

// ── Patch germanySaarlandNodes.generated.ts ──
const nodesPath = path.join(ROOT, 'features/map/data/germany/germanySaarlandNodes.generated.ts');
let nodesSrc = fs.readFileSync(nodesPath, 'utf8');
const insertPoint = nodesSrc.lastIndexOf('];');
const newDefs = imported.map(formatDef).join('\n');
const beforeClose = nodesSrc.slice(0, insertPoint).trimEnd();
const needsComma = beforeClose.endsWith('},') || beforeClose.endsWith('}');
const prefix = needsComma && !beforeClose.endsWith(',\n') ? '\n' : '\n';
nodesSrc = `${beforeClose}${prefix}${newDefs}\n${nodesSrc.slice(insertPoint)}`;
fs.writeFileSync(nodesPath, nodesSrc);

// ── Patch germanySaarlandEnrichment.ts ──
const enrichPath = path.join(ROOT, 'features/map/data/germany/germanySaarlandEnrichment.ts');
let enrichSrc = fs.readFileSync(enrichPath, 'utf8');
const enrichInsert = enrichSrc.lastIndexOf('};');
const newEnrich = `\n  // ── Saarland batch import (OSM ${new Date().toISOString().slice(0, 10)}) ──\n${imported.map(formatEnrich).join('\n')}\n`;
enrichSrc = `${enrichSrc.slice(0, enrichInsert)}${newEnrich}${enrichSrc.slice(enrichInsert)}`;
fs.writeFileSync(enrichPath, enrichSrc);

// ── Patch citySearchAliases.ts ──
const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasLines = imported
  .map((d) => ({ id: d.id, aliases: buildAliases(d) }))
  .filter((x) => x.aliases.length)
  .map((x) => formatAlias(x.id, x.aliases));
if (aliasLines.length) {
  const slugMarker = 'export const CITY_SEARCH_SLUG_ALIASES';
  const slugIdx = aliasSrc.indexOf(slugMarker);
  const closeIdx = aliasSrc.lastIndexOf('};', slugIdx);
  const newBlock = `\n  // Saarland batch import\n${aliasLines.join('\n')}\n`;
  aliasSrc = `${aliasSrc.slice(0, closeIdx)}${newBlock}${aliasSrc.slice(closeIdx)}`;
  fs.writeFileSync(aliasPath, aliasSrc);
}

console.error(`Patched ${imported.length} settlements into TS files`);
