/**
 * Import OSM-verified Mecklenburg-Vorpommern settlements into generated TS files.
 *
 * Usage:
 *   node scripts/import-mecklenburg-vorpommern-settlements.mjs [--limit=400] [--chunk=400] [--dry-run] [--fast]
 *   node scripts/import-mecklenburg-vorpommern-settlements.mjs --resume --limit=400
 *
 * Nominatim: sequential only, >=1.2s delay, persistent verification cache, checkpoint progress.
 * Batch 1 soft caps distribute coverage; disable with --no-caps.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '400', 10);
const CHUNK_NEW = parseInt(process.argv.find((a) => a.startsWith('--chunk='))?.split('=')[1] ?? '0', 10);
const DRY = process.argv.includes('--dry-run');
const FAST = process.argv.includes('--fast');
const RESUME = process.argv.includes('--resume');
const NO_CAPS = process.argv.includes('--no-caps');
const MIN_DELAY_MS = 1200;
const USER_AGENT = 'EuroBusinessHub-Platform/1.0 (mecklenburg-vorpommern-import; contact=geo-data-import)';
const BACKOFF_429 = [30_000, 60_000, 120_000, 300_000];
const MAX_RETRIES = 4;
let nominatimRequests = 0;
let http429Retries = 0;
const resumeSeedCount = { value: 0 };

const CACHE_PATH = path.join(__dir, 'osm-mecklenburg-vorpommern-verification-cache.json');
const CHECKPOINT_PATH = path.join(__dir, 'osm-mecklenburg-vorpommern-checkpoint.json');
const RESULT_PATH = path.join(__dir, 'osm-mecklenburg-vorpommern-import-result.json');

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3, isolated_dwelling: 4 };
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof|flughafen|industrie|hof\s|gut\s|camping|windpark|strand|düne|leuchtturm|fähre|marina|naturschutz|ferien|wohnanlage|siedlung\s+am|\()/i;
const ISOLATED_REJECT = /^(hof|gut|ausbau|kolonie|vorwerk|schäferei|mühle|försterei|jägerei|ziegelei|sägewerk|pumpwerk|gehöft)\b/i;

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
  'features/map/data/germany/germanyBayernNodes.generated.ts',
  'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts',
  'features/map/data/germany/germanyNiedersachsenNodes.generated.ts',
  'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts',
  'features/map/data/germany/germanyMecklenburgVorpommernNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'rostock', name: 'Rostock', lat: 54.092, lng: 12.140 },
  { id: 'schwerin', name: 'Schwerin', lat: 53.635, lng: 11.401 },
  { id: 'neubrandenburg', name: 'Neubrandenburg', lat: 53.557, lng: 13.261 },
  { id: 'stralsund', name: 'Stralsund', lat: 54.309, lng: 13.081 },
  { id: 'greifswald', name: 'Greifswald', lat: 54.086, lng: 13.392 },
  { id: 'wismar', name: 'Wismar', lat: 53.893, lng: 11.466 },
  { id: 'guestrow', name: 'Güstrow', lat: 53.795, lng: 12.174 },
  { id: 'hamburg', name: 'Hamburg', lat: 53.551, lng: 9.993 },
  { id: 'luebeck', name: 'Lübeck', lat: 53.866, lng: 10.687 },
  { id: 'berlin', name: 'Berlin', lat: 52.520, lng: 13.405 },
];

const LANDKREIS_REGION = {
  Rostock: 'Hansestadt Rostock',
  Schwerin: 'Schwerin',
  'Landkreis Rostock': 'Mittleres Mecklenburg',
  'Ludwigslust-Parchim': 'Westmecklenburg',
  'Mecklenburgische Seenplatte': 'Seenplatte',
  Nordwestmecklenburg: 'Westmecklenburg',
  'Vorpommern-Greifswald': 'Vorpommern',
  'Vorpommern-Rügen': 'Vorpommern',
};

const LANDKREIS_BBOX = {
  Rostock: [54.05, 12.00, 54.22, 12.25],
  Schwerin: [53.58, 11.30, 53.70, 11.50],
  'Landkreis Rostock': [53.75, 11.70, 54.35, 12.85],
  'Ludwigslust-Parchim': [53.10, 10.70, 53.75, 12.20],
  'Mecklenburgische Seenplatte': [53.15, 12.15, 53.85, 13.75],
  Nordwestmecklenburg: [53.70, 10.85, 54.10, 11.85],
  'Vorpommern-Greifswald': [53.55, 13.20, 54.25, 14.45],
  'Vorpommern-Rügen': [54.15, 12.60, 54.70, 13.80],
};

const LANDKREIS_PRIORITY = [
  'Mecklenburgische Seenplatte',
  'Vorpommern-Greifswald',
  'Vorpommern-Rügen',
  'Ludwigslust-Parchim',
  'Landkreis Rostock',
  'Nordwestmecklenburg',
  'Rostock',
  'Schwerin',
];

/** Soft caps for Batch 1 geographic balance. Sum > 400 so LIMIT is the hard stop. */
const LANDKREIS_CAPS = {
  'Mecklenburgische Seenplatte': 75,
  'Vorpommern-Greifswald': 70,
  'Vorpommern-Rügen': 55,
  'Ludwigslust-Parchim': 65,
  'Landkreis Rostock': 60,
  Nordwestmecklenburg: 50,
  Rostock: 10,
  Schwerin: 10,
};

const ISLAND_BBOX = {
  Rügen: [54.25, 13.10, 54.70, 13.80],
  Usedom: [53.85, 13.75, 54.15, 14.30],
  Hiddensee: [54.50, 13.05, 54.62, 13.18],
  Poel: [53.97, 11.40, 54.05, 11.52],
};

const MV_BBOX = [53.05, 10.55, 54.75, 14.45];

const MAJOR_EXCLUDE = [
  'rostock', 'schwerin', 'neubrandenburg', 'stralsund', 'greifswald', 'wismar', 'guestrow', 'gustrow',
];

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

function normalizeLandkreis(raw) {
  if (!raw) return null;
  let s = raw.replace(/^Landkreis\s+/, '').replace(/^Kreis\s+/, '').replace(/^Stadt\s+/, '')
    .replace(/^Hansestadt\s+/, '').replace(/^Region\s+/, '').trim();
  const aliases = {
    Rostock: 'Rostock',
    'Landkreis Rostock': 'Landkreis Rostock',
    Schwerin: 'Schwerin',
    'Ludwigslust-Parchim': 'Ludwigslust-Parchim',
    'Mecklenburgische Seenplatte': 'Mecklenburgische Seenplatte',
    Nordwestmecklenburg: 'Nordwestmecklenburg',
    'Vorpommern-Greifswald': 'Vorpommern-Greifswald',
    'Vorpommern-Rügen': 'Vorpommern-Rügen',
    'Vorpommern-Rugen': 'Vorpommern-Rügen',
    'Bad Doberan': 'Landkreis Rostock',
    Güstrow: 'Landkreis Rostock',
    Demmin: 'Mecklenburgische Seenplatte',
    Müritz: 'Mecklenburgische Seenplatte',
    'Mecklenburg-Strelitz': 'Mecklenburgische Seenplatte',
    Parchim: 'Ludwigslust-Parchim',
    Ludwigslust: 'Ludwigslust-Parchim',
    'Nordvorpommern': 'Vorpommern-Rügen',
    Rügen: 'Vorpommern-Rügen',
    Ostvorpommern: 'Vorpommern-Greifswald',
    'Uecker-Randow': 'Vorpommern-Greifswald',
    Nordwestmecklenburg: 'Nordwestmecklenburg',
  };
  if (aliases[s]) return aliases[s];
  if (aliases[raw]) return aliases[raw];
  if (/^Rostock$/i.test(s)) return 'Rostock';
  if (/^Schwerin$/i.test(s)) return 'Schwerin';
  return s;
}

function inBbox(lat, lng, [s, w, n, e]) {
  return lat >= s && lat <= n && lng >= w && lng <= e;
}

function detectIsland(lat, lng, name) {
  for (const [island, bbox] of Object.entries(ISLAND_BBOX)) {
    if (inBbox(lat, lng, bbox)) return island;
  }
  if (/usedom|heringsdorf|ahlbeck|karlshagen|zingst|darß|darss|hiddensee|rügen|ruegen|\bpoel\b/i.test(name)) {
    if (/hiddensee/i.test(name)) return 'Hiddensee';
    if (/\bpoel\b/i.test(name)) return 'Poel';
    if (/usedom|heringsdorf|ahlbeck|karlshagen/i.test(name)) return 'Usedom';
    if (/rügen|ruegen|bergen auf|sassnitz|binz|sellin|göhren|goehren/i.test(name)) return 'Rügen';
  }
  return null;
}

function isCoastal(lat, lng, name, island) {
  if (island) return true;
  if (lat > 54.05 && lng > 11.3) return true;
  if (lng > 13.5 && lat > 53.7) return true;
  if (/hafen|strand|ostsee|küste|bodden|darß|darss|usedom|rügen/i.test(name)) return true;
  return false;
}

function inferLandkreisSort(lat, lng) {
  const hits = [];
  for (const [lk, bbox] of Object.entries(LANDKREIS_BBOX)) {
    if (inBbox(lat, lng, bbox)) hits.push(lk);
  }
  if (!hits.length) return 'other';
  const prefer = ['Rostock', 'Schwerin'];
  for (const p of prefer) if (hits.includes(p)) return p;
  for (const p of LANDKREIS_PRIORITY) if (hits.includes(p)) return p;
  return hits[0];
}

function sortPlacesList(list) {
  return [...list].sort((a, b) => {
    const pa = PLACE_PRIORITY[a.place] ?? 9;
    const pb = PLACE_PRIORITY[b.place] ?? 9;
    if (pa !== pb) return pa - pb;
    return (b.population ?? 0) - (a.population ?? 0) || a.name.localeCompare(b.name, 'de');
  });
}

function buildDistributedQueue(rawPlaces) {
  const byDistrict = new Map();
  const islands = [];
  for (const p of rawPlaces) {
    if (detectIsland(p.lat, p.lng, p.name)) {
      islands.push(p);
      continue;
    }
    const lk = inferLandkreisSort(p.lat, p.lng);
    if (!byDistrict.has(lk)) byDistrict.set(lk, []);
    byDistrict.get(lk).push(p);
  }
  for (const [lk, list] of byDistrict) byDistrict.set(lk, sortPlacesList(list));
  const order = [...LANDKREIS_PRIORITY, 'other'];
  const maxRound = Math.max(...[...byDistrict.values()].map((l) => l.length), 0);
  const queue = [...sortPlacesList(islands)];
  for (let r = 0; r < maxRound; r++) {
    for (const lk of order) {
      const list = byDistrict.get(lk);
      if (list && r < list.length) queue.push(list[r]);
    }
  }
  return queue;
}

function loadExistingIds({ excludeMvGenerated = false } = {}) {
  const ids = new Set();
  const coords = [];
  const namesByLandkreis = new Map();
  for (const f of SEED_FILES) {
    if (excludeMvGenerated && f.includes('germanyMecklenburgVorpommernNodes.generated')) continue;
    const fullPath = path.join(ROOT, f);
    if (!fs.existsSync(fullPath)) continue;
    const src = fs.readFileSync(fullPath, 'utf8');
    for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
    for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.-]+)[\s\S]*?lng:\s*([\d.-]+)/g)) {
      coords.push({ id: m[1], lat: +m[2], lng: +m[3] });
    }
    for (const block of src.split(/\{\s*\n/)) {
      const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
      const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
      const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
      if (!idM || !nameM) continue;
      ids.add(slug(nameM[1]));
      if (lkM) {
        const norm = slug(nameM[1].replace(/\s*\([^)]*\)/g, '').trim());
        if (!namesByLandkreis.has(lkM[1])) namesByLandkreis.set(lkM[1], new Set());
        namesByLandkreis.get(lkM[1]).add(norm);
      }
    }
  }
  for (const id of MAJOR_EXCLUDE) ids.add(id);
  return { ids, coords, namesByLandkreis };
}

function distKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestHub(lat, lng) {
  let best = HUBS[0], bestD = Infinity;
  for (const h of HUBS) {
    const d = distKm({ lat, lng }, h);
    if (d < bestD) { bestD = d; best = h; }
  }
  return best;
}

function estimatePopulation(place, osmPop) {
  if (osmPop && osmPop > 0) return osmPop;
  return { city: 55000, town: 4500, village: 900, hamlet: 250, isolated_dwelling: 80 }[place] ?? 800;
}

function inferRegion(landkreis, lat, lng, island) {
  if (island === 'Rügen' || island === 'Hiddensee') return 'Vorpommern';
  if (island === 'Usedom') return 'Vorpommern';
  if (island === 'Poel') return 'Westmecklenburg';
  if (landkreis && LANDKREIS_REGION[landkreis]) return LANDKREIS_REGION[landkreis];
  const lk = inferLandkreisSort(lat, lng);
  if (lk !== 'other' && LANDKREIS_REGION[lk]) return LANDKREIS_REGION[lk];
  if (lng > 13.0) return 'Vorpommern';
  if (lat < 53.5) return 'Seenplatte';
  return 'Mecklenburg';
}

function coordKey(lat, lng) { return `${lat.toFixed(5)},${lng.toFixed(5)}`; }

function isNearExisting(lat, lng, coords, thresholdKm = 0.05) {
  for (const c of coords) if (distKm({ lat, lng }, c) < thresholdKm) return c.id;
  return null;
}

function buildAliases({ name, id }) {
  const aliases = new Set();
  const ascii = name.normalize('NFD').replace(/\p{M}/gu, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  if (ascii !== name) aliases.add(ascii);
  if (name.includes('-')) aliases.add(name.replace(/-/g, ' '));
  if (name.includes(' ')) aliases.add(name.replace(/\s+/g, '-'));
  if (name.startsWith('Bad ')) aliases.add(name.replace('Bad ', ''));
  aliases.delete(name); aliases.delete(id);
  return [...aliases].filter(Boolean).slice(0, 6);
}

function scaleMetrics(pop) {
  const companies = Math.max(28, Math.min(120, Math.round(pop / 120)));
  return {
    companies, jobs: Math.max(12, Math.round(companies * 0.38)),
    warehouses: Math.max(1, Math.round(companies / 35)),
    transport: Math.max(8, Math.round(companies * 0.45)),
    marketplace: Math.max(10, Math.round(companies * 0.55)),
    aiScore: Math.min(72, 42 + Math.round(pop / 8000)),
  };
}

function formatDef(d) {
  const lines = [
    '  {', `    id: '${d.id}',`, `    name: '${d.name.replace(/'/g, "\\'")}',`,
    `    lat: ${d.lat}, lng: ${d.lng},`, `    bundeslandId: 'DE-MV',`,
    `    federalState: 'Mecklenburg-Vorpommern',`, `    region: '${d.region}',`,
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

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function cacheKey(osmId, lat, lng) {
  return `node/${osmId}@${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
}

function loadVerificationCache() {
  if (!fs.existsSync(CACHE_PATH)) return { updatedAt: null, entries: {} };
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    return { updatedAt: raw.updatedAt ?? null, entries: raw.entries ?? {} };
  } catch {
    return { updatedAt: null, entries: {} };
  }
}

function saveVerificationCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify({
    updatedAt: new Date().toISOString(),
    count: Object.keys(cache.entries).length,
    entries: cache.entries,
  }, null, 2));
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_PATH)) {
    return { updatedAt: null, importedCount: 0, processedKeys: [], deferred: [], failed: [], byLandkreis: {} };
  }
  try { return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8')); }
  catch {
    return { updatedAt: null, importedCount: 0, processedKeys: [], deferred: [], failed: [], byLandkreis: {} };
  }
}

function saveCheckpoint(cp) {
  cp.updatedAt = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
}

function parseAdminFromNominatim(d, lat, lng) {
  const state = d.address?.state ?? '';
  if (!state.includes('Mecklenburg-Vorpommern') && !state.includes('Mecklenburg-Western Pomerania')) {
    return { ok: false, reason: 'outside-mv' };
  }
  const country = d.address?.country_code ?? '';
  if (country && country !== 'de') return { ok: false, reason: 'outside-de' };

  let landkreis = normalizeLandkreis(d.address?.county ?? d.address?.state_district ?? '') || null;
  const city = d.address?.city ?? d.address?.town ?? '';
  if (!landkreis) {
    if (/^Rostock$/i.test(city)) landkreis = 'Rostock';
    else if (/^Schwerin$/i.test(city)) landkreis = 'Schwerin';
  }
  // Island → district inference when county missing
  if (!landkreis) {
    const island = detectIsland(lat, lng, city || '');
    if (island === 'Rügen' || island === 'Hiddensee') landkreis = 'Vorpommern-Rügen';
    if (island === 'Usedom') landkreis = 'Vorpommern-Greifswald';
    if (island === 'Poel') landkreis = 'Nordwestmecklenburg';
  }
  if (!landkreis) {
    const inferred = inferLandkreisSort(lat, lng);
    if (inferred !== 'other') landkreis = inferred;
  }

  return {
    ok: true,
    landkreis,
    municipality: d.address?.municipality ?? d.address?.city ?? d.address?.town ?? d.address?.village ?? null,
  };
}

async function reverseVerify(lat, lng, { osmId, onBeforeWait } = {}) {
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    nominatimRequests++;
    const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
      lat: String(lat), lon: String(lng), format: 'json', addressdetails: '1', zoom: '10',
    })}`;
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    } catch (err) {
      if (attempt >= MAX_RETRIES) return { status: 'failed', reason: `network:${err?.message ?? 'error'}` };
      const wait = BACKOFF_429[Math.min(attempt, BACKOFF_429.length - 1)];
      console.error(`NET ${osmId ?? '?'} attempt=${attempt + 1} wait=${wait}ms`);
      if (typeof onBeforeWait === 'function') onBeforeWait({ kind: 'network', osmId, attempt, wait });
      await sleep(wait);
      attempt++;
      continue;
    }

    if (res.status === 429) {
      http429Retries++;
      if (attempt >= MAX_RETRIES) return { status: 'deferred', reason: 'http-429' };
      const retryAfter = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 300_000)
        : BACKOFF_429[Math.min(attempt, BACKOFF_429.length - 1)];
      console.error(`429 ${osmId ?? '?'} attempt=${attempt + 1}/${MAX_RETRIES} wait=${wait}ms`);
      if (typeof onBeforeWait === 'function') onBeforeWait({ kind: 'http-429', osmId, attempt, wait });
      await sleep(wait);
      attempt++;
      continue;
    }

    if (res.status >= 500) {
      if (attempt >= MAX_RETRIES) return { status: 'failed', reason: `http-${res.status}` };
      const wait = BACKOFF_429[Math.min(attempt, BACKOFF_429.length - 1)];
      console.error(`5xx ${osmId ?? '?'} status=${res.status} wait=${wait}ms`);
      if (typeof onBeforeWait === 'function') onBeforeWait({ kind: 'http-5xx', osmId, attempt, wait });
      await sleep(wait);
      attempt++;
      continue;
    }

    if (!res.ok) return { status: 'rejected', reason: `http-${res.status}` };
    const d = await res.json();
    const parsed = parseAdminFromNominatim(d, lat, lng);
    if (!parsed.ok) return { status: 'rejected', reason: parsed.reason };
    return { status: 'ok', landkreis: parsed.landkreis, municipality: parsed.municipality };
  }
  return { status: 'deferred', reason: 'max-retries' };
}

function underCap(landkreis, byLandkreis) {
  if (NO_CAPS) return true;
  if (!landkreis) return true;
  const cap = LANDKREIS_CAPS[landkreis];
  if (cap == null) return (byLandkreis[landkreis] ?? 0) < 40;
  return (byLandkreis[landkreis] ?? 0) < cap;
}

function chunkTarget(seedCount) {
  if (CHUNK_NEW > 0) return Math.min(LIMIT, seedCount + CHUNK_NEW);
  return LIMIT;
}

function isValidIsolatedDwelling(p) {
  if (p.place !== 'isolated_dwelling') return true;
  if (!p.name || p.name.length < 3) return false;
  if (ISOLATED_REJECT.test(p.name)) return false;
  if (SKIP_NAME.test(p.name)) return false;
  // Require capitalized multi-letter settlement-like name (already true for OSM names)
  if (/^\d/.test(p.name)) return false;
  return true;
}

const osmPath = path.join(__dir, 'osm-mecklenburg-vorpommern-places.json');
if (!fs.existsSync(osmPath)) {
  console.error('Run fetch-osm-mecklenburg-vorpommern-overpass.mjs first');
  process.exit(1);
}

const { places: rawPlacesAll } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
const rawPlaces = rawPlacesAll.filter(isValidIsolatedDwelling);
const places = buildDistributedQueue(rawPlaces);
const { ids: existingIds, coords: existingCoords, namesByLandkreis } = loadExistingIds({
  excludeMvGenerated: RESUME,
});
const usedIds = new Set(existingIds);
const usedCoords = new Set(existingCoords.map((c) => coordKey(c.lat, c.lng)));
const usedSlugs = new Map();
const batchNamesByLandkreis = new Map();
const skipped = {
  duplicateId: 0, duplicateCoord: 0, nearExisting: 0, verifyFailed: 0,
  slugCollision: 0, duplicateName: 0, unsupportedName: 0, outsideMv: 0,
  kreisCap: 0, deferred429: 0, cacheHit: 0, parentOrtsteil: 0, ambiguousAdmin: 0,
  isolatedRejected: rawPlacesAll.length - rawPlaces.length,
};
const imported = [];
const byLandkreis = {};
let coastalCount = 0;
let islandCount = 0;
const deferred = [];
const failed = [];
const rejectedOutside = [];

const verificationCache = loadVerificationCache();
const checkpoint = loadCheckpoint();
const processedKeys = new Set(checkpoint.processedKeys ?? []);
const processedOsmIds = new Set(checkpoint.processedOsmIds ?? []);
const deferredRetryOsmIds = new Set();

function persistCheckpointSnapshot(extra = {}) {
  checkpoint.processedKeys = [...processedKeys];
  checkpoint.processedOsmIds = [...processedOsmIds];
  checkpoint.importedCount = imported.length;
  checkpoint.deferred = deferred;
  checkpoint.failed = failed;
  checkpoint.byLandkreis = { ...byLandkreis };
  checkpoint.phase = extra.phase ?? checkpoint.phase ?? 'importing';
  checkpoint.noCaps = NO_CAPS;
  checkpoint.batchLimit = LIMIT;
  if (extra.queueExhausted != null) checkpoint.queueExhausted = extra.queueExhausted;
  saveCheckpoint(checkpoint);
}

function persistResultSnapshot(extraReport = {}) {
  fs.writeFileSync(RESULT_PATH, JSON.stringify({
    report: {
      totalSourceCandidates: rawPlacesAll.length,
      filteredCandidates: rawPlaces.length,
      verifiedCandidates,
      imported: imported.length,
      newlyImported,
      skipped,
      byLandkreis,
      coastalCount,
      islandCount,
      deferred: deferred.length,
      failed: failed.length,
      nominatimRequests,
      http429Retries,
      mode: FAST ? 'fast-bbox' : 'nominatim-reverse',
      resumeSafe: true,
      noCaps: NO_CAPS,
      ...extraReport,
    },
    imported,
    deferred,
    failed,
    rejectedOutside,
  }, null, 2));
}

for (const osmId of processedOsmIds) processedKeys.add(`osm:${osmId}`);

if (RESUME && fs.existsSync(RESULT_PATH)) {
  try {
    const prev = JSON.parse(fs.readFileSync(RESULT_PATH, 'utf8'));
    for (const e of prev.imported ?? []) {
      if (!e?.id || usedIds.has(e.id)) continue;
      imported.push(e);
      usedIds.add(e.id);
      usedCoords.add(coordKey(e.lat, e.lng));
      usedSlugs.set(e.id, e.id);
      existingCoords.push({ id: e.id, lat: e.lat, lng: e.lng });
      const lkKey = e.landkreis ?? inferLandkreisSort(e.lat, e.lng);
      byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;
      if (e.coastal) coastalCount++;
      if (e.island) islandCount++;
      if (e.landkreis) {
        const norm = slug(e.name.replace(/\s*\([^)]*\)/g, '').trim());
        if (!batchNamesByLandkreis.has(e.landkreis)) batchNamesByLandkreis.set(e.landkreis, new Set());
        batchNamesByLandkreis.get(e.landkreis).add(norm);
      }
      if (e.osmId) {
        processedOsmIds.add(e.osmId);
        processedKeys.add(cacheKey(e.osmId, e.lat, e.lng));
        processedKeys.add(`osm:${e.osmId}`);
      }
    }
    for (const d of prev.deferred ?? []) {
      if (!d?.osmId) continue;
      deferredRetryOsmIds.add(d.osmId);
      processedOsmIds.delete(d.osmId);
      processedKeys.delete(`osm:${d.osmId}`);
      if (d.lat != null && d.lng != null) processedKeys.delete(cacheKey(d.osmId, d.lat, d.lng));
      const cacheEntryKey = Object.keys(verificationCache.entries).find((k) => verificationCache.entries[k]?.osmId === d.osmId);
      if (cacheEntryKey && verificationCache.entries[cacheEntryKey]?.status === 'deferred') {
        delete verificationCache.entries[cacheEntryKey];
      }
    }
    for (const f of prev.failed ?? []) {
      failed.push(f);
      if (f?.osmId) processedOsmIds.add(f.osmId);
    }
    resumeSeedCount.value = imported.length;
    console.error(`Resume seed: ${imported.length} (no-caps=${NO_CAPS}, deferredRetry=${deferredRetryOsmIds.size})`);
  } catch (err) {
    console.error('Resume seed failed:', err?.message);
  }
}

for (const [key, entry] of Object.entries(verificationCache.entries)) {
  if (entry?.status !== 'deferred' || entry.osmId == null) continue;
  deferredRetryOsmIds.add(entry.osmId);
  processedOsmIds.delete(entry.osmId);
  processedKeys.delete(`osm:${entry.osmId}`);
  processedKeys.delete(key);
  delete verificationCache.entries[key];
}
if (deferredRetryOsmIds.size) {
  saveVerificationCache(verificationCache);
  console.error(`Deferred retry queue unlocked: ${deferredRetryOsmIds.size}`);
}

const targetCount = chunkTarget(imported.length);
console.error(`Import target: ${targetCount} (seed=${imported.length}, limit=${LIMIT}, chunkNew=${CHUNK_NEW || 0})`);

let verifiedCandidates = imported.length;
const candidateByLk = { ...byLandkreis };
let newlyImported = 0;
let queueExhausted = true;
let processedSinceCheckpoint = 0;

if (deferredRetryOsmIds.size) {
  const deferredFirst = [];
  const rest = [];
  for (const p of places) {
    if (deferredRetryOsmIds.has(p.osmId)) deferredFirst.push(p);
    else rest.push(p);
  }
  places.length = 0;
  places.push(...deferredFirst, ...rest);
}

for (const p of places) {
  if (imported.length >= targetCount) {
    queueExhausted = false;
    break;
  }
  if (SKIP_NAME.test(p.name)) { skipped.unsupportedName++; continue; }
  if (p.place === 'city' && existingIds.has(p.id)) { skipped.duplicateId++; continue; }

  let id = p.id;
  if (usedIds.has(id) || existingIds.has(id) || (existingIds.has(slug(p.name)) && slug(p.name) !== id)) {
    skipped.duplicateId++; continue;
  }

  const lat = +Number(p.lat).toFixed(6);
  const lng = +Number(p.lng).toFixed(6);
  const ck = coordKey(lat, lng);
  const key = cacheKey(p.osmId, lat, lng);
  if (usedCoords.has(ck)) { skipped.duplicateCoord++; continue; }
  if (isNearExisting(lat, lng, existingCoords)) { skipped.nearExisting++; continue; }
  if (processedOsmIds.has(p.osmId) || (processedKeys.has(key) && imported.some((e) => e.osmId === p.osmId))) {
    continue;
  }

  const islandHint = detectIsland(lat, lng, p.name);
  if (!inBbox(lat, lng, MV_BBOX) && !islandHint) { skipped.outsideMv++; continue; }

  let admin;
  if (FAST) {
    const lk = inferLandkreisSort(lat, lng);
    admin = { landkreis: lk === 'other' ? null : lk, municipality: p.name, status: 'ok' };
  } else if (verificationCache.entries[key]?.status === 'ok') {
    const hit = verificationCache.entries[key];
    admin = { landkreis: hit.landkreis, municipality: hit.municipality, status: 'ok' };
    skipped.cacheHit++;
  } else if (verificationCache.entries[key]?.status === 'rejected') {
    const reason = verificationCache.entries[key].reason ?? 'cached-rejected';
    if (reason === 'outside-mv' || reason === 'outside-de') {
      skipped.outsideMv++;
      rejectedOutside.push({ osmId: p.osmId, id: p.id, name: p.name, reason });
    } else skipped.verifyFailed++;
    processedKeys.add(key);
    processedOsmIds.add(p.osmId);
    continue;
  } else {
    await sleep(MIN_DELAY_MS);
    admin = await reverseVerify(lat, lng, {
      osmId: p.osmId,
      onBeforeWait: () => {
        persistCheckpointSnapshot({ phase: 'waiting-backoff' });
        persistResultSnapshot({ waitingBackoff: true });
      },
    });
    if (admin.status === 'ok') {
      verificationCache.entries[key] = {
        osmId: p.osmId, id: p.id, name: p.name, lat, lng,
        landkreis: admin.landkreis, municipality: admin.municipality,
        verified: true, status: 'ok',
      };
      saveVerificationCache(verificationCache);
    } else if (admin.status === 'deferred') {
      verificationCache.entries[key] = {
        osmId: p.osmId, id: p.id, name: p.name, lat, lng,
        status: 'deferred', reason: admin.reason,
      };
      saveVerificationCache(verificationCache);
      deferred.push({ osmId: p.osmId, id: p.id, name: p.name, lat, lng, reason: admin.reason });
      skipped.deferred429++;
      processedSinceCheckpoint++;
      if (processedSinceCheckpoint % 10 === 0) {
        persistCheckpointSnapshot({ phase: 'importing' });
        persistResultSnapshot();
      }
      // Rate-limit safety: if many deferred in a row, stop resumably
      if (deferred.length >= 15 && newlyImported === 0) {
        console.error('STOP: heavy 429 deferrals with no new imports — leaving resumable checkpoint');
        queueExhausted = false;
        break;
      }
      continue;
    } else if (admin.status === 'failed') {
      failed.push({ osmId: p.osmId, id: p.id, name: p.name, reason: admin.reason });
      skipped.verifyFailed++;
      processedKeys.add(key);
      processedOsmIds.add(p.osmId);
      persistCheckpointSnapshot({ phase: 'importing' });
      continue;
    } else {
      verificationCache.entries[key] = {
        osmId: p.osmId, id: p.id, name: p.name, lat, lng,
        status: 'rejected', reason: admin.reason,
      };
      saveVerificationCache(verificationCache);
      if (admin.reason === 'outside-mv' || admin.reason === 'outside-de') {
        skipped.outsideMv++;
        rejectedOutside.push({ osmId: p.osmId, id: p.id, name: p.name, reason: admin.reason });
      } else skipped.verifyFailed++;
      processedKeys.add(key);
      processedOsmIds.add(p.osmId);
      processedSinceCheckpoint++;
      if (processedSinceCheckpoint % 20 === 0) {
        persistCheckpointSnapshot({ phase: 'importing' });
        persistResultSnapshot();
      }
      continue;
    }
  }

  if (!admin || admin.status !== 'ok') { skipped.verifyFailed++; continue; }

  verifiedCandidates++;
  const lkPre = admin.landkreis ?? inferLandkreisSort(lat, lng);
  candidateByLk[lkPre] = (candidateByLk[lkPre] ?? 0) + 1;

  if (!admin.landkreis) {
    skipped.ambiguousAdmin++;
    processedKeys.add(key);
    processedOsmIds.add(p.osmId);
    continue;
  }

  if (!underCap(lkPre, byLandkreis)) {
    skipped.kreisCap++;
    continue;
  }

  if (usedIds.has(id) || usedSlugs.has(id)) {
    const candidate = `${id}_osm_${p.osmId}`;
    if (usedIds.has(candidate)) { skipped.duplicateId++; continue; }
    id = candidate;
    skipped.slugCollision++;
  }
  if (usedIds.has(id)) { skipped.duplicateId++; continue; }

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (namesByLandkreis.get(admin.landkreis)?.has(norm) || batchNamesByLandkreis.get(admin.landkreis)?.has(norm)) {
      skipped.duplicateName++;
      skipped.parentOrtsteil++;
      processedKeys.add(key);
      processedOsmIds.add(p.osmId);
      continue;
    }
  }

  const hub = nearestHub(lat, lng);
  const population = estimatePopulation(p.place, p.population);
  const island = islandHint;
  const region = inferRegion(admin.landkreis, lat, lng, island);
  const coastal = isCoastal(lat, lng, p.name, island);
  const tourism = p.name.startsWith('Bad ')
    || Boolean(island)
    || /ostsee|rügen|ruegen|usedom|hiddensee|binz|sellin|göhren|heringsdorf|ahlbeck|darß|darss|bodden|kühlungsborn|kuhlungsborn/i.test(p.name)
    || (coastal && /bad |kurort|strand|seebad/i.test(p.name));

  const entry = {
    id, name: p.name, lat, lng, region,
    landkreis: admin.landkreis, municipality: admin.municipality,
    nearestMajorCityId: hub.id, nearestMajorCity: hub.name, population,
    tourism: tourism || undefined, osmId: p.osmId,
    coastal: coastal || undefined, island: island || undefined,
  };

  imported.push(entry);
  newlyImported++;
  usedIds.add(id); usedCoords.add(ck); usedSlugs.set(p.id, id);
  existingCoords.push({ id, lat, lng });
  processedKeys.add(key);
  processedOsmIds.add(p.osmId);
  if (coastal) coastalCount++;
  if (island) islandCount++;

  const lkKey = admin.landkreis ?? inferLandkreisSort(lat, lng);
  byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (!batchNamesByLandkreis.has(admin.landkreis)) batchNamesByLandkreis.set(admin.landkreis, new Set());
    batchNamesByLandkreis.get(admin.landkreis).add(norm);
  }

  persistCheckpointSnapshot({ phase: 'importing' });
  persistResultSnapshot();
  processedSinceCheckpoint++;

  if (imported.length % 25 === 0 || newlyImported <= 5 || newlyImported % 10 === 0) {
    console.error(`OK ${imported.length}/${targetCount} (+${newlyImported}) ${id} (${p.name}) [${lkKey}]${island ? ` island=${island}` : ''}`);
  }
}

imported.sort((a, b) => a.id.localeCompare(b.id));
const report = {
  totalSourceCandidates: rawPlacesAll.length,
  filteredCandidates: rawPlaces.length,
  verifiedCandidates,
  candidateByLk,
  imported: imported.length,
  newlyImported,
  resumeSeed: resumeSeedCount.value,
  targetCount,
  queueExhausted,
  skipped,
  byLandkreis,
  coastalCount,
  islandCount,
  deferred: deferred.length,
  failed: failed.length,
  nominatimRequests,
  http429Retries,
  cacheEntries: Object.keys(verificationCache.entries).length,
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
  landkreisCoverage: Object.keys(byLandkreis).length,
  mode: FAST ? 'fast-bbox' : 'nominatim-reverse',
  resumeSafe: true,
  noCaps: NO_CAPS,
};
fs.writeFileSync(RESULT_PATH, JSON.stringify({ report, imported, deferred, failed, rejectedOutside }, null, 2));
checkpoint.newlyImported = newlyImported;
persistCheckpointSnapshot({
  phase: queueExhausted && deferred.length === 0 ? 'complete' : (newlyImported > 0 ? 'chunk-complete' : 'partial'),
  queueExhausted,
});
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

const nodesPath = path.join(ROOT, 'features/map/data/germany/germanyMecklenburgVorpommernNodes.generated.ts');
const nodesHeader = `/** Mecklenburg-Vorpommern Tier-4 local settlements — OSM verified (generated) */
import type { RawLocalNodeDef } from './germanyLocalNodes.generated';

export const GERMANY_MV_NODE_DEFS: RawLocalNodeDef[] = [
`;
fs.writeFileSync(nodesPath, `${nodesHeader}${imported.map(formatDef).join('\n')}\n];\n`);

const enrichPath = path.join(ROOT, 'features/map/data/germany/germanyMecklenburgVorpommernEnrichment.ts');
const enrichHeader = `import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface MecklenburgVorpommernEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  tourismScore?: number;
  infra?: Partial<GermanyInfrastructure>;
}

function b(c: number, j: number, w: number, t: number, m: number, a: number): MetricsSlice {
  return { companies: c, jobs: j, warehouses: w, transport: t, marketplace: m, aiScore: a };
}

export const GERMANY_MV_ENRICHMENT: Record<string, MecklenburgVorpommernEnrichment> = {

  // ── Mecklenburg-Vorpommern OSM import (${new Date().toISOString().slice(0, 10)}) ──
`;
fs.writeFileSync(enrichPath, `${enrichHeader}${imported.map(formatEnrich).join('\n')}\n};\n`);

const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasMarker = '  // Mecklenburg-Vorpommern batch 1 import';
const aliasLines = imported.map((d) => ({ id: d.id, aliases: buildAliases(d) })).filter((x) => x.aliases.length)
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
console.error(`Wrote ${imported.length} settlements into TS files (+${newlyImported} this run)`);
