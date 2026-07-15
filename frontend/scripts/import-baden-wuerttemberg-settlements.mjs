/**
 * Import OSM-verified Baden-Württemberg settlements into generated TS files.
 * Reads osm-baden-wuerttemberg-places.json, filters duplicates, verifies admin, writes patches.
 *
 * Usage: node scripts/import-baden-wuerttemberg-settlements.mjs [--limit=700] [--dry-run] [--fast]
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
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof|flughafen|industrie)/i;

const SEED_FILES = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'features/map/data/germany/germanySaarlandNodes.generated.ts',
  'features/map/data/germany/germanyHessenNodes.generated.ts',
  'features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'stuttgart', name: 'Stuttgart', lat: 48.776, lng: 9.183 },
  { id: 'mannheim', name: 'Mannheim', lat: 49.487, lng: 8.466 },
  { id: 'karlsruhe', name: 'Karlsruhe', lat: 49.007, lng: 8.404 },
  { id: 'freiburg', name: 'Freiburg im Breisgau', lat: 47.999, lng: 7.842 },
  { id: 'ulm', name: 'Ulm', lat: 48.402, lng: 9.987 },
  { id: 'heidelberg', name: 'Heidelberg', lat: 49.398, lng: 8.672 },
  { id: 'heilbronn', name: 'Heilbronn', lat: 49.142, lng: 9.218 },
  { id: 'reutlingen', name: 'Reutlingen', lat: 48.491, lng: 9.204 },
  { id: 'pforzheim', name: 'Pforzheim', lat: 48.892, lng: 8.694 },
  { id: 'tuebingen', name: 'Tübingen', lat: 48.521, lng: 9.053 },
  { id: 'konstanz', name: 'Konstanz', lat: 47.663, lng: 9.176 },
  { id: 'villingen_schwenningen', name: 'Villingen-Schwenningen', lat: 48.062, lng: 8.458 },
  { id: 'ravensburg', name: 'Ravensburg', lat: 47.782, lng: 9.612 },
  { id: 'biberach', name: 'Biberach an der Riß', lat: 48.097, lng: 9.787 },
  { id: 'offenburg', name: 'Offenburg', lat: 48.473, lng: 7.945 },
  { id: 'baden_baden', name: 'Baden-Baden', lat: 48.761, lng: 8.24 },
  { id: 'ludwigsburg', name: 'Ludwigsburg', lat: 48.897, lng: 9.192 },
  { id: 'aalen', name: 'Aalen', lat: 48.837, lng: 10.093 },
  { id: 'schwaebisch_hall', name: 'Schwäbisch Hall', lat: 49.112, lng: 9.737 },
  { id: 'sigmaringen', name: 'Sigmaringen', lat: 48.087, lng: 9.216 },
  { id: 'calw', name: 'Calw', lat: 48.714, lng: 8.739 },
  { id: 'rottweil', name: 'Rottweil', lat: 48.168, lng: 8.625 },
  { id: 'tuttlingen', name: 'Tuttlingen', lat: 47.985, lng: 8.818 },
  { id: 'loerrach', name: 'Lörrach', lat: 47.614, lng: 7.664 },
  { id: 'goeppingen', name: 'Göppingen', lat: 48.703, lng: 9.652 },
  { id: 'heidenheim', name: 'Heidenheim an der Brenz', lat: 48.676, lng: 10.152 },
  { id: 'esslingen', name: 'Esslingen am Neckar', lat: 48.742, lng: 9.32 },
  { id: 'boeblingen', name: 'Böblingen', lat: 48.685, lng: 9.012 },
  { id: 'mosbach', name: 'Mosbach', lat: 49.353, lng: 9.151 },
  { id: 'crailsheim', name: 'Crailsheim', lat: 49.137, lng: 10.073 },
];

const LANDKREIS_REGION = {
  'Schwarzwald-Baar-Kreis': 'Schwarzwald',
  'Breisgau-Hochschwarzwald': 'Breisgau',
  'Ortenaukreis': 'Ortenau',
  'Ravensburg': 'Bodensee',
  'Biberach': 'Oberschwaben',
  'Alb-Donau-Kreis': 'Donau-Alb',
  'Schwäbisch Hall': 'Franken',
  'Ostalbkreis': 'Ostwürttemberg',
  'Main-Tauber-Kreis': 'Tauberfranken',
  'Neckar-Odenwald-Kreis': 'Odenwald',
  'Zollernalbkreis': 'Alb',
  'Sigmaringen': 'Oberschwaben',
  'Tuttlingen': 'Schwarzwald',
  'Waldshut': 'Hochrhein',
  'Konstanz': 'Bodensee',
  'Rottweil': 'Schwarzwald',
  'Freudenstadt': 'Schwarzwald',
  'Calw': 'Nordschwarzwald',
  'Reutlingen': 'Neckar-Alb',
  'Tübingen': 'Neckar-Alb',
  'Hohenlohekreis': 'Hohenlohe',
  'Heidenheim': 'Ostwürttemberg',
  'Rems-Murr-Kreis': 'Stuttgart Region',
  'Göppingen': 'Stuttgart Region',
  'Böblingen': 'Stuttgart Region',
  'Esslingen': 'Stuttgart Region',
  'Ludwigsburg': 'Stuttgart Region',
  'Heilbronn': 'Heilbronn Region',
  'Stuttgart': 'Stuttgart Region',
  'Enzkreis': 'Enzkreis',
  'Karlsruhe': 'Karlsruhe Region',
  'Rastatt': 'Murg-Neckar',
  'Rhein-Neckar-Kreis': 'Rhein-Neckar',
  'Baden-Baden': 'Baden',
  'Heidelberg': 'Rhein-Neckar',
  'Mannheim': 'Rhein-Neckar',
  'Pforzheim': 'Nordschwarzwald',
  'Emmendingen': 'Breisgau',
  'Lörrach': 'Markgräflerland',
  'Freiburg im Breisgau': 'Breisgau',
  'Ulm': 'Donau',
  'Bodenseekreis': 'Bodensee',
};

const REGIERUNGSBEZIRK_BY_LK = {
  'Schwarzwald-Baar-Kreis': 'Freiburg',
  'Breisgau-Hochschwarzwald': 'Freiburg',
  'Ortenaukreis': 'Freiburg',
  'Emmendingen': 'Freiburg',
  'Lörrach': 'Freiburg',
  'Rottweil': 'Freiburg',
  'Tuttlingen': 'Freiburg',
  'Waldshut': 'Freiburg',
  'Konstanz': 'Freiburg',
  'Freiburg im Breisgau': 'Freiburg',
  'Ravensburg': 'Tübingen',
  'Biberach': 'Tübingen',
  'Alb-Donau-Kreis': 'Tübingen',
  'Bodenseekreis': 'Tübingen',
  'Reutlingen': 'Tübingen',
  'Sigmaringen': 'Tübingen',
  'Tübingen': 'Tübingen',
  'Zollernalbkreis': 'Tübingen',
  'Ulm': 'Tübingen',
  'Böblingen': 'Stuttgart',
  'Esslingen': 'Stuttgart',
  'Göppingen': 'Stuttgart',
  'Heidenheim': 'Stuttgart',
  'Heilbronn': 'Stuttgart',
  'Hohenlohekreis': 'Stuttgart',
  'Ludwigsburg': 'Stuttgart',
  'Main-Tauber-Kreis': 'Stuttgart',
  'Ostalbkreis': 'Stuttgart',
  'Rems-Murr-Kreis': 'Stuttgart',
  'Schwäbisch Hall': 'Stuttgart',
  'Stuttgart': 'Stuttgart',
  'Calw': 'Karlsruhe',
  'Enzkreis': 'Karlsruhe',
  'Freudenstadt': 'Karlsruhe',
  'Karlsruhe': 'Karlsruhe',
  'Neckar-Odenwald-Kreis': 'Karlsruhe',
  'Rastatt': 'Karlsruhe',
  'Rhein-Neckar-Kreis': 'Karlsruhe',
  'Baden-Baden': 'Karlsruhe',
  'Heidelberg': 'Karlsruhe',
  'Mannheim': 'Karlsruhe',
  'Pforzheim': 'Karlsruhe',
};

/** Bbox [south, west, north, east] — candidate sort heuristic */
const LANDKREIS_BBOX = {
  'Schwarzwald-Baar-Kreis': [47.95, 8.15, 48.25, 8.75],
  'Breisgau-Hochschwarzwald': [47.75, 7.65, 48.15, 8.05],
  'Ortenaukreis': [48.35, 7.75, 48.65, 8.25],
  'Ravensburg': [47.55, 9.35, 47.95, 10.05],
  'Biberach': [47.95, 9.55, 48.15, 10.15],
  'Alb-Donau-Kreis': [48.25, 9.55, 48.55, 10.25],
  'Schwäbisch Hall': [48.95, 9.55, 49.25, 10.15],
  'Ostalbkreis': [48.75, 9.75, 49.05, 10.35],
  'Main-Tauber-Kreis': [49.35, 9.35, 49.65, 10.05],
  'Neckar-Odenwald-Kreis': [49.25, 8.95, 49.55, 9.55],
  'Zollernalbkreis': [48.15, 8.75, 48.45, 9.25],
  'Sigmaringen': [47.95, 9.05, 48.25, 9.55],
  'Tuttlingen': [47.95, 8.65, 48.15, 9.05],
  'Waldshut': [47.55, 8.15, 47.85, 8.75],
  'Konstanz': [47.65, 8.85, 47.95, 9.35],
  'Rottweil': [47.95, 8.45, 48.25, 8.95],
  'Freudenstadt': [48.25, 8.25, 48.55, 8.75],
  'Calw': [48.55, 8.55, 48.85, 9.05],
  'Reutlingen': [48.35, 9.25, 48.55, 9.65],
  'Tübingen': [48.35, 8.95, 48.55, 9.35],
  'Hohenlohekreis': [49.05, 9.35, 49.35, 9.95],
  'Heidenheim': [48.55, 10.05, 48.85, 10.45],
  'Rems-Murr-Kreis': [48.75, 9.25, 49.05, 9.75],
  'Göppingen': [48.55, 9.55, 48.85, 10.05],
  'Böblingen': [48.55, 8.75, 48.85, 9.15],
  'Esslingen': [48.65, 9.25, 48.85, 9.55],
  'Ludwigsburg': [48.85, 9.05, 49.15, 9.35],
  'Heilbronn': [49.05, 9.15, 49.25, 9.35],
  'Stuttgart': [48.65, 9.05, 48.85, 9.35],
  'Enzkreis': [48.85, 8.55, 49.15, 8.95],
  'Karlsruhe': [48.95, 8.35, 49.25, 8.75],
  'Rastatt': [48.65, 8.15, 48.85, 8.45],
  'Rhein-Neckar-Kreis': [49.25, 8.55, 49.55, 9.05],
  'Baden-Baden': [48.65, 8.15, 48.85, 8.35],
  'Heidelberg': [49.35, 8.55, 49.45, 8.75],
  'Mannheim': [49.45, 8.45, 49.55, 8.55],
  'Pforzheim': [48.85, 8.65, 48.95, 8.75],
  'Emmendingen': [48.05, 7.75, 48.25, 8.05],
  'Lörrach': [47.55, 7.55, 47.75, 7.85],
  'Freiburg im Breisgau': [47.95, 7.75, 48.05, 7.95],
  'Ulm': [48.35, 9.95, 48.45, 10.05],
  'Bodenseekreis': [47.55, 9.25, 47.85, 9.65],
};

const LANDKREIS_PRIORITY = [
  'Schwarzwald-Baar-Kreis',
  'Breisgau-Hochschwarzwald',
  'Ortenaukreis',
  'Ravensburg',
  'Biberach',
  'Alb-Donau-Kreis',
  'Schwäbisch Hall',
  'Ostalbkreis',
  'Main-Tauber-Kreis',
  'Neckar-Odenwald-Kreis',
  'Zollernalbkreis',
  'Sigmaringen',
  'Tuttlingen',
  'Waldshut',
  'Konstanz',
  'Rottweil',
  'Freudenstadt',
  'Calw',
  'Reutlingen',
  'Tübingen',
  'Hohenlohekreis',
  'Heidenheim',
  'Rems-Murr-Kreis',
  'Göppingen',
  'Böblingen',
  'Esslingen',
  'Ludwigsburg',
  'Heilbronn',
  'Stuttgart',
  'Enzkreis',
  'Karlsruhe',
  'Rastatt',
  'Rhein-Neckar-Kreis',
  'Baden-Baden',
  'Heidelberg',
  'Mannheim',
  'Pforzheim',
  'Emmendingen',
  'Lörrach',
  'Freiburg im Breisgau',
  'Ulm',
  'Bodenseekreis',
];

/** Baden-Württemberg state bbox for --fast verification */
const BW_BBOX = [47.51, 7.51, 49.79, 10.50];

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
  if (lat < 48.0) return 'Breisgau';
  if (lng > 9.8) return 'Ostwürttemberg';
  if (lng < 8.2) return 'Baden';
  return 'Schwaben';
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
  if (name.includes(' im ')) {
    aliases.add(name.replace(' im ', ' i. '));
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
    `    bundeslandId: 'DE-BW',`,
    `    federalState: 'Baden-Württemberg',`,
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
    headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (baden-wuerttemberg-import)' },
  });
  if (!res.ok) return null;
  const d = await res.json();
  const addr = d.address ?? {};
  const state = addr.state ?? '';
  if (
    !state.includes('Baden-Württemberg') &&
    !state.includes('Baden-Wuerttemberg') &&
    !state.includes('Baden-Wurttemberg')
  ) {
    return null;
  }
  const landkreis = normalizeLandkreis(addr.county ?? '');
  const municipality =
    addr.municipality ?? addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? null;
  return { landkreis: landkreis || null, municipality, display: d.display_name ?? '' };
}

const osmPath = path.join(__dir, 'osm-baden-wuerttemberg-places.json');
if (!fs.existsSync(osmPath)) {
  console.error('Run fetch-osm-baden-wuerttemberg-overpass.mjs first');
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
  outsideBadenWuerttemberg: 0,
};
const imported = [];
const byLandkreis = {};
const byRegierungsbezirk = {};

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
    const [s, w, n, e] = BW_BBOX;
    if (lat < s || lat > n || lng < w || lng > e) {
      skipped.outsideBadenWuerttemberg++;
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
  const tourism =
    p.name.startsWith('Bad ') ||
    /schwarzwald|bodensee|hochrhein|kur|markgräfler/i.test(region) ||
    /breisgau|ortenau/i.test(region);

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

  const lkKey = admin.landkreis ?? inferLandkreisSort(lat, lng);
  byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;
  const rb = REGIERUNGSBEZIRK_BY_LK[lkKey] ?? 'other';
  byRegierungsbezirk[rb] = (byRegierungsbezirk[rb] ?? 0) + 1;

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
  byLandkreis,
  byRegierungsbezirk,
  ids: imported.map((i) => i.id),
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
};

fs.writeFileSync(path.join(__dir, 'osm-baden-wuerttemberg-import-result.json'), JSON.stringify({ report, imported }, null, 2));
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

// ── Patch germanyBadenWuerttembergNodes.generated.ts ──
const nodesPath = path.join(ROOT, 'features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts');
let nodesSrc = fs.readFileSync(nodesPath, 'utf8');
const insertPoint = nodesSrc.lastIndexOf('];');
const newDefs = imported.map(formatDef).join('\n');
const beforeClose = nodesSrc.slice(0, insertPoint).trimEnd();
nodesSrc = `${beforeClose}\n${newDefs}\n${nodesSrc.slice(insertPoint)}`;
fs.writeFileSync(nodesPath, nodesSrc);

// ── Patch germanyBadenWuerttembergEnrichment.ts ──
const enrichPath = path.join(ROOT, 'features/map/data/germany/germanyBadenWuerttembergEnrichment.ts');
let enrichSrc = fs.readFileSync(enrichPath, 'utf8');
const enrichInsert = enrichSrc.lastIndexOf('};');
const newEnrich = `\n  // ── Baden-Württemberg batch import (OSM ${new Date().toISOString().slice(0, 10)}) ──\n${imported.map(formatEnrich).join('\n')}\n`;
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
  const newBlock = `\n  // Baden-Württemberg batch import\n${aliasLines.join('\n')}\n`;
  aliasSrc = `${aliasSrc.slice(0, closeIdx)}${newBlock}${aliasSrc.slice(closeIdx)}`;
  fs.writeFileSync(aliasPath, aliasSrc);
}

console.error(`Patched ${imported.length} settlements into TS files`);
